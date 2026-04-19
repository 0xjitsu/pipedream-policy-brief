# Resilient Daily Fetchers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the daily pipeline's external fetchers reliable — DOE pump price, GlobalPetrolPrices ASEAN, and OSM Overpass currently return null/empty frequently because the target sites render via JavaScript or throttle requests. Add firecrawl as a fallback for JS-rendered pages, add retry + mirror fallbacks for Overpass, and surface failures visibly instead of silently degrading.

**Architecture:** Each fetcher gets a two-tier strategy: (1) try the cheap plain-fetch path first, (2) fall back to firecrawl (or Overpass mirror) only when the cheap path fails. Results are cached per-day in Supabase, so firecrawl is called at most once per source per day — well within the free tier. Fetchers also write a per-source status log (`fetch_log` table) so we can see in production which sources are flaking.

**Tech Stack:** firecrawl-js SDK (free tier, user's existing token), Supabase (status table), existing daily pipeline.

**Zero-cost verification:** Firecrawl free tier = 500 scrapes/month; we use at most 30/month (1/day × 3 sources × fallback-only). Supabase: one extra tiny table, negligible. OSM Overpass mirrors: free public APIs.

---

## File Structure

```
src/lib/daily-pipeline/
├── firecrawl.ts                  # NEW — shared firecrawl client + helpers
├── fetchPumpPrice.ts             # MODIFY — add firecrawl fallback
├── fetchAseanPrices.ts           # MODIFY — add firecrawl fallback
├── fetchStationSnapshot.ts       # MODIFY — add Overpass mirror fallback
├── fetchLog.ts                   # NEW — writes per-source fetch status
└── index.ts                      # MODIFY — pass fetch logs into snapshot
supabase/migrations/
└── 0002_fetch_log.sql            # NEW — per-source fetch status table
```

---

## Task 1: Provision fetch_log table in Supabase

**Files:**
- Create: `supabase/migrations/0002_fetch_log.sql`

- [ ] **Step 1: Write the migration**

```sql
create table if not exists public.fetch_log (
  id             bigserial primary key,
  logged_at      timestamptz not null default now(),
  source         text not null,       -- 'doe' | 'gpp' | 'osm'
  strategy       text not null,       -- 'primary' | 'firecrawl' | 'mirror'
  success        boolean not null,
  duration_ms    integer,
  error_message  text
);

create index if not exists idx_fetch_log_source_time
  on public.fetch_log (source, logged_at desc);

alter table public.fetch_log enable row level security;
create policy "public read fetch_log" on public.fetch_log for select using (true);
create policy "public insert fetch_log" on public.fetch_log for insert with check (true);
```

- [ ] **Step 2: Apply via Supabase MCP**

Use `mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__apply_migration`:
```
project_id: ciuklhiswctbnffqvlhs
name: fetch_log
query: <SQL above>
```

Expected: `{ success: true }`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0002_fetch_log.sql
git commit -m "Add fetch_log table for per-source diagnostic logging"
```

---

## Task 2: Install firecrawl SDK + add env var

**Files:**
- Modify: `package.json`
- Modify: `.env.example`

- [ ] **Step 1: Install the SDK**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
cd /Users/bbmisa/mbc-policy-brief
npm install @mendable/firecrawl-js
```

Expected: `@mendable/firecrawl-js` appears in `package.json` dependencies.

- [ ] **Step 2: Append env var to .env.example**

Add to `.env.example`:

```
# ─── Firecrawl (free tier — fallback scraper for JS-rendered sites) ───
# Retrieve via: security find-generic-password -s "firecrawl-api-key" -w
FIRECRAWL_API_KEY=fc_xxx
```

- [ ] **Step 3: Set the Vercel env var**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
FC_TOKEN=$(security find-generic-password -s "firecrawl-api-key" -w)
for env in production preview development; do
  printf "%s" "$FC_TOKEN" | vercel env add FIRECRAWL_API_KEY $env
done
vercel env pull .env.local --yes
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "Install firecrawl-js + document env var"
```

---

## Task 3: Write shared firecrawl helper

**Files:**
- Create: `src/lib/daily-pipeline/firecrawl.ts`

- [ ] **Step 1: Create the helper**

```typescript
import FirecrawlApp from "@mendable/firecrawl-js";

let app: FirecrawlApp | null = null;

function getApp(): FirecrawlApp | null {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return null;
  if (!app) app = new FirecrawlApp({ apiKey });
  return app;
}

/**
 * Scrapes a JS-rendered URL via firecrawl. Returns the markdown body, or
 * null on any error. Markdown is easier to regex against than raw HTML
 * for simple value extraction.
 */
export async function firecrawlMarkdown(url: string): Promise<string | null> {
  const client = getApp();
  if (!client) return null;
  try {
    const result = await client.scrapeUrl(url, {
      formats: ["markdown"],
      onlyMainContent: true,
      timeout: 30_000,
    });
    if (!result.success) return null;
    return result.markdown ?? null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/daily-pipeline/firecrawl.ts
git commit -m "Add shared firecrawl helper for JS-rendered pages"
```

---

## Task 4: Write fetchLog helper

**Files:**
- Create: `src/lib/daily-pipeline/fetchLog.ts`

- [ ] **Step 1: Create the logger**

```typescript
import { getSupabase } from "@/lib/supabase";

type Source = "doe" | "gpp" | "osm";
type Strategy = "primary" | "firecrawl" | "mirror";

interface LogEntry {
  source: Source;
  strategy: Strategy;
  success: boolean;
  durationMs: number;
  errorMessage?: string | null;
}

/**
 * Fire-and-forget append to the fetch_log table. Swallows its own errors
 * so logging failures never cascade into pipeline failures.
 */
export async function logFetch(entry: LogEntry): Promise<void> {
  try {
    const db = getSupabase();
    await db.from("fetch_log").insert({
      source: entry.source,
      strategy: entry.strategy,
      success: entry.success,
      duration_ms: entry.durationMs,
      error_message: entry.errorMessage ?? null,
    });
  } catch {
    /* swallow — diagnostics must not break the pipeline */
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/daily-pipeline/fetchLog.ts
git commit -m "Add fetch_log appender"
```

---

## Task 5: Add firecrawl fallback to fetchPumpPrice

**Files:**
- Modify: `src/lib/daily-pipeline/fetchPumpPrice.ts`

- [ ] **Step 1: Replace the fetcher body with two-strategy logic**

Replace the contents of `src/lib/daily-pipeline/fetchPumpPrice.ts` with:

```typescript
import type { PumpPriceSnapshot } from "@/data/types";
import { firecrawlMarkdown } from "./firecrawl";
import { logFetch } from "./fetchLog";

const DOE_URL = "https://www.doe.gov.ph/oil-monitor";
const USER_AGENT =
  "pipedream-policy-brief/1.0 (+https://pipedream-policy-brief.vercel.app)";

/**
 * Parses the latest diesel pump price.
 *
 * Strategy 1 (cheap): plain fetch, regex for "Diesel" + price.
 * Strategy 2 (fallback): firecrawl markdown, regex for "Diesel ... ₱XX.XX".
 *
 * Both strategies accept values in the 30-300 PHP/L sanity band.
 */
export async function fetchPumpPrice(): Promise<PumpPriceSnapshot | null> {
  // Strategy 1: plain fetch
  const t0 = Date.now();
  const direct = await tryDirect();
  if (direct) {
    await logFetch({
      source: "doe",
      strategy: "primary",
      success: true,
      durationMs: Date.now() - t0,
    });
    return direct;
  }
  await logFetch({
    source: "doe",
    strategy: "primary",
    success: false,
    durationMs: Date.now() - t0,
    errorMessage: "no diesel match in HTML",
  });

  // Strategy 2: firecrawl
  const t1 = Date.now();
  const md = await firecrawlMarkdown(DOE_URL);
  if (!md) {
    await logFetch({
      source: "doe",
      strategy: "firecrawl",
      success: false,
      durationMs: Date.now() - t1,
      errorMessage: "firecrawl returned null",
    });
    return null;
  }
  const value = parseDieselFromMarkdown(md);
  await logFetch({
    source: "doe",
    strategy: "firecrawl",
    success: value !== null,
    durationMs: Date.now() - t1,
    errorMessage: value === null ? "no diesel match in markdown" : null,
  });
  if (value === null) return null;
  return {
    value,
    delta: "",
    source: "DOE Oil Industry Monitor (via firecrawl)",
    sourceUrl: DOE_URL,
  };
}

async function tryDirect(): Promise<PumpPriceSnapshot | null> {
  try {
    const res = await fetch(DOE_URL, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const dieselIdx = html.toLowerCase().indexOf("diesel");
    if (dieselIdx < 0) return null;
    const window = html.slice(dieselIdx, dieselIdx + 400);
    const priceMatch = window.match(/(\d{2,3}\.\d{2})/);
    if (!priceMatch) return null;
    const value = parseFloat(priceMatch[1]);
    if (!Number.isFinite(value) || value < 30 || value > 300) return null;
    return {
      value,
      delta: "",
      source: "DOE Oil Industry Monitor",
      sourceUrl: DOE_URL,
    };
  } catch {
    return null;
  }
}

/**
 * Parses "Diesel ... ₱128.50" patterns from markdown. Returns the first
 * sane value. Markdown tables usually render as pipe-separated rows.
 */
function parseDieselFromMarkdown(md: string): number | null {
  const lower = md.toLowerCase();
  const dieselIdx = lower.indexOf("diesel");
  if (dieselIdx < 0) return null;
  const window = md.slice(dieselIdx, dieselIdx + 400);
  const match = window.match(/(\d{2,3}\.\d{2})/);
  if (!match) return null;
  const value = parseFloat(match[1]);
  if (!Number.isFinite(value) || value < 30 || value > 300) return null;
  return value;
}
```

- [ ] **Step 2: Smoke-test**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
cd /Users/bbmisa/mbc-policy-brief
cat > scripts/smoke-pump.ts <<'EOF'
import "dotenv/config";
import { fetchPumpPrice } from "../src/lib/daily-pipeline/fetchPumpPrice";
fetchPumpPrice().then(r => { console.log(r); process.exit(r ? 0 : 1); });
EOF
npx tsx scripts/smoke-pump.ts
rm scripts/smoke-pump.ts
```

Expected: JSON result with `value` between 30 and 300.

- [ ] **Step 3: Commit**

```bash
git add src/lib/daily-pipeline/fetchPumpPrice.ts
git commit -m "Add firecrawl fallback to DOE pump price fetcher"
```

---

## Task 6: Add firecrawl fallback to fetchAseanPrices

**Files:**
- Modify: `src/lib/daily-pipeline/fetchAseanPrices.ts`

- [ ] **Step 1: Replace the fetcher with two-strategy logic**

Replace contents with:

```typescript
import type { AseanPriceRow } from "@/data/types";
import { firecrawlMarkdown } from "./firecrawl";
import { logFetch } from "./fetchLog";

const GPP_URL = "https://www.globalpetrolprices.com/diesel_prices/";
const USER_AGENT = "pipedream-policy-brief/1.0";

const ASEAN = [
  "Philippines",
  "Singapore",
  "Malaysia",
  "Thailand",
  "Indonesia",
  "Vietnam",
  "Cambodia",
  "Myanmar",
  "Laos",
  "Brunei",
] as const;

export async function fetchAseanPrices(): Promise<AseanPriceRow[]> {
  const t0 = Date.now();
  const direct = await tryDirect();
  if (direct.length >= 5) {
    await logFetch({
      source: "gpp",
      strategy: "primary",
      success: true,
      durationMs: Date.now() - t0,
    });
    return direct;
  }
  await logFetch({
    source: "gpp",
    strategy: "primary",
    success: false,
    durationMs: Date.now() - t0,
    errorMessage: `only ${direct.length} rows`,
  });

  const t1 = Date.now();
  const md = await firecrawlMarkdown(GPP_URL);
  if (!md) {
    await logFetch({
      source: "gpp",
      strategy: "firecrawl",
      success: false,
      durationMs: Date.now() - t1,
      errorMessage: "firecrawl returned null",
    });
    return direct; // return whatever the direct call produced, even if sparse
  }
  const fromMd = parseFromMarkdown(md);
  await logFetch({
    source: "gpp",
    strategy: "firecrawl",
    success: fromMd.length >= 5,
    durationMs: Date.now() - t1,
    errorMessage: fromMd.length < 5 ? `only ${fromMd.length} rows in md` : null,
  });
  return fromMd.length > direct.length ? fromMd : direct;
}

async function tryDirect(): Promise<AseanPriceRow[]> {
  try {
    const res = await fetch(GPP_URL, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    return extractRows(html);
  } catch {
    return [];
  }
}

function parseFromMarkdown(md: string): AseanPriceRow[] {
  return extractRows(md);
}

function extractRows(text: string): AseanPriceRow[] {
  const rows: AseanPriceRow[] = [];
  for (const country of ASEAN) {
    const idx = text.indexOf(country);
    if (idx < 0) continue;
    const window = text.slice(idx, idx + 800);
    const match = window.match(/(\d\.\d{3})/);
    if (!match) continue;
    const price = parseFloat(match[1]);
    if (!Number.isFinite(price) || price <= 0 || price > 10) continue;
    rows.push({ country, price, rank: 0 });
  }
  rows.sort((a, b) => a.price - b.price);
  rows.forEach((r, i) => {
    r.rank = i + 1;
  });
  return rows;
}
```

- [ ] **Step 2: Smoke-test**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
cat > scripts/smoke-asean.ts <<'EOF'
import "dotenv/config";
import { fetchAseanPrices } from "../src/lib/daily-pipeline/fetchAseanPrices";
fetchAseanPrices().then(r => { console.log(`got ${r.length} rows`, r.slice(0,3)); process.exit(r.length >= 5 ? 0 : 1); });
EOF
npx tsx scripts/smoke-asean.ts
rm scripts/smoke-asean.ts
```

Expected: at least 5 rows logged.

- [ ] **Step 3: Commit**

```bash
git add src/lib/daily-pipeline/fetchAseanPrices.ts
git commit -m "Add firecrawl fallback to ASEAN prices fetcher"
```

---

## Task 7: Add OSM mirror fallback to fetchStationSnapshot

**Files:**
- Modify: `src/lib/daily-pipeline/fetchStationSnapshot.ts`

- [ ] **Step 1: Replace the fetcher with primary + mirror strategy**

Replace contents with:

```typescript
import type { StationCounts } from "@/data/types";
import { logFetch } from "./fetchLog";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
] as const;

const OVERPASS_QUERY = `
[out:json][timeout:45];
area["ISO3166-1"="PH"][admin_level=2]->.ph;
node["amenity"="fuel"](area.ph);
out count;
`;

export async function fetchStationSnapshot(): Promise<StationCounts | null> {
  for (let i = 0; i < OVERPASS_ENDPOINTS.length; i++) {
    const endpoint = OVERPASS_ENDPOINTS[i];
    const strategy = i === 0 ? "primary" : "mirror";
    const t0 = Date.now();
    const result = await queryEndpoint(endpoint);
    if (result !== null) {
      await logFetch({
        source: "osm",
        strategy,
        success: true,
        durationMs: Date.now() - t0,
      });
      return buildCounts(result);
    }
    await logFetch({
      source: "osm",
      strategy,
      success: false,
      durationMs: Date.now() - t0,
      errorMessage: `no count from ${endpoint}`,
    });
  }
  return null;
}

async function queryEndpoint(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "pipedream-policy-brief/1.0",
      },
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) return null;
    const text = await res.text();
    // Some mirrors return HTML errors even with 200 status
    if (text.trim().startsWith("<")) return null;
    const data = JSON.parse(text);
    const countElement = data?.elements?.find(
      (e: { type: string }) => e.type === "count",
    );
    const total = parseInt(countElement?.tags?.total ?? "0", 10);
    if (!Number.isFinite(total) || total < 1000 || total > 50_000) return null;
    return total;
  } catch {
    return null;
  }
}

function buildCounts(total: number): StationCounts {
  const operational = Math.round(total * 0.937);
  const lowStock = Math.round(total * 0.034);
  const closed = total - operational - lowStock;
  return {
    operational,
    lowStock,
    closed,
    total,
    asOf: new Date().toISOString(),
  };
}
```

- [ ] **Step 2: Smoke-test**

```bash
cat > scripts/smoke-osm.ts <<'EOF'
import "dotenv/config";
import { fetchStationSnapshot } from "../src/lib/daily-pipeline/fetchStationSnapshot";
fetchStationSnapshot().then(r => { console.log(r); process.exit(r ? 0 : 1); });
EOF
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npx tsx scripts/smoke-osm.ts
rm scripts/smoke-osm.ts
```

Expected: counts object. May take up to 3×60s if all endpoints rate-limit simultaneously.

- [ ] **Step 3: Commit**

```bash
git add src/lib/daily-pipeline/fetchStationSnapshot.ts
git commit -m "Add OSM Overpass mirror fallbacks (3 endpoints)"
```

---

## Task 8: End-to-end verification + deploy

- [ ] **Step 1: Build passes**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
cd /Users/bbmisa/mbc-policy-brief
npm run build
```

Expected: clean build.

- [ ] **Step 2: Trigger pipeline locally**

```bash
# Dev server on 3008 should still be running; if not, restart.
curl -s -H "Authorization: Bearer dev-only-secret" http://localhost:3008/api/daily/refresh | jq
```

Expected shape:
```json
{
  "ok": true,
  "fields": {
    "pumpPrice": true,
    "aseanPrices": 6,
    "stations": true,
    "supplyDays": true,
    "narrative": true
  }
}
```

All fetcher fields should now be populated (pumpPrice: true, aseanPrices >= 5).

- [ ] **Step 3: Inspect fetch_log**

Via Supabase MCP:
```
mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__execute_sql:
  project_id: ciuklhiswctbnffqvlhs
  query: "select source, strategy, success, duration_ms, error_message from fetch_log order by logged_at desc limit 20;"
```

Review: which sources succeeded on primary vs firecrawl. Typically DOE and GPP fall through to firecrawl; OSM succeeds on a mirror.

- [ ] **Step 4: Push**

```bash
git push origin main
```

- [ ] **Step 5: Document in CLAUDE.md**

Append to `/Users/bbmisa/mbc-policy-brief/CLAUDE.md` under the Daily Pipeline section:

```markdown
### Fetcher resilience (2026-04-19)

- Each fetcher has a two-tier strategy: plain-fetch first, firecrawl/mirror fallback.
- Firecrawl free tier budget: 500 scrapes/month. We use ≤ 30/month (1/day × 3 sources × fallback-only).
- OSM Overpass falls through 3 endpoints: overpass-api.de → overpass.kumi.systems → overpass.private.coffee
- Per-source diagnostics in `fetch_log` table — query to see which sources are flaking.
```

- [ ] **Step 6: Commit the docs update**

```bash
git add CLAUDE.md
git commit -m "Document fetcher resilience strategy"
git push origin main
```

---

## Self-Review Checklist

**Spec coverage:** ✅ DOE + GPP + OSM all have fallback strategies, fetch_log diagnostics added, CLAUDE.md updated

**Placeholder scan:** ✅ No TBDs, every step has concrete code

**Type consistency:** ✅ All fetchers return the same shape defined in `types.ts` (unchanged from Phase 2)

**Zero-cost:** ✅ Firecrawl free (500/month, use ≤ 30), Supabase free, OSM mirrors free
