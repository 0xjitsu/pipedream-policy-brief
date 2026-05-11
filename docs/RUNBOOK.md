# Operational Runbook

Step-by-step playbooks for the daily pipeline and related infrastructure.
For architecture, see [`../ARCHITECTURE.md`](../ARCHITECTURE.md). For
contribution conventions, see [`../CONTRIBUTING.md`](../CONTRIBUTING.md).

---

## Trigger the daily cron manually

### Locally

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
cd /path/to/pipedream-policy-brief
grep -q "^CRON_SECRET=" .env.local || echo "CRON_SECRET=dev-only-secret" >> .env.local
npm run dev &
sleep 6
curl -s -H "Authorization: Bearer dev-only-secret" http://localhost:3000/api/daily/refresh | jq
```

Expected response:
```json
{
  "ok": true,
  "snapshotDate": "YYYY-MM-DD",
  "generatedAt": "...",
  "fields": {
    "pumpPrice": true|false,
    "aseanPrices": <number>,
    "stations": true|false,
    "supplyDays": true,
    "narrative": true
  }
}
```

`supplyDays` and `narrative` should always be `true`. The other fields
depend on whether the upstream scrapers succeeded today.

### Production

1. Open the Vercel dashboard → Project → Settings → Cron Jobs.
2. Find `/api/daily/refresh`.
3. Click "Run Now".

Vercel sets `CRON_SECRET` automatically — no manual auth needed.

---

## Inspect today's snapshot

Via Supabase MCP:

```
mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__execute_sql
  project_id: ciuklhiswctbnffqvlhs
  query: |
    select snapshot_date, generated_at,
           jsonb_pretty(pump_price) as pump,
           jsonb_pretty(stations) as stations,
           supply_days,
           narrative->>'headline' as headline
    from daily_snapshot
    order by snapshot_date desc
    limit 1;
```

Via REST API (publishable key, public read):

```bash
curl -s "https://ciuklhiswctbnffqvlhs.supabase.co/rest/v1/daily_snapshot?select=*&order=snapshot_date.desc&limit=1" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" | jq
```

---

## Debug a stale banner

Symptom: `<FreshnessBanner>` shows "Stale" warning (snapshot older than 36h).

1. Check the most recent `generated_at`:
   ```sql
   select snapshot_date, generated_at,
          extract(epoch from now() - generated_at) / 3600 as hours_old
   from daily_snapshot
   order by snapshot_date desc
   limit 3;
   ```
2. If `hours_old > 36`, the cron hasn't run successfully. Check Vercel
   dashboard → Cron Jobs → recent invocations for the failure reason.
3. Common failures and fixes:
   - **All three fetchers timed out**: trigger manually. Sometimes Overpass
     is overloaded at 06:00 UTC; a retry an hour later usually works.
   - **HuggingFace 503**: free tier capacity. The template fallback should
     still produce a snapshot — verify `narrative` is non-null.
   - **Supabase write failure**: check `SUPABASE_URL` and `SUPABASE_ANON_KEY`
     env vars in production are not redacted.
4. After identifying the root cause, trigger manually via the dashboard.

---

## Inspect per-source fetch health

The `fetch_log` table records every fetcher attempt with strategy and
duration. To see what's been failing this week:

```sql
select source, strategy, success, count(*) as n,
       round(avg(duration_ms)::numeric, 0) as avg_ms,
       max(error_message) as sample_error
from fetch_log
where logged_at > now() - interval '7 days'
group by 1, 2, 3
order by 1, 2, 3;
```

Healthy result: `osm/primary` or `osm/mirror` succeeds at least once per
day. `gpp/firecrawl` succeeds most days. `doe/firecrawl` succeeds rarely
(Cloudflare); `doe/google-news-rss` fills the gap.

---

## When a scraper breaks

The brief's UI degrades gracefully — when a fetcher returns `null`, the
metric falls back to the hardcoded value in `src/data/crisis-overview.ts`.
That means a broken scraper is **not a P0 incident**. Fix path:

### DOE pump price

DOE is Cloudflare-protected; we accept Google News RSS as the fallback.
If even Google News stops returning recent diesel-price articles:
- Edit `src/lib/daily-pipeline/fetchPumpPrice.ts` and adjust the
  `GOOGLE_NEWS_RSS` query terms.
- Last-resort manual override: update the static value in
  `src/data/crisis-overview.ts` and label its `tier` as `daily` with the
  current date.

### GPP ASEAN prices

GPP renders the price table as two ordered blocks paired by index.
If the page structure changes and the index-pair fails:
1. Fetch the page manually: `curl https://www.globalpetrolprices.com/diesel_prices/ > /tmp/gpp.html`.
2. Inspect the structure around country names and prices.
3. Update `extractRows` in `src/lib/daily-pipeline/fetchAseanPrices.ts`.

### OSM Overpass

Add a fourth mirror to `OVERPASS_ENDPOINTS` in
`src/lib/daily-pipeline/fetchStationSnapshot.ts`. Public mirror list:
`https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances`.

---

## Restore the pipeline after a Supabase outage

The `daily_snapshot` table uses `snapshot_date` as primary key. Re-running
the cron after an outage is idempotent — it upserts.

1. Confirm Supabase is responsive: `curl https://ciuklhiswctbnffqvlhs.supabase.co/rest/v1/`.
2. Trigger the cron manually (see "Trigger the daily cron manually" above).
3. Verify the new row landed (see "Inspect today's snapshot" above).

---

## Apply a pending Supabase migration

If `mcp__75cba7da-...__apply_migration` fails repeatedly with `net::ERR_FAILED`:

1. Open `https://supabase.com/dashboard/project/ciuklhiswctbnffqvlhs/sql/new`.
2. Paste the SQL from the relevant `supabase/migrations/*.sql` file.
3. Click "Run".
4. Verify via `list_tables` MCP call once it recovers, or via the
   dashboard Table Editor.

---

## Env-var rotation

If `SUPABASE_ANON_KEY` or `HUGGINGFACE_API_KEY` needs rotation:

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
NEW_VAL="..."
# Remove old
vercel env rm SUPABASE_ANON_KEY production
vercel env rm SUPABASE_ANON_KEY preview
vercel env rm SUPABASE_ANON_KEY development
# Add new
printf "%s" "$NEW_VAL" | vercel env add SUPABASE_ANON_KEY production
printf "%s" "$NEW_VAL" | vercel env add SUPABASE_ANON_KEY preview
printf "%s" "$NEW_VAL" | vercel env add SUPABASE_ANON_KEY development
# Trigger a new deploy
vercel --prod
```

Always use `printf "%s"`, never `echo` — `echo` appends a newline that
corrupts the stored value.
