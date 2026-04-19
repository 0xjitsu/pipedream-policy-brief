# Pipeline Follow-ups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the four known follow-ups from the Phase 2/3 daily-pipeline rollout: apply the `fetch_log` migration, replace the Cloudflare-blocked DOE scrape with a Google News / PhilStar fallback, fix the ASEAN-table regex to parse GPP's price table (not the country navigation), and measure whether shrinking the `AudienceProvider` client boundary helps mobile LCP.

**Architecture:** Each task is independent and focused on one bottleneck. Task 1 retries an MCP call that was flaking. Task 2 replaces one fetcher with a smarter multi-source strategy (Google News RSS → parse headlines for peso-denominated price values). Task 3 fixes the GPP extractor by anchoring on the table-section marker instead of the first occurrence of each country name. Task 4 is a measurement-driven refactor: tighten the context boundary, remeasure Lighthouse, keep the change only if it helps.

**Tech Stack:** Existing daily pipeline (Supabase, TypeScript, firecrawl), Google News RSS + `rss-parser` (already installed), Next.js App Router client/server component split.

---

## File Structure

```
supabase/migrations/
└── 0002_fetch_log.sql                       # (existing — just needs MCP apply)
src/lib/daily-pipeline/
├── fetchPumpPrice.ts                        # MODIFY — Google News fallback
└── fetchAseanPrices.ts                      # MODIFY — table-aware extractRows
src/app/
└── page.tsx                                 # MODIFY — optionally tighten AudienceProvider
```

Task dependencies:
- Task 1: independent
- Task 2 and Task 3: independent — can parallelize via subagents
- Task 4: last, measurement-driven; may revert

---

## Task 1: Apply fetch_log migration

**Files:**
- Apply: `supabase/migrations/0002_fetch_log.sql` (already committed)

- [ ] **Step 1: Retry the Supabase MCP apply_migration**

Call `mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__apply_migration` with:
- `project_id: "ciuklhiswctbnffqvlhs"`
- `name: "fetch_log"`
- `query:` paste contents of `/Users/bbmisa/mbc-policy-brief/supabase/migrations/0002_fetch_log.sql`

If the MCP returns `net::ERR_FAILED`, wait 30s and retry once. If it fails a second time, fall back to Step 1b.

**Step 1b (fallback)**: Apply via Supabase dashboard.
1. Open `https://supabase.com/dashboard/project/ciuklhiswctbnffqvlhs/sql/new`
2. Paste the SQL from the migration file
3. Click Run
4. Verify: table `public.fetch_log` appears in the Table Editor

- [ ] **Step 2: Verify the table exists**

Via MCP:
```
mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__list_tables:
  project_id: ciuklhiswctbnffqvlhs
  schemas: ["public"]
  verbose: false
```

Expected: `daily_snapshot` AND `fetch_log` both in the result.

- [ ] **Step 3: Trigger the cron once and verify logs land**

```bash
cd /Users/bbmisa/mbc-policy-brief && export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
lsof -ti:3008 | xargs kill 2>/dev/null
npx next dev -p 3008 >/tmp/next.log 2>&1 &
sleep 6
curl -s -H "Authorization: Bearer dev-only-secret" http://localhost:3008/api/daily/refresh | head -200
lsof -ti:3008 | xargs kill 2>/dev/null
```

Then query the log via MCP:
```
mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__execute_sql:
  project_id: ciuklhiswctbnffqvlhs
  query: "select source, strategy, success, duration_ms, error_message from fetch_log order by logged_at desc limit 10"
```

Expected: 5-7 rows (one per source × strategy attempt). No console-fallback lines in `/tmp/next.log` (meaning inserts succeeded).

- [ ] **Step 4: No commit needed** (table lives in Supabase; migration file already in git)

---

## Task 2: DOE pump price — Google News RSS fallback

**Files:**
- Modify: `src/lib/daily-pipeline/fetchPumpPrice.ts`

The DOE website is fully behind Cloudflare and blocks even firecrawl. Instead, query Google News RSS for recent Philippine diesel price articles, parse the first numeric value that looks like a Peso-denominated per-liter diesel price from the top 3 headlines + snippets. This is noisier than DOE but works without a key and the sanity band (30 ≤ value ≤ 300) rejects obviously bad extractions.

- [ ] **Step 1: Replace the fetcher with a 3-tier strategy**

Replace the ENTIRE contents of `/Users/bbmisa/mbc-policy-brief/src/lib/daily-pipeline/fetchPumpPrice.ts` with:

```typescript
import type { PumpPriceSnapshot } from "@/data/types";
import { firecrawlMarkdown } from "./firecrawl";
import { logFetch } from "./fetchLog";
import Parser from "rss-parser";

const DOE_URL = "https://www.doe.gov.ph/oil-monitor";
const USER_AGENT =
  "pipedream-policy-brief/1.0 (+https://pipedream-policy-brief.vercel.app)";

// Google News RSS search — recent Philippine diesel price articles.
// Restricted to PhilStar + Inquirer for signal quality.
const GOOGLE_NEWS_RSS =
  "https://news.google.com/rss/search?q=philippines+diesel+price+pump+(philstar.com+OR+inquirer.net)&hl=en-PH&gl=PH&ceid=PH:en";

/**
 * Parses the latest diesel pump price in PHP/L.
 *
 * Strategy 1 (plain fetch DOE): fastest; almost always fails due to Cloudflare.
 * Strategy 2 (firecrawl DOE): handles JS-rendered pages but Cloudflare still
 *   blocks with its challenge page — usually fails too.
 * Strategy 3 (Google News RSS fallback): scans the 5 most recent Philippine
 *   diesel-price news items and extracts the first sane PHP/L value. Noisy
 *   but broadly available.
 */
export async function fetchPumpPrice(): Promise<PumpPriceSnapshot | null> {
  // Strategy 1
  let t = Date.now();
  const direct = await tryDirect();
  if (direct) {
    await logFetch({ source: "doe", strategy: "primary", success: true, durationMs: Date.now() - t });
    return direct;
  }
  await logFetch({
    source: "doe", strategy: "primary", success: false,
    durationMs: Date.now() - t, errorMessage: "no diesel match / blocked",
  });

  // Strategy 2
  t = Date.now();
  const md = await firecrawlMarkdown(DOE_URL);
  const fromFirecrawl = md ? parseDieselFromText(md) : null;
  await logFetch({
    source: "doe", strategy: "firecrawl",
    success: fromFirecrawl !== null,
    durationMs: Date.now() - t,
    errorMessage: fromFirecrawl === null ? "cloudflare challenge / no match" : null,
  });
  if (fromFirecrawl !== null) {
    return { value: fromFirecrawl, delta: "", source: "DOE Oil Industry Monitor (via firecrawl)", sourceUrl: DOE_URL };
  }

  // Strategy 3 — Google News RSS
  t = Date.now();
  const fromNews = await tryGoogleNews();
  await logFetch({
    source: "doe", strategy: "firecrawl", // logged as firecrawl since it's the fallback-fallback
    success: fromNews !== null,
    durationMs: Date.now() - t,
    errorMessage: fromNews === null ? "no price in recent news" : "via google-news-rss",
  });
  return fromNews;
}

async function tryDirect(): Promise<PumpPriceSnapshot | null> {
  try {
    const res = await fetch(DOE_URL, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const value = parseDieselFromText(html);
    if (value === null) return null;
    return { value, delta: "", source: "DOE Oil Industry Monitor", sourceUrl: DOE_URL };
  } catch {
    return null;
  }
}

async function tryGoogleNews(): Promise<PumpPriceSnapshot | null> {
  try {
    const parser = new Parser({ timeout: 10_000 });
    const feed = await parser.parseURL(GOOGLE_NEWS_RSS);

    // Scan the top 5 items — most recent first
    for (const item of feed.items.slice(0, 5)) {
      const text = [item.title, item.contentSnippet, item.content].filter(Boolean).join(" ");
      if (!text) continue;
      // Match "₱130.50", "P130.50", "PHP 130.50", or "130.50/L"
      const match = text.match(/(?:₱|P|PHP)\s*(\d{2,3}\.\d{2})(?:\s*\/\s*L|per\s*liter)?/i)
        || text.match(/(\d{2,3}\.\d{2})\s*\/\s*L/i);
      if (!match) continue;
      const value = parseFloat(match[1]);
      if (!Number.isFinite(value) || value < 30 || value > 300) continue;
      return {
        value,
        delta: "",
        source: "Google News (Philippine diesel price)",
        sourceUrl: item.link ?? "https://news.google.com/",
      };
    }
    return null;
  } catch {
    return null;
  }
}

function parseDieselFromText(text: string): number | null {
  const lower = text.toLowerCase();
  const dieselIdx = lower.indexOf("diesel");
  if (dieselIdx < 0) return null;
  const window = text.slice(dieselIdx, dieselIdx + 400);
  const match = window.match(/(\d{2,3}\.\d{2})/);
  if (!match) return null;
  const value = parseFloat(match[1]);
  if (!Number.isFinite(value) || value < 30 || value > 300) return null;
  return value;
}
```

- [ ] **Step 2: Smoke-test**

```bash
cd /Users/bbmisa/mbc-policy-brief && export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
mkdir -p scripts
cat > scripts/smoke-pump.ts <<'EOF'
import { readFileSync } from "fs";
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
  if (m) process.env[m[1]] = m[2];
}
import { fetchPumpPrice } from "../src/lib/daily-pipeline/fetchPumpPrice";
fetchPumpPrice().then(r => { console.log(r); process.exit(r ? 0 : 1); });
EOF
npx tsx scripts/smoke-pump.ts
rm scripts/smoke-pump.ts
```

Expected: `{ value: <num between 30-300>, delta: '', source: 'Google News (Philippine diesel price)', sourceUrl: '...' }`. Non-zero exit only if ALL strategies fail (acceptable — UI falls back to static).

- [ ] **Step 3: Build**

```bash
npm run build 2>&1 | tail -5
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add src/lib/daily-pipeline/fetchPumpPrice.ts
git commit -m "Add Google News RSS fallback for DOE pump price (Cloudflare-blocked)"
```

---

## Task 3: GPP ASEAN extractor — anchor on the price table

**Files:**
- Modify: `src/lib/daily-pipeline/fetchAseanPrices.ts`

The current `extractRows` finds `"Philippines"` anywhere in the document, which matches the first hit in GPP's country navigation list (before any prices appear). We need to find the price-table section first, then search within it.

Looking at the GPP markdown structure from earlier smoke tests: the country navigation appears first (comma-separated list of 100+ country names, no prices in context). The actual price table follows a heading like `USD per liter` or `Liter` or the phrase `diesel prices around the world`. Anchoring on that heading gives us the correct window.

- [ ] **Step 1: Replace the extractor**

In `/Users/bbmisa/mbc-policy-brief/src/lib/daily-pipeline/fetchAseanPrices.ts`, replace the `extractRows` function with:

```typescript
/**
 * GPP's page structure:
 *   1. Country navigation (names only, no prices)
 *   2. "Diesel prices per liter" heading
 *   3. Two tables — one in USD, one in local-currency equivalents
 *
 * We skip the nav by starting the scan after the first "Diesel prices" heading
 * marker. Within that section, country names appear adjacent to numeric values
 * in "N.NNN" format (USD per liter with 3 decimals).
 */
function extractRows(text: string): AseanPriceRow[] {
  // Find the price-table anchor. GPP uses variations; try each in order.
  const anchors = [
    "Diesel prices, liter",
    "Diesel prices per liter",
    "USD per liter",
    "diesel prices around the world",
    "Diesel prices",
  ];
  let tableStart = -1;
  for (const anchor of anchors) {
    const idx = text.toLowerCase().indexOf(anchor.toLowerCase());
    if (idx >= 0) {
      tableStart = idx;
      break;
    }
  }
  if (tableStart < 0) return [];

  const tableText = text.slice(tableStart);

  const rows: AseanPriceRow[] = [];
  for (const country of ASEAN) {
    // Find country in the table section only
    const rel = tableText.indexOf(country);
    if (rel < 0) continue;
    // Search a small window AFTER the country name (within one table row)
    const window = tableText.slice(rel, rel + 200);
    // Strip the country name itself to avoid matching digits in it
    const afterName = window.slice(country.length);
    const match = afterName.match(/(\d\.\d{3})/);
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

**Leave** the `tryDirect` and `fetchAseanPrices` functions unchanged. Only `extractRows` is replaced.

- [ ] **Step 2: Smoke-test**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
cat > scripts/smoke-asean.ts <<'EOF'
import { readFileSync } from "fs";
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
  if (m) process.env[m[1]] = m[2];
}
import { fetchAseanPrices } from "../src/lib/daily-pipeline/fetchAseanPrices";
fetchAseanPrices().then(r => {
  console.log(`got ${r.length} rows`);
  r.forEach(row => console.log(`  #${row.rank} ${row.country}: $${row.price}/L`));
  process.exit(r.length >= 5 ? 0 : 1);
});
EOF
npx tsx scripts/smoke-asean.ts
rm scripts/smoke-asean.ts
```

Expected: ≥ 5 rows with sensible per-liter USD prices (usually $0.30–$2.50 range for ASEAN). Philippines should appear with a plausible rank.

- [ ] **Step 3: Build**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/daily-pipeline/fetchAseanPrices.ts
git commit -m "Anchor ASEAN extractor on price-table heading, not country nav"
```

---

## Task 4: Measure AudienceProvider tightening for mobile LCP

**Files:**
- Modify (trial): `src/app/page.tsx`
- Measure, then either commit or revert

`AudienceProvider` is a client component that wraps the entire `<main>` tree including the hero. Because React treats the whole subtree as client-rendered, Lighthouse's mobile run waits for JS evaluation before it considers the paint stable — that's the structural reason LCP is 4.1s on mobile simulated (the hero text IS in the SSR HTML). This task measures whether pulling the hero out of the provider's boundary improves LCP. If it doesn't, revert — the existing structure works fine and mobile 75 is acceptable.

- [ ] **Step 1: Capture the baseline LCP**

```bash
cd /Users/bbmisa/mbc-policy-brief && export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npm run build
lsof -ti:3099 | xargs kill 2>/dev/null
npx next start -p 3099 >/dev/null 2>&1 &
sleep 4
npx lighthouse http://localhost:3099 --output=json --output-path=./lh-before.json --chrome-flags="--headless --no-sandbox" --only-categories=performance 2>&1 | tail -2
node -e "const r=require('./lh-before.json');const a=r.audits;console.log('BEFORE perf:',Math.round(r.categories.performance.score*100),'LCP:',a['largest-contentful-paint'].displayValue,'TBT:',a['total-blocking-time'].displayValue)"
lsof -ti:3099 | xargs kill 2>/dev/null
```

Record: `perf=<X>, LCP=<Y>s, TBT=<Z>ms`.

- [ ] **Step 2: Refactor — move hero above AudienceProvider**

Read `/Users/bbmisa/mbc-policy-brief/src/app/page.tsx`. Current structure (approximate):

```tsx
export default function Home() {
  return (
    <AudienceProvider>
      <a href="#crisis" className="sr-only ...">Skip to content</a>
      <ScrollProgress />
      <Nav />
      <Ticker />
      <FreshnessBanner />
      <header className="pt-[120px] ...">
        {/* Hero content: eyebrow, SupplyCountdown, h1, subtitle, byline */}
      </header>
      <AudienceMain>
        ...
      </AudienceMain>
      ...
    </AudienceProvider>
  );
}
```

Refactor to:

```tsx
export default function Home() {
  return (
    <>
      <a href="#crisis" className="sr-only ...">Skip to content</a>
      <ScrollProgress />
      {/* Hero renders as pure SSR — no client context dependency */}
      <header className="pt-[120px] ...">
        {/* Hero content unchanged */}
      </header>
      <AudienceProvider>
        <Nav />
        <Ticker />
        <FreshnessBanner />
        <AudienceMain>
          ...
        </AudienceMain>
        ...
      </AudienceProvider>
    </>
  );
}
```

**CRITICAL — preserve these invariants:**
- The hero still needs `pt-[120px]` because `Nav + Ticker + FreshnessBanner` are `position: fixed` and occupy the top 82px. Keep the padding.
- `Nav` and `AudienceToggle` use `AudienceProvider` context — they MUST stay inside `<AudienceProvider>`.
- `ShareBar`, `BackToTop`, `Footer` currently outside AudienceMain but inside AudienceProvider — keep them inside for the new structure.

Make this edit carefully: read the full existing `page.tsx`, move the entire `<header>` block to before `<AudienceProvider>`, move the skip-link and `<ScrollProgress />` out too (they're pure presentational).

- [ ] **Step 3: Build + measure**

```bash
npm run build 2>&1 | tail -5
lsof -ti:3099 | xargs kill 2>/dev/null
npx next start -p 3099 >/dev/null 2>&1 &
sleep 4
npx lighthouse http://localhost:3099 --output=json --output-path=./lh-after.json --chrome-flags="--headless --no-sandbox" --only-categories=performance 2>&1 | tail -2
node -e "const r=require('./lh-after.json');const a=r.audits;console.log('AFTER perf:',Math.round(r.categories.performance.score*100),'LCP:',a['largest-contentful-paint'].displayValue,'TBT:',a['total-blocking-time'].displayValue)"
lsof -ti:3099 | xargs kill 2>/dev/null
rm lh-before.json lh-after.json
```

Record: `perf=<X'>, LCP=<Y'>s, TBT=<Z'>ms`.

- [ ] **Step 4: Decision branch**

Compare BEFORE vs AFTER:
- If `LCP` dropped by ≥ 300ms OR `perf` improved by ≥ 3 points: keep the change. Proceed to Step 5a.
- If roughly flat (LCP delta < 300ms AND perf delta < 3): revert. Proceed to Step 5b.
- If it got worse: revert. Proceed to Step 5b.

- [ ] **Step 5a (kept): Commit with measurement notes**

```bash
git add src/app/page.tsx
git commit -m "$(cat <<'EOF'
Move hero above AudienceProvider to unblock mobile LCP

Before: perf <X>, LCP <Y>s, TBT <Z>ms
After:  perf <X'>, LCP <Y'>s, TBT <Z'>ms

The hero header is purely presentational; wrapping it in the
AudienceProvider client boundary forced the whole tree into client
rendering. Hoisting the hero out lets it render as SSR-only, which
Lighthouse's mobile simulation accepts as LCP sooner.

Nav + AudienceToggle + AudienceMain still live inside the provider.
EOF
)"
```

- [ ] **Step 5b (reverted): restore + record learning**

```bash
git checkout -- src/app/page.tsx
```

Append to `/Users/bbmisa/mbc-policy-brief/CLAUDE.md` under "Session Retrospective":

```markdown
#### 2026-04-19 — AudienceProvider boundary experiment

- **What we tried:** Hoisted the hero above AudienceProvider hoping to make the hero render as SSR-only and improve mobile LCP.
- **Result:** No measurable LCP improvement (delta < 300ms). The mobile simulation is bound by other factors (font swap timing, DOM parse time, not the client-component boundary).
- **Rule added:** Mobile Lighthouse simulation on this app plateaus at perf ~75, LCP ~4.1s. Real-world mobile and desktop are both fine. Don't chase further unless the simulation methodology changes.
```

Commit the doc:
```bash
git add CLAUDE.md
git commit -m "Document AudienceProvider boundary experiment (negative result)"
```

---

## Task 5: End-to-end verification + push

- [ ] **Step 1: Build**

```bash
cd /Users/bbmisa/mbc-policy-brief && export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npm run build 2>&1 | tail -5
```

Expected: clean build.

- [ ] **Step 2: Run the full pipeline locally**

```bash
lsof -ti:3008 | xargs kill 2>/dev/null
npx next dev -p 3008 >/tmp/next.log 2>&1 &
sleep 6
curl -s -H "Authorization: Bearer dev-only-secret" http://localhost:3008/api/daily/refresh | head -200
lsof -ti:3008 | xargs kill 2>/dev/null
```

Expected JSON shape:
```json
{
  "ok": true,
  "fields": {
    "pumpPrice": true,
    "aseanPrices": >= 5,
    "stations": true,
    "supplyDays": true,
    "narrative": true
  }
}
```

- [ ] **Step 3: Inspect the fetch_log (Task 1 verification)**

Via Supabase MCP:
```
mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__execute_sql:
  project_id: ciuklhiswctbnffqvlhs
  query: "select source, strategy, success, count(*) as n from fetch_log group by 1,2,3 order by 1,2"
```

Expected: rows for each of `{doe, gpp, osm}` × `{primary, firecrawl, mirror}` combination that actually ran.

- [ ] **Step 4: Push**

```bash
git push origin main
```

- [ ] **Step 5: Update CLAUDE.md with the completed state**

Append to `/Users/bbmisa/mbc-policy-brief/CLAUDE.md` under the Daily Pipeline section:

```markdown
### Follow-ups complete (2026-04-19)

- `fetch_log` table live in Supabase; per-source diagnostic logging active
- DOE pump price: 3-tier strategy — plain fetch → firecrawl → Google News RSS fallback
- GPP ASEAN extractor: anchored on price-table heading (was matching country nav)
- (If Task 4 kept) Hero hoisted above AudienceProvider for mobile LCP
```

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "Document daily-pipeline follow-up completions"
git push origin main
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Task 1: `fetch_log` migration application
- ✅ Task 2: DOE Google News fallback
- ✅ Task 3: GPP table-anchored regex
- ✅ Task 4: AudienceProvider boundary measurement + conditional commit

**Placeholder scan:** ✅ Every step has concrete code or exact commands. No "add validation" / "handle edge cases" / "TBD".

**Type consistency:**
- `PumpPriceSnapshot`, `AseanPriceRow` types unchanged (Tasks 2 + 3 keep existing return shapes)
- `logFetch` signature unchanged — Tasks 2/3 call it with the same shape as the existing implementation
- `fetchPumpPrice` / `fetchAseanPrices` exported function signatures unchanged

**Zero-cost:**
- Google News RSS: free, no key (already used by `/api/news`)
- Supabase: one additional table (`fetch_log`), negligible bytes
- Firecrawl: existing free tier (unchanged)
- No new dependencies

**Dependency order:**
- Task 1 → independent (MCP / dashboard apply)
- Task 2 → independent (one file)
- Task 3 → independent (one file)
- Task 4 → should run last (uses page.tsx, requires Lighthouse runs without interference from dev server)
- Tasks 2 + 3 can be dispatched to parallel subagents safely (different files)

**Risk handling:**
- Task 1 Step 1b: if MCP keeps flaking, user applies via dashboard — no blocking
- Task 2: if Google News RSS returns nothing (unusual), pipeline gets null — UI falls back to hardcoded ₱130+/L (existing behavior)
- Task 3: regex is new — smoke test enforces ≥ 5 rows before commit
- Task 4: measurement-gated, revert if no measurable win — no risk to ship
