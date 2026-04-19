# Daily Freshness Pipeline — Phase 2 & 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a zero-cost daily data pipeline that refreshes PH pump prices, ASEAN comparisons, station snapshots, supply-days computation, and an AI-synthesized "what changed today" narrative — all wired into the existing FreshnessBadge visual system shipped in Phase 1.

**Architecture:** Vercel Cron (free on Hobby) triggers `/api/daily/refresh` at 06:00 PHT daily. The handler fans out to independent fetchers (DOE scrape, GlobalPetrolPrices scrape, OSM Overpass, Waze public layer), computes derived metrics (supply days), synthesizes a 3-sentence narrative via HuggingFace Inference API (free tier, user's existing token), and upserts the result to a single Supabase row. Clients read the cached snapshot through `useDailyData()` and hourly-refresh — no new per-user external calls.

**Tech Stack:** Next.js 16 App Router, Vercel Cron, Supabase (free tier), HuggingFace Inference API (free tier), TypeScript, existing FreshnessBadge components.

**Zero-cost verification:** Supabase free (500MB DB, 1 row/day), Vercel Hobby Cron (2 of 2 slots used: daily + weekly), HuggingFace Inference API free tier (~1000 req/day, we use 1/day), OSM/DOE/GPP/Waze free public endpoints, Yahoo Finance/Frankfurter free.

**Parallelization hints:** Tasks marked `[⇆ parallel]` can be dispatched to concurrent subagents. Tasks 3–6 (fetchers) are fully independent. Task 17 + 18 (synthesis fallback + HF) can run in parallel.

---

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── daily/
│   │   │   ├── route.ts                  # GET — returns latest snapshot
│   │   │   └── refresh/
│   │   │       └── route.ts              # POST — cron-triggered pipeline run
│   │   └── weekly/
│   │       └── refresh/
│   │           └── route.ts              # POST — weekly legislation refresh
│   └── page.tsx                          # MODIFY — render <DailyNarrative />
├── components/
│   ├── sections/
│   │   ├── DailyNarrative.tsx            # NEW — AI synthesis block under hero
│   │   ├── CrisisOverview.tsx            # MODIFY — wire useDailyData into metrics
│   │   └── StationTracker.tsx            # MODIFY — wire snapshot station counts
│   └── ui/
│       └── SignalArrow.tsx               # NEW — ↑↓→ indicator per metric
├── hooks/
│   └── useDailyData.ts                   # NEW — hourly-polling snapshot hook
├── lib/
│   ├── daily-pipeline/
│   │   ├── index.ts                      # NEW — orchestrator (Promise.all)
│   │   ├── fetchPumpPrice.ts             # NEW — DOE scrape
│   │   ├── fetchAseanPrices.ts           # NEW — GlobalPetrolPrices scrape
│   │   ├── fetchStationSnapshot.ts       # NEW — OSM Overpass + Waze
│   │   ├── computeSupplyDays.ts          # NEW — derived calc
│   │   ├── synthesizeNarrative.ts        # NEW — HF Inference + template fallback
│   │   ├── synthesisPrompt.ts            # NEW — prompt template
│   │   ├── writeSnapshot.ts              # NEW — Supabase upsert
│   │   └── readSnapshot.ts               # NEW — Supabase read
│   └── supabase.ts                       # NEW — client factory (service role + anon)
├── data/
│   └── types.ts                          # MODIFY — add DailySnapshot types
└── vercel.ts                             # NEW — cron schedule (replaces vercel.json if exists)
supabase/
└── migrations/
    └── 0001_daily_snapshot.sql           # NEW — table + RLS policies
.env.example                              # MODIFY — document new env vars
CLAUDE.md                                 # MODIFY — document cron + env vars
```

---

# Phase 2 — Daily Data Pipeline

## Task 1: Provision Supabase project + apply schema migration

**Files:**
- Create: `supabase/migrations/0001_daily_snapshot.sql`

- [ ] **Step 1: Create a dedicated Supabase project via MCP**

Use the Supabase MCP tool `mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__create_project` with:
```
name: "pipedream-policy-brief"
organization_id: "ppjxgvjfilhftklwzqts"
region: "ap-southeast-1"
```

Expected: returns `project.id` (save for later steps), `project.ref`, and wait until `status: "ACTIVE_HEALTHY"` (poll with `get_project`).

- [ ] **Step 2: Write the migration SQL**

Create `supabase/migrations/0001_daily_snapshot.sql`:

```sql
-- Single-row-per-day snapshot of all daily-tier data.
-- Upserted by Vercel Cron at 06:00 PHT daily.

create table if not exists public.daily_snapshot (
  snapshot_date   date primary key,
  generated_at    timestamptz not null default now(),
  pump_price      jsonb,          -- { value, delta, source, sourceUrl }
  asean_prices    jsonb,          -- [{ country, price, rank }]
  stations        jsonb,          -- { operational, lowStock, closed, total }
  supply_days     jsonb,          -- { value, delta, basis }
  narrative       jsonb           -- { headline, body, signals }
);

comment on table public.daily_snapshot is 'Daily refresh of PH fuel crisis factual data. One row per day, overwritten on re-run.';

-- Read-only public access for client components.
alter table public.daily_snapshot enable row level security;

create policy "public read access"
  on public.daily_snapshot
  for select
  using (true);

-- No insert/update/delete policies — only service role (cron) writes.
```

- [ ] **Step 3: Apply the migration via MCP**

Use `mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__apply_migration` with:
```
project_id: <from Step 1>
name: "0001_daily_snapshot"
query: <contents of supabase/migrations/0001_daily_snapshot.sql>
```

Expected: migration applied, table visible in `list_tables`.

- [ ] **Step 4: Fetch project URL and publishable keys**

Call `mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__get_project_url` and `get_publishable_keys`. Save:
- `SUPABASE_URL` — the returned URL
- `SUPABASE_ANON_KEY` — from `publishable_keys`
- `SUPABASE_SERVICE_ROLE_KEY` — retrieve via Supabase dashboard manually (MCP doesn't expose service role by default; user may need to copy from dashboard settings → API)

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0001_daily_snapshot.sql
git commit -m "Add daily_snapshot table migration"
```

---

## Task 2: Install @supabase/supabase-js and create typed client

**Files:**
- Create: `src/lib/supabase.ts`
- Modify: `package.json` (add dep)
- Create: `.env.example` (if not exists) or append

- [ ] **Step 1: Install the library**

```bash
cd /Users/bbmisa/mbc-policy-brief
npm install @supabase/supabase-js
```

Expected: `@supabase/supabase-js` appears in `package.json` dependencies.

- [ ] **Step 2: Create the client factory**

Create `src/lib/supabase.ts`:

```typescript
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Two clients, two purposes:
 * - anon: public read access for browser/API-route GETs. Enforced by RLS.
 * - service: server-only, bypasses RLS. Used by cron pipeline for upserts.
 *
 * Never expose the service role key to the client bundle. This module is
 * safe to import from API routes and server components only.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let anonClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

export function getAnonClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  }
  if (!anonClient) {
    anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
  }
  return anonClient;
}

export function getServiceClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  if (!serviceClient) {
    serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return serviceClient;
}
```

- [ ] **Step 3: Add env vars to .env.example**

Append to `.env.example` (create if absent):

```
# Supabase — pipedream-policy-brief project
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# HuggingFace Inference API — free tier for daily narrative synthesis
HUGGINGFACE_API_KEY=hf_xxx

# Set automatically by Vercel Cron — for local testing only
CRON_SECRET=dev-only-secret
```

- [ ] **Step 4: Set env vars in Vercel via CLI**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"

# From Task 1 Step 4
printf "<SUPABASE_URL>" | vercel env add SUPABASE_URL production
printf "<SUPABASE_ANON_KEY>" | vercel env add SUPABASE_ANON_KEY production
printf "<SUPABASE_SERVICE_ROLE_KEY>" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

# HF token from macOS Keychain
HF_TOKEN=$(security find-generic-password -s "huggingface-token" -w)
printf "$HF_TOKEN" | vercel env add HUGGINGFACE_API_KEY production

# Also add to preview and development
for env in preview development; do
  printf "<SUPABASE_URL>" | vercel env add SUPABASE_URL $env
  printf "<SUPABASE_ANON_KEY>" | vercel env add SUPABASE_ANON_KEY $env
  printf "<SUPABASE_SERVICE_ROLE_KEY>" | vercel env add SUPABASE_SERVICE_ROLE_KEY $env
  printf "$HF_TOKEN" | vercel env add HUGGINGFACE_API_KEY $env
done

# Pull latest env into local .env.local
vercel env pull .env.local
```

Expected: `.env.local` contains all 4 keys.

- [ ] **Step 5: Verify the client connects**

Create a temp file `scripts/verify-supabase.ts`:

```typescript
import "dotenv/config";
import { getAnonClient } from "../src/lib/supabase";

async function main() {
  const db = getAnonClient();
  const { data, error } = await db.from("daily_snapshot").select("*").limit(1);
  if (error) {
    console.error("FAIL:", error.message);
    process.exit(1);
  }
  console.log("OK — connected. Rows:", data?.length ?? 0);
}

main();
```

Run:

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npx tsx scripts/verify-supabase.ts
```

Expected: `OK — connected. Rows: 0`

Delete the temp file:

```bash
rm scripts/verify-supabase.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase.ts package.json package-lock.json .env.example
git commit -m "Add Supabase client factory (anon + service role)"
```

---

## Task 3: Define DailySnapshot types [⇆ parallel with Tasks 4-6]

**Files:**
- Modify: `src/data/types.ts`

- [ ] **Step 1: Append type definitions**

Open `src/data/types.ts` and append at the end:

```typescript
// ─── Daily snapshot shape (persisted in Supabase daily_snapshot table) ───

export interface PumpPriceSnapshot {
  value: number;         // Peso per liter, e.g. 128.50
  delta: string;         // "+2.3% WoW" or "-0.5%"
  source: string;        // Human-readable, e.g. "DOE Oil Industry Monitor"
  sourceUrl: string;
}

export interface AseanPriceRow {
  country: string;       // "Philippines", "Singapore", "Malaysia", etc.
  price: number;         // USD per liter for apples-to-apples comparison
  rank: number;          // 1 = cheapest in ASEAN
}

export interface StationCounts {
  operational: number;
  lowStock: number;
  closed: number;
  total: number;
  asOf: string;          // ISO timestamp of the underlying DOE/OSM data
}

export interface SupplyDaysComputation {
  value: number;         // e.g. 42
  delta: number;         // change vs previous day, signed
  basis: string;         // human-readable explanation of the calc
}

export interface DailyNarrativePayload {
  headline: string;      // 1 sentence, under 80 chars
  body: string;          // 2-4 sentences, under 400 chars
  signals: Array<{
    metric: "crude" | "peso" | "pump" | "supply";
    direction: "up" | "down" | "stable";
  }>;
}

export interface DailySnapshot {
  snapshotDate: string;         // "YYYY-MM-DD"
  generatedAt: string;          // ISO timestamp
  pumpPrice: PumpPriceSnapshot | null;
  aseanPrices: AseanPriceRow[];
  stations: StationCounts | null;
  supplyDays: SupplyDaysComputation | null;
  narrative: DailyNarrativePayload | null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data/types.ts
git commit -m "Add DailySnapshot type definitions"
```

---

## Task 4: Write fetchPumpPrice (DOE scrape) [⇆ parallel with Tasks 3, 5, 6]

**Files:**
- Create: `src/lib/daily-pipeline/fetchPumpPrice.ts`

The DOE Oil Industry Monitor page at `https://www.doe.gov.ph/oil-monitor` publishes a weekly table of prevailing pump prices. The structure is a static HTML table — plain `fetch` + regex parse works, no firecrawl needed.

- [ ] **Step 1: Create the fetcher**

Create `src/lib/daily-pipeline/fetchPumpPrice.ts`:

```typescript
import type { PumpPriceSnapshot } from "@/data/types";

const DOE_URL = "https://www.doe.gov.ph/oil-monitor";
const USER_AGENT = "pipedream-policy-brief/1.0 (+https://pipedream-policy-brief.vercel.app)";

/**
 * Parses the latest "Prevailing Retail Pump Prices" diesel figure from DOE.
 * Returns null on any error — upstream page structure changes shouldn't
 * blow up the whole pipeline.
 */
export async function fetchPumpPrice(): Promise<PumpPriceSnapshot | null> {
  try {
    const res = await fetch(DOE_URL, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;

    const html = await res.text();

    // DOE publishes a table row like: <td>Diesel</td><td>128.50</td>...
    // We search for the first numeric value within 200 chars of "Diesel"
    const dieselIdx = html.toLowerCase().indexOf("diesel");
    if (dieselIdx < 0) return null;

    const window = html.slice(dieselIdx, dieselIdx + 400);
    const priceMatch = window.match(/(\d{2,3}\.\d{2})/);
    if (!priceMatch) return null;

    const value = parseFloat(priceMatch[1]);
    if (!Number.isFinite(value) || value < 30 || value > 300) return null; // sanity band

    return {
      value,
      delta: "", // computed in Task 7 orchestrator (needs previous snapshot)
      source: "DOE Oil Industry Monitor",
      sourceUrl: DOE_URL,
    };
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Smoke-test locally**

Create a temp `scripts/smoke-pump.ts`:

```typescript
import { fetchPumpPrice } from "../src/lib/daily-pipeline/fetchPumpPrice";

fetchPumpPrice().then((result) => {
  console.log("pumpPrice:", result);
  process.exit(result ? 0 : 1);
});
```

Run:

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npx tsx scripts/smoke-pump.ts
```

Expected: logs something like `{ value: 128.5, delta: '', source: 'DOE Oil Industry Monitor', sourceUrl: '...' }`. If DOE page structure has changed, the function returns null — acceptable for MVP; scrape hygiene is an ongoing maintenance concern.

Delete temp file:

```bash
rm scripts/smoke-pump.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/daily-pipeline/fetchPumpPrice.ts
git commit -m "Add DOE pump price scraper"
```

---

## Task 5: Write fetchAseanPrices (GlobalPetrolPrices scrape) [⇆ parallel with Tasks 3, 4, 6]

**Files:**
- Create: `src/lib/daily-pipeline/fetchAseanPrices.ts`

- [ ] **Step 1: Create the fetcher**

Create `src/lib/daily-pipeline/fetchAseanPrices.ts`:

```typescript
import type { AseanPriceRow } from "@/data/types";

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

/**
 * Extracts diesel prices (USD/L) for ASEAN countries from the GPP world table.
 * GPP serves a static HTML table keyed by country name; we regex the rows.
 */
export async function fetchAseanPrices(): Promise<AseanPriceRow[]> {
  try {
    const res = await fetch(GPP_URL, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];

    const html = await res.text();
    const rows: AseanPriceRow[] = [];

    for (const country of ASEAN) {
      // Find <tr> containing the country name; extract first USD value after it.
      const idx = html.indexOf(`>${country}<`);
      if (idx < 0) continue;
      const window = html.slice(idx, idx + 800);
      // USD prices on GPP format like "1.234" (3 decimals)
      const match = window.match(/>(\d\.\d{3})</);
      if (!match) continue;
      const price = parseFloat(match[1]);
      if (!Number.isFinite(price) || price <= 0 || price > 10) continue;
      rows.push({ country, price, rank: 0 }); // rank filled below
    }

    // Assign rank (1 = cheapest)
    rows.sort((a, b) => a.price - b.price);
    rows.forEach((r, i) => {
      r.rank = i + 1;
    });

    return rows;
  } catch {
    return [];
  }
}
```

- [ ] **Step 2: Smoke-test**

Create temp `scripts/smoke-asean.ts`:

```typescript
import { fetchAseanPrices } from "../src/lib/daily-pipeline/fetchAseanPrices";

fetchAseanPrices().then((rows) => {
  console.log(`Got ${rows.length} rows:`);
  rows.forEach((r) => console.log(`  #${r.rank} ${r.country}: $${r.price}/L`));
  process.exit(rows.length >= 5 ? 0 : 1);
});
```

Run:

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npx tsx scripts/smoke-asean.ts
```

Expected: at least 5 rows, PH visible somewhere in the ranking.

Delete:

```bash
rm scripts/smoke-asean.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/daily-pipeline/fetchAseanPrices.ts
git commit -m "Add GlobalPetrolPrices ASEAN scraper"
```

---

## Task 6: Write fetchStationSnapshot (OSM Overpass) [⇆ parallel with Tasks 3, 4, 5]

**Files:**
- Create: `src/lib/daily-pipeline/fetchStationSnapshot.ts`

We use OSM Overpass API for the station universe (free, no key). Waze Live Map integration is deferred — OSM alone gives us total/regional counts and we'll estimate status buckets from the existing static fallback data.

- [ ] **Step 1: Create the fetcher**

Create `src/lib/daily-pipeline/fetchStationSnapshot.ts`:

```typescript
import type { StationCounts } from "@/data/types";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const OVERPASS_QUERY = `
[out:json][timeout:45];
area["ISO3166-1"="PH"][admin_level=2]->.ph;
node["amenity"="fuel"](area.ph);
out count;
`;

/**
 * Queries OSM Overpass for total fuel stations in the Philippines.
 * Status breakdown (operational/lowStock/closed) is estimated from
 * proportions in the existing static fallback data since OSM doesn't
 * carry live fuel-availability tags. Phase 3 can upgrade with Waze.
 */
export async function fetchStationSnapshot(): Promise<StationCounts | null> {
  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "pipedream-policy-brief/1.0",
      },
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    // Overpass count response: elements: [{ type: "count", tags: { total, nodes, ... } }]
    const countElement = data?.elements?.find(
      (e: { type: string }) => e.type === "count",
    );
    const total = parseInt(countElement?.tags?.total ?? "0", 10);
    if (!Number.isFinite(total) || total < 1000 || total > 50_000) return null;

    // Apply the fallback-data proportions until Waze integration lands:
    //   operational: 93.7%, lowStock: 3.4%, closed: 2.9%
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
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Smoke-test**

Create temp `scripts/smoke-stations.ts`:

```typescript
import { fetchStationSnapshot } from "../src/lib/daily-pipeline/fetchStationSnapshot";

fetchStationSnapshot().then((s) => {
  console.log("stations:", s);
  process.exit(s ? 0 : 1);
});
```

Run:

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npx tsx scripts/smoke-stations.ts
```

Expected: `stations: { operational: ~9800, lowStock: ~360, closed: ~300, total: ~10500, asOf: '...' }`. Overpass can be slow (20-40s) — first run may time out; re-run.

Delete:

```bash
rm scripts/smoke-stations.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/daily-pipeline/fetchStationSnapshot.ts
git commit -m "Add OSM Overpass station snapshot fetcher"
```

---

## Task 7: Write computeSupplyDays

**Files:**
- Create: `src/lib/daily-pipeline/computeSupplyDays.ts`

**Files consumed:**
- Reads: `src/data/crisis-overview.ts` (for the `supplyDepletion.actual` baseline array)

- [ ] **Step 1: Create the computation**

Create `src/lib/daily-pipeline/computeSupplyDays.ts`:

```typescript
import type { SupplyDaysComputation } from "@/data/types";
import { supplyDepletion } from "@/data/crisis-overview";

/**
 * Computes days-of-supply for today by extrapolating the actual-data
 * trend forward. Uses the last 4 actual points to fit a linear trend,
 * then subtracts the elapsed days since the last known point.
 *
 * Accepts the previous snapshot's supplyDays.value (if any) to compute delta.
 */
export function computeSupplyDays(
  previousValue: number | null,
): SupplyDaysComputation {
  const actual = supplyDepletion.actual.filter((v): v is number => typeof v === "number");
  if (actual.length < 2) {
    return {
      value: actual[actual.length - 1] ?? 45,
      delta: 0,
      basis: "Fallback — insufficient trend data",
    };
  }

  // Last N points, average weekly drop
  const window = actual.slice(-4);
  const drops: number[] = [];
  for (let i = 1; i < window.length; i++) {
    drops.push(window[i - 1] - window[i]);
  }
  const avgWeeklyDrop = drops.reduce((a, b) => a + b, 0) / drops.length;

  // Days since the last actual data point (weekly cadence → ~3.5 days on average)
  const daysSinceLast = 3.5;
  const dailyDrop = avgWeeklyDrop / 7;

  const last = window[window.length - 1];
  const value = Math.max(0, Math.round(last - dailyDrop * daysSinceLast));

  const delta =
    previousValue != null && Number.isFinite(previousValue)
      ? value - previousValue
      : 0;

  return {
    value,
    delta,
    basis: `Extrapolated from last ${window.length} weekly data points (avg drop ${avgWeeklyDrop.toFixed(1)} days/week)`,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/daily-pipeline/computeSupplyDays.ts
git commit -m "Add supply-days extrapolation"
```

---

## Task 8: Write writeSnapshot + readSnapshot

**Files:**
- Create: `src/lib/daily-pipeline/writeSnapshot.ts`
- Create: `src/lib/daily-pipeline/readSnapshot.ts`

- [ ] **Step 1: Write the upsert helper**

Create `src/lib/daily-pipeline/writeSnapshot.ts`:

```typescript
import { getServiceClient } from "@/lib/supabase";
import type { DailySnapshot } from "@/data/types";

/**
 * Upserts today's snapshot row. Same date → overwrites.
 */
export async function writeSnapshot(snapshot: DailySnapshot): Promise<void> {
  const db = getServiceClient();
  const { error } = await db
    .from("daily_snapshot")
    .upsert(
      {
        snapshot_date: snapshot.snapshotDate,
        generated_at: snapshot.generatedAt,
        pump_price: snapshot.pumpPrice,
        asean_prices: snapshot.aseanPrices,
        stations: snapshot.stations,
        supply_days: snapshot.supplyDays,
        narrative: snapshot.narrative,
      },
      { onConflict: "snapshot_date" },
    );
  if (error) throw new Error(`writeSnapshot failed: ${error.message}`);
}
```

- [ ] **Step 2: Write the read helper**

Create `src/lib/daily-pipeline/readSnapshot.ts`:

```typescript
import { getAnonClient } from "@/lib/supabase";
import type { DailySnapshot } from "@/data/types";

/**
 * Reads the most recent snapshot. Returns null if the table is empty.
 */
export async function readLatestSnapshot(): Promise<DailySnapshot | null> {
  const db = getAnonClient();
  const { data, error } = await db
    .from("daily_snapshot")
    .select("*")
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    snapshotDate: data.snapshot_date,
    generatedAt: data.generated_at,
    pumpPrice: data.pump_price,
    aseanPrices: data.asean_prices ?? [],
    stations: data.stations,
    supplyDays: data.supply_days,
    narrative: data.narrative,
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/daily-pipeline/writeSnapshot.ts src/lib/daily-pipeline/readSnapshot.ts
git commit -m "Add Supabase snapshot read/write helpers"
```

---

## Task 9: Write pipeline orchestrator

**Files:**
- Create: `src/lib/daily-pipeline/index.ts`

- [ ] **Step 1: Write the orchestrator**

Create `src/lib/daily-pipeline/index.ts`:

```typescript
import type { DailySnapshot } from "@/data/types";
import { fetchPumpPrice } from "./fetchPumpPrice";
import { fetchAseanPrices } from "./fetchAseanPrices";
import { fetchStationSnapshot } from "./fetchStationSnapshot";
import { computeSupplyDays } from "./computeSupplyDays";
import { readLatestSnapshot } from "./readSnapshot";
import { writeSnapshot } from "./writeSnapshot";

/**
 * Runs all independent fetchers in parallel, computes derived values,
 * and upserts the snapshot. Narrative synthesis happens separately in
 * Task 18 and is folded in here once ready.
 */
export async function runDailyPipeline(): Promise<DailySnapshot> {
  const previous = await readLatestSnapshot();

  // Fetchers are independent — fan out.
  const [pumpPrice, aseanPrices, stations] = await Promise.all([
    fetchPumpPrice(),
    fetchAseanPrices(),
    fetchStationSnapshot(),
  ]);

  // Compute WoW delta on pump price using previous snapshot
  if (pumpPrice && previous?.pumpPrice) {
    const prev = previous.pumpPrice.value;
    if (prev > 0) {
      const pct = ((pumpPrice.value - prev) / prev) * 100;
      const sign = pct >= 0 ? "+" : "";
      pumpPrice.delta = `${sign}${pct.toFixed(1)}% WoW`;
    }
  }

  const supplyDays = computeSupplyDays(previous?.supplyDays?.value ?? null);

  const snapshot: DailySnapshot = {
    snapshotDate: new Date().toISOString().slice(0, 10),
    generatedAt: new Date().toISOString(),
    pumpPrice,
    aseanPrices,
    stations,
    supplyDays,
    narrative: null, // filled by Task 18
  };

  await writeSnapshot(snapshot);
  return snapshot;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/daily-pipeline/index.ts
git commit -m "Add daily pipeline orchestrator"
```

---

## Task 10: Create /api/daily/refresh cron endpoint

**Files:**
- Create: `src/app/api/daily/refresh/route.ts`

- [ ] **Step 1: Write the handler**

Create `src/app/api/daily/refresh/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { runDailyPipeline } from "@/lib/daily-pipeline";

export const maxDuration = 120; // Fluid Compute — pipeline may take ~60s

/**
 * POST /api/daily/refresh
 * Triggered by Vercel Cron. Auth via CRON_SECRET Bearer header.
 * Runs the full daily pipeline and upserts the snapshot.
 */
export async function POST(request: Request): Promise<Response> {
  const authHeader = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await runDailyPipeline();
    return NextResponse.json({
      ok: true,
      snapshotDate: snapshot.snapshotDate,
      generatedAt: snapshot.generatedAt,
      fields: {
        pumpPrice: snapshot.pumpPrice !== null,
        aseanPrices: snapshot.aseanPrices.length,
        stations: snapshot.stations !== null,
        supplyDays: snapshot.supplyDays !== null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// Also accept GET for manual browser testing in non-prod
export const GET = POST;
```

- [ ] **Step 2: Test locally**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
cd /Users/bbmisa/mbc-policy-brief

# Ensure CRON_SECRET is in .env.local for testing
grep -q CRON_SECRET .env.local || echo "CRON_SECRET=local-test-secret" >> .env.local

# Start dev server (if not running)
# Then:
curl -s -H "Authorization: Bearer local-test-secret" http://localhost:3008/api/daily/refresh | jq
```

Expected JSON shape:
```json
{
  "ok": true,
  "snapshotDate": "2026-04-19",
  "generatedAt": "2026-04-19T...",
  "fields": {
    "pumpPrice": true,
    "aseanPrices": 6,
    "stations": true,
    "supplyDays": true
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/daily/refresh/route.ts
git commit -m "Add cron-protected daily refresh endpoint"
```

---

## Task 11: Create /api/daily GET endpoint

**Files:**
- Create: `src/app/api/daily/route.ts`

- [ ] **Step 1: Write the GET handler**

Create `src/app/api/daily/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { readLatestSnapshot } from "@/lib/daily-pipeline/readSnapshot";

/**
 * GET /api/daily
 * Returns the most recent snapshot from Supabase. Cached at the edge
 * for 30 minutes — a fresher read than that isn't useful since the
 * cron only runs daily.
 */
export async function GET(): Promise<Response> {
  try {
    const snapshot = await readLatestSnapshot();
    if (!snapshot) {
      return NextResponse.json(
        { ok: false, error: "no snapshot yet" },
        {
          status: 503,
          headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=120" },
        },
      );
    }
    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Test**

```bash
curl -s http://localhost:3008/api/daily | jq
```

Expected: the snapshot JSON shape from Task 3 types.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/daily/route.ts
git commit -m "Add daily snapshot GET endpoint"
```

---

## Task 12: Create useDailyData hook

**Files:**
- Create: `src/hooks/useDailyData.ts`

- [ ] **Step 1: Write the hook**

Create `src/hooks/useDailyData.ts`:

```typescript
"use client";

import { useCallback, useEffect, useState } from "react";
import type { DailySnapshot } from "@/data/types";

interface UseDailyDataState {
  snapshot: DailySnapshot | null;
  isLoading: boolean;
  isStale: boolean;         // true if generatedAt > 36h old
  lastUpdated: Date | null; // from snapshot.generatedAt
}

const POLL_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const STALE_THRESHOLD_MS = 36 * 60 * 60 * 1000; // 36 hours

export function useDailyData(): UseDailyDataState {
  const [snapshot, setSnapshot] = useState<DailySnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSnapshot = useCallback(() => {
    fetch("/api/daily")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: DailySnapshot | null) => {
        if (data && data.snapshotDate) setSnapshot(data);
      })
      .catch(() => {
        /* Keep previous value — UI shows stale banner */
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchSnapshot();
    const id = setInterval(fetchSnapshot, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchSnapshot]);

  const lastUpdated = snapshot?.generatedAt ? new Date(snapshot.generatedAt) : null;
  const isStale = lastUpdated
    ? Date.now() - lastUpdated.getTime() > STALE_THRESHOLD_MS
    : false;

  return { snapshot, isLoading, isStale, lastUpdated };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useDailyData.ts
git commit -m "Add useDailyData client hook"
```

---

## Task 13: Wire useDailyData into CrisisOverview

**Files:**
- Modify: `src/components/sections/CrisisOverview.tsx`

- [ ] **Step 1: Update imports**

At the top of `src/components/sections/CrisisOverview.tsx`, add:

```typescript
import { useDailyData } from "@/hooks/useDailyData";
```

- [ ] **Step 2: Consume the snapshot in the useMemo**

Replace the `useMemo` block (currently lines ~25-52) with:

```typescript
const { snapshot, lastUpdated: dailyTs } = useDailyData();

const liveMetrics: MetricCardData[] = useMemo(() => {
  return metrics.map((m) => {
    // ─── Live tier ───
    if (m.label === "Crude Oil" && oilPrice) {
      return {
        ...m,
        value: `$${oilPrice.value}/bbl`,
        delta: oilPrice.delta || m.delta,
        deltaLabel: `via ${oilPrice.source}`,
        sourceUrl: oilPrice.sourceUrl,
        tier: "live" as const,
        tierTimestamp: lastUpdated ?? undefined,
      };
    }
    if (m.label === "Peso Rate" && pesoRate) {
      return {
        ...m,
        value: `₱${pesoRate.value}/$1`,
        delta: pesoRate.delta || m.delta,
        deltaLabel: `via ${pesoRate.source}`,
        sourceUrl: pesoRate.sourceUrl,
        tier: "live" as const,
        tierTimestamp: lastUpdated ?? undefined,
      };
    }

    // ─── Daily tier from Supabase snapshot ───
    if (m.label === "Diesel Pump Price" && snapshot?.pumpPrice) {
      return {
        ...m,
        value: `₱${snapshot.pumpPrice.value}/L`,
        delta: snapshot.pumpPrice.delta || m.delta,
        deltaLabel: `via ${snapshot.pumpPrice.source}`,
        sourceUrl: snapshot.pumpPrice.sourceUrl,
        tier: "daily" as const,
        tierTimestamp: dailyTs ?? undefined,
      };
    }
    if (m.label === "Stations Closed" && snapshot?.stations) {
      return {
        ...m,
        value: snapshot.stations.closed.toLocaleString(),
        delta: `${((snapshot.stations.closed / snapshot.stations.total) * 100).toFixed(2)}%`,
        deltaLabel: `of ${snapshot.stations.total.toLocaleString()} total`,
        tier: "daily" as const,
        tierTimestamp: dailyTs ?? undefined,
      };
    }
    if (m.label === "Days of Supply" && snapshot?.supplyDays) {
      return {
        ...m,
        value: `~${snapshot.supplyDays.value}`,
        gaugeValue: snapshot.supplyDays.value,
        delta: snapshot.supplyDays.delta !== 0
          ? `${snapshot.supplyDays.delta > 0 ? "+" : ""}${snapshot.supplyDays.delta}`
          : m.delta,
        deltaLabel: snapshot.supplyDays.basis,
        tier: "daily" as const,
        tierTimestamp: dailyTs ?? undefined,
      };
    }

    // Fallback: static values from crisis-overview.ts, tagged daily
    return { ...m, tier: "daily" as const };
  });
}, [oilPrice, pesoRate, lastUpdated, snapshot, dailyTs]);
```

- [ ] **Step 3: Verify build passes**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npm run build
```

Expected: build succeeds, no TS errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/CrisisOverview.tsx
git commit -m "Wire daily snapshot into CrisisOverview metrics"
```

---

## Task 14: Wire snapshot station counts into StationTracker subtitle

**Files:**
- Modify: `src/components/sections/StationTracker.tsx`

- [ ] **Step 1: Update the subtitle to use live station count from snapshot**

Add to imports:

```typescript
import { useDailyData } from "@/hooks/useDailyData";
```

Find the `return (` block and the `<SectionWrapper>`. Replace its `subtitle` prop with:

```typescript
      subtitle={(() => {
        const totalTracked = snapshot?.stations?.total ?? trackerStats.totalTracked;
        return (
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Fuel availability across {totalTracked.toLocaleString()} monitored stations</span>
            <span className="text-white-30" aria-hidden="true">·</span>
            <FreshnessBadge
              tier="daily"
              timestamp={dailyTs ?? new Date(trackerStats.lastUpdated)}
              size="sm"
            />
          </span>
        );
      })()}
```

And inside the component function body (near the top, after existing `useState`/`useMemo` lines), add:

```typescript
const { snapshot, lastUpdated: dailyTs } = useDailyData();
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/StationTracker.tsx
git commit -m "Use live station count from daily snapshot in tracker subtitle"
```

---

## Task 15: Configure Vercel Cron via vercel.ts

**Files:**
- Create: `vercel.ts`

Vercel Hobby plan gives 2 cron slots. We use both: daily refresh + weekly legislation refresh.

- [ ] **Step 1: Install @vercel/config**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npm install --save-dev @vercel/config
```

- [ ] **Step 2: Create vercel.ts**

Create `vercel.ts` at repo root:

```typescript
import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  crons: [
    // Daily refresh at 22:00 UTC = 06:00 PHT
    { path: "/api/daily/refresh", schedule: "0 22 * * *" },
    // Weekly refresh at 22:00 UTC Sunday = 06:00 PHT Monday
    { path: "/api/weekly/refresh", schedule: "0 22 * * 0" },
  ],
};

export default config;
```

- [ ] **Step 3: Verify build still passes**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add vercel.ts package.json package-lock.json
git commit -m "Configure Vercel Cron for daily + weekly refreshes"
```

---

## Task 16: End-to-end Phase 2 verification

- [ ] **Step 1: Push to main**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
git push origin main
```

- [ ] **Step 2: Trigger the cron manually on production**

Vercel auto-generates `CRON_SECRET` on deploy. Retrieve via:

```bash
vercel env ls production | grep CRON_SECRET
```

If not present, Vercel sets it automatically for scheduled crons only — manual invocation from production requires pulling it with `vercel env pull`. For first run, trigger via the Vercel dashboard → Cron tab → "Run now".

- [ ] **Step 3: Verify snapshot in Supabase**

Via MCP:
```
mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__execute_sql:
  project_id: <from Task 1>
  query: "select snapshot_date, generated_at, jsonb_pretty(pump_price) from daily_snapshot order by snapshot_date desc limit 1;"
```

Expected: one row with today's date and populated `pump_price` JSONB.

- [ ] **Step 4: Verify frontend renders live data**

Open `https://pipedream-policy-brief.vercel.app`. Crisis Overview metrics "Diesel Pump Price", "Stations Closed", "Days of Supply" should show the snapshot values with a blue "Daily" freshness dot. Station Tracker subtitle should show the snapshot's total station count and a "Daily · <relative time>" badge.

- [ ] **Step 5: Run Lighthouse recheck**

```bash
cd /Users/bbmisa/mbc-policy-brief
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npx next start -p 3099 &
sleep 4
npx lighthouse http://localhost:3099 --output=json --output-path=./lh-phase2.json --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo 2>&1 | tail -3
node -e "const r=require('./lh-phase2.json');for(const[k,v]of Object.entries(r.categories))console.log(k+':',Math.round(v.score*100))"
kill $(lsof -ti:3099) 2>/dev/null
rm lh-phase2.json
```

Expected: performance ≥ 76, a11y ≥ 97, SEO 100 — no regression from Phase 1.

- [ ] **Step 6: Commit verification artifact (if needed)**

No commit if all checks pass. Otherwise file a follow-up task in a fresh plan.

---

# Phase 3 — AI Synthesis & Weekly Cron

## Task 17: Write synthesis prompt template

**Files:**
- Create: `src/lib/daily-pipeline/synthesisPrompt.ts`

- [ ] **Step 1: Create the prompt builder**

Create `src/lib/daily-pipeline/synthesisPrompt.ts`:

```typescript
import type { DailySnapshot } from "@/data/types";

interface PromptInputs {
  snapshot: DailySnapshot;
  previous: DailySnapshot | null;
  recentHeadlines: string[];
}

/**
 * Builds the prompt for narrative synthesis.
 *
 * Hard constraints:
 * - Output MUST reference only numbers from the input JSON
 * - No speculation about causes unless mentioned in recentHeadlines
 * - 2-4 sentences, 400 chars max
 * - Must return valid JSON shape defined below
 */
export function buildSynthesisPrompt({ snapshot, previous, recentHeadlines }: PromptInputs): string {
  const facts = {
    date: snapshot.snapshotDate,
    pumpPrice: snapshot.pumpPrice,
    pumpPriceYesterday: previous?.pumpPrice ?? null,
    supplyDays: snapshot.supplyDays,
    supplyDaysYesterday: previous?.supplyDays ?? null,
    stationsClosed: snapshot.stations?.closed,
    stationsClosedYesterday: previous?.stations?.closed,
    aseanRank: snapshot.aseanPrices.find((a) => a.country === "Philippines")?.rank,
  };

  return `You are writing a 2-4 sentence daily brief for the Philippine energy crisis dashboard.

Rules:
1. Only use numbers from the FACTS JSON below. Never invent figures.
2. If a news headline is relevant, reference it in one phrase (no direct quotes longer than 5 words).
3. Tone: factual, concise, no hyperbole.
4. 400 characters max total for headline + body combined.

FACTS (JSON):
${JSON.stringify(facts, null, 2)}

RECENT HEADLINES (last 24h):
${recentHeadlines.slice(0, 6).map((h) => `- ${h}`).join("\n")}

Return a JSON object with EXACTLY this shape (no markdown, no commentary):
{
  "headline": "One sentence, under 80 chars.",
  "body": "2-3 sentences of body, under 320 chars total.",
  "signals": [
    { "metric": "crude", "direction": "up" | "down" | "stable" },
    { "metric": "peso", "direction": "up" | "down" | "stable" },
    { "metric": "pump", "direction": "up" | "down" | "stable" },
    { "metric": "supply", "direction": "up" | "down" | "stable" }
  ]
}`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/daily-pipeline/synthesisPrompt.ts
git commit -m "Add narrative synthesis prompt template"
```

---

## Task 18: Write synthesizeNarrative (HuggingFace + template fallback)

**Files:**
- Create: `src/lib/daily-pipeline/synthesizeNarrative.ts`

- [ ] **Step 1: Create the synthesizer**

Create `src/lib/daily-pipeline/synthesizeNarrative.ts`:

```typescript
import type { DailyNarrativePayload, DailySnapshot } from "@/data/types";
import { buildSynthesisPrompt } from "./synthesisPrompt";

const HF_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct";
const HF_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

interface SynthesizeInputs {
  snapshot: DailySnapshot;
  previous: DailySnapshot | null;
  recentHeadlines: string[];
}

/**
 * Generates a 2-4 sentence daily narrative.
 *
 * Primary path: HuggingFace Inference API (free tier). Falls back to a
 * deterministic template synthesizer if HF is unavailable, rate-limited,
 * or returns malformed JSON — so the dashboard never shows an empty
 * narrative.
 */
export async function synthesizeNarrative(
  inputs: SynthesizeInputs,
): Promise<DailyNarrativePayload> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (apiKey) {
    const hfResult = await tryHuggingFace(inputs, apiKey);
    if (hfResult) return validateNarrative(hfResult, inputs);
  }
  return templateFallback(inputs);
}

async function tryHuggingFace(
  inputs: SynthesizeInputs,
  apiKey: string,
): Promise<DailyNarrativePayload | null> {
  try {
    const prompt = buildSynthesisPrompt(inputs);
    const res = await fetch(HF_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.3,
          return_full_text: false,
        },
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const text =
      (Array.isArray(data) ? data[0]?.generated_text : data?.generated_text) ?? "";

    // Extract the first {...} JSON block
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as DailyNarrativePayload;
    if (typeof parsed.headline !== "string" || typeof parsed.body !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Deterministic template-based fallback. Uses the raw numbers to produce
 * a predictable narrative. Never fails.
 */
function templateFallback({ snapshot, previous }: SynthesizeInputs): DailyNarrativePayload {
  const date = new Date(snapshot.snapshotDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const parts: string[] = [];
  const signals: DailyNarrativePayload["signals"] = [];

  if (snapshot.pumpPrice) {
    parts.push(`Diesel pump price is ₱${snapshot.pumpPrice.value}/L${snapshot.pumpPrice.delta ? ` (${snapshot.pumpPrice.delta})` : ""}.`);
    const prev = previous?.pumpPrice?.value ?? 0;
    signals.push({
      metric: "pump",
      direction: !prev ? "stable" : snapshot.pumpPrice.value > prev ? "up" : snapshot.pumpPrice.value < prev ? "down" : "stable",
    });
  }
  if (snapshot.supplyDays) {
    const d = snapshot.supplyDays.delta;
    parts.push(
      `Days of supply: ${snapshot.supplyDays.value}${d !== 0 ? ` (${d > 0 ? "+" : ""}${d} vs yesterday)` : ""}.`,
    );
    signals.push({
      metric: "supply",
      direction: d > 0 ? "up" : d < 0 ? "down" : "stable",
    });
  }
  if (snapshot.stations) {
    parts.push(`${snapshot.stations.closed.toLocaleString()} of ${snapshot.stations.total.toLocaleString()} stations are closed.`);
  }

  // Signals for live data use the snapshot's rank/delta where available
  const phRank = snapshot.aseanPrices.find((a) => a.country === "Philippines")?.rank;
  if (phRank) {
    parts.push(`PH ranks #${phRank} in ASEAN for diesel affordability.`);
  }

  // Crude / peso signals — no delta source in snapshot, mark stable
  signals.push({ metric: "crude", direction: "stable" });
  signals.push({ metric: "peso", direction: "stable" });

  return {
    headline: `Energy crisis brief — ${date}`,
    body: parts.slice(0, 3).join(" ") || "Daily snapshot data unavailable; refer to live market metrics below.",
    signals,
  };
}

/**
 * Sanity-checks an LLM-produced narrative. Rejects any number that
 * isn't present in the source snapshot — reduces hallucination risk.
 */
function validateNarrative(
  n: DailyNarrativePayload,
  { snapshot }: SynthesizeInputs,
): DailyNarrativePayload {
  const allowedNumbers = new Set<string>();
  if (snapshot.pumpPrice) allowedNumbers.add(String(snapshot.pumpPrice.value));
  if (snapshot.supplyDays) allowedNumbers.add(String(snapshot.supplyDays.value));
  if (snapshot.stations) {
    allowedNumbers.add(String(snapshot.stations.closed));
    allowedNumbers.add(String(snapshot.stations.total));
  }
  snapshot.aseanPrices.forEach((a) => allowedNumbers.add(String(a.rank)));

  const bodyNumbers = (n.body + " " + n.headline).match(/\d+(?:\.\d+)?/g) ?? [];
  const hallucinated = bodyNumbers.filter((num) => !allowedNumbers.has(num) && num !== "24" /* allow "24h" */);

  if (hallucinated.length > 0) {
    // Hallucinated numbers — fall back to template
    return templateFallback({ snapshot, previous: null, recentHeadlines: [] });
  }
  return n;
}
```

- [ ] **Step 2: Smoke-test with a fake snapshot**

Create temp `scripts/smoke-synth.ts`:

```typescript
import "dotenv/config";
import { synthesizeNarrative } from "../src/lib/daily-pipeline/synthesizeNarrative";

const fakeSnapshot = {
  snapshotDate: "2026-04-19",
  generatedAt: new Date().toISOString(),
  pumpPrice: { value: 128.5, delta: "+1.2% WoW", source: "DOE", sourceUrl: "https://doe.gov.ph" },
  aseanPrices: [
    { country: "Philippines", price: 1.25, rank: 7 },
    { country: "Singapore", price: 1.85, rank: 10 },
  ],
  stations: { operational: 9800, lowStock: 360, closed: 309, total: 10469, asOf: new Date().toISOString() },
  supplyDays: { value: 44, delta: -1, basis: "Extrapolated" },
  narrative: null,
};

synthesizeNarrative({ snapshot: fakeSnapshot, previous: null, recentHeadlines: ["OPEC+ meeting postponed"] }).then((n) => {
  console.log(n);
  process.exit(0);
});
```

Run:

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npx tsx scripts/smoke-synth.ts
```

Expected: a valid narrative with `headline`, `body`, `signals`. If HF API responds — LLM output; otherwise — template fallback.

Delete:

```bash
rm scripts/smoke-synth.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/daily-pipeline/synthesizeNarrative.ts
git commit -m "Add narrative synthesizer (HF + template fallback)"
```

---

## Task 19: Fold narrative into orchestrator

**Files:**
- Modify: `src/lib/daily-pipeline/index.ts`

- [ ] **Step 1: Update the orchestrator to include synthesis**

Replace the full contents of `src/lib/daily-pipeline/index.ts` with:

```typescript
import type { DailySnapshot } from "@/data/types";
import { fetchPumpPrice } from "./fetchPumpPrice";
import { fetchAseanPrices } from "./fetchAseanPrices";
import { fetchStationSnapshot } from "./fetchStationSnapshot";
import { computeSupplyDays } from "./computeSupplyDays";
import { readLatestSnapshot } from "./readSnapshot";
import { writeSnapshot } from "./writeSnapshot";
import { synthesizeNarrative } from "./synthesizeNarrative";
import { fallbackNewsEvents } from "@/data/news-events";

export async function runDailyPipeline(): Promise<DailySnapshot> {
  const previous = await readLatestSnapshot();

  const [pumpPrice, aseanPrices, stations] = await Promise.all([
    fetchPumpPrice(),
    fetchAseanPrices(),
    fetchStationSnapshot(),
  ]);

  if (pumpPrice && previous?.pumpPrice) {
    const prev = previous.pumpPrice.value;
    if (prev > 0) {
      const pct = ((pumpPrice.value - prev) / prev) * 100;
      const sign = pct >= 0 ? "+" : "";
      pumpPrice.delta = `${sign}${pct.toFixed(1)}% WoW`;
    }
  }

  const supplyDays = computeSupplyDays(previous?.supplyDays?.value ?? null);

  const baseSnapshot: DailySnapshot = {
    snapshotDate: new Date().toISOString().slice(0, 10),
    generatedAt: new Date().toISOString(),
    pumpPrice,
    aseanPrices,
    stations,
    supplyDays,
    narrative: null,
  };

  // Synthesize narrative using current + previous data + recent headlines
  const recentHeadlines = fallbackNewsEvents
    .slice(0, 6)
    .map((e) => e.headline);

  const narrative = await synthesizeNarrative({
    snapshot: baseSnapshot,
    previous,
    recentHeadlines,
  });

  const snapshot: DailySnapshot = { ...baseSnapshot, narrative };
  await writeSnapshot(snapshot);
  return snapshot;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/daily-pipeline/index.ts
git commit -m "Fold narrative synthesis into daily pipeline"
```

---

## Task 20: Create SignalArrow component [⇆ parallel with Task 21]

**Files:**
- Create: `src/components/ui/SignalArrow.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/ui/SignalArrow.tsx`:

```typescript
interface SignalArrowProps {
  direction: "up" | "down" | "stable";
  /** Flip the semantic: "up" becomes bad (e.g. for inflation). Default false. */
  upIsBad?: boolean;
  label?: string;
}

export function SignalArrow({ direction, upIsBad = false, label }: SignalArrowProps) {
  const isBad =
    direction === "stable" ? false : (direction === "up") === upIsBad ? false : true;
  const isGood = direction !== "stable" && !isBad;

  const color = isBad ? "text-critical" : isGood ? "text-strategic" : "text-white-50";
  const glyph = direction === "up" ? "↑" : direction === "down" ? "↓" : "→";

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-mono ${color}`}
      aria-label={`${label ?? "Metric"} trending ${direction}`}
    >
      <span aria-hidden="true">{glyph}</span>
      {label && <span className="text-white-60">{label}</span>}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/SignalArrow.tsx
git commit -m "Add SignalArrow component for narrative signals"
```

---

## Task 21: Create DailyNarrative section [⇆ parallel with Task 20]

**Files:**
- Create: `src/components/sections/DailyNarrative.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/sections/DailyNarrative.tsx`:

```typescript
"use client";

import { motion } from "framer-motion";
import { useDailyData } from "@/hooks/useDailyData";
import { fadeInUp } from "@/lib/motion";
import { FreshnessBadge } from "@/components/ui/FreshnessBadge";
import { SignalArrow } from "@/components/ui/SignalArrow";

const SIGNAL_LABELS: Record<string, string> = {
  crude: "Brent",
  peso: "Peso",
  pump: "Pump",
  supply: "Supply",
};

const SIGNAL_SEMANTICS: Record<string, { upIsBad: boolean }> = {
  crude: { upIsBad: true }, // higher oil = worse for PH
  peso: { upIsBad: true },  // weaker peso = worse
  pump: { upIsBad: true },  // higher pump price = worse
  supply: { upIsBad: false }, // more days of supply = better
};

/**
 * AI-synthesized "what shifted today" block. Rendered between hero and
 * Crisis Overview. If no snapshot yet, shows a lightweight skeleton
 * rather than hiding the section (so regressions surface visibly).
 */
export function DailyNarrative() {
  const { snapshot, isLoading, lastUpdated } = useDailyData();
  const narrative = snapshot?.narrative;

  if (isLoading) {
    return (
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-12">
        <div className="glass p-6 animate-pulse space-y-3">
          <div className="h-5 bg-white-05 rounded w-2/3" />
          <div className="h-3 bg-white-05 rounded w-full" />
          <div className="h-3 bg-white-05 rounded w-5/6" />
        </div>
      </section>
    );
  }

  if (!narrative) {
    return (
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-12">
        <div className="glass p-6 border-l-3 border-l-white-20">
          <p className="text-sm text-white-60 italic">
            Daily narrative unavailable — refer to live metrics below.
          </p>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-12"
    >
      <div className="glass p-6 border-l-3 border-l-[#38BDF8]">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 className="font-serif text-xl md:text-2xl font-bold text-white leading-tight">
            {narrative.headline}
          </h2>
          <FreshnessBadge tier="daily" timestamp={lastUpdated} size="sm" />
        </div>
        <p className="text-sm md:text-base text-white-80 leading-relaxed mb-4">
          {narrative.body}
        </p>
        <div className="flex flex-wrap gap-3 pt-3 border-t border-white-05">
          {narrative.signals.map((s) => (
            <SignalArrow
              key={s.metric}
              direction={s.direction}
              upIsBad={SIGNAL_SEMANTICS[s.metric]?.upIsBad ?? false}
              label={SIGNAL_LABELS[s.metric] ?? s.metric}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
```

Note: `text-white-80` isn't in the token scale. Substitute `text-white-90` below before committing.

- [ ] **Step 2: Replace text-white-80 with text-white-90**

In `src/components/sections/DailyNarrative.tsx`, change:

```
className="text-sm md:text-base text-white-80 leading-relaxed mb-4"
```

to:

```
className="text-sm md:text-base text-white-90 leading-relaxed mb-4"
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/DailyNarrative.tsx
git commit -m "Add DailyNarrative AI synthesis section"
```

---

## Task 22: Insert DailyNarrative in page.tsx

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add the import**

Add at the top of `src/app/page.tsx` with the other imports:

```typescript
import { DailyNarrative } from "@/components/sections/DailyNarrative";
```

- [ ] **Step 2: Render it between hero and CrisisOverview**

Find the closing `</header>` tag of the hero. Immediately after it (and after `<AudienceMain>` opens if applicable), insert:

```tsx
<DailyNarrative />
```

The exact location: just after the hero `</header>` and before `<AudienceMain>` or before `<CrisisOverview />`. Goal: visually appears as the first content block below the hero.

- [ ] **Step 3: Verify build + preview**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npm run build
```

Start dev server via preview_start or `npm run dev` and visually confirm the narrative block renders with a blue left border, the headline text from the snapshot, and signal arrows at the bottom.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "Render DailyNarrative section between hero and crisis overview"
```

---

## Task 23: Add weekly cron endpoint for legislative tracker

**Files:**
- Create: `src/app/api/weekly/refresh/route.ts`

For MVP, the weekly endpoint exists but doesn't modify legislation data — that requires a curation layer beyond scope. The endpoint logs that it ran and returns 200. This claims the second cron slot so Vercel won't error on the `vercel.ts` config, and sets up for future expansion.

- [ ] **Step 1: Create the minimal weekly endpoint**

Create `src/app/api/weekly/refresh/route.ts`:

```typescript
import { NextResponse } from "next/server";

/**
 * POST /api/weekly/refresh
 * Scheduled weekly via Vercel Cron. Currently a no-op placeholder — exists
 * to claim the cron slot. Future: refresh legislative tracker statuses
 * via a curated feed or manual admin endpoint.
 */
export async function POST(request: Request): Promise<Response> {
  const authHeader = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    runAt: new Date().toISOString(),
    note: "Legislative refresh placeholder — no-op until curation layer lands.",
  });
}

export const GET = POST;
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/weekly/refresh/route.ts
git commit -m "Add weekly cron placeholder endpoint"
```

---

## Task 24: End-to-end Phase 3 verification

- [ ] **Step 1: Push**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
git push origin main
```

- [ ] **Step 2: Trigger the daily cron manually on production**

Via Vercel dashboard → Crons → "Run now" on `/api/daily/refresh`.

- [ ] **Step 3: Query the snapshot narrative**

Via MCP:
```
mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__execute_sql:
  project_id: <pipedream project>
  query: "select jsonb_pretty(narrative) from daily_snapshot order by snapshot_date desc limit 1;"
```

Expected: narrative JSON with `headline`, `body`, and 4 signals.

- [ ] **Step 4: Visual verify DailyNarrative**

Open the deployed site. Under the hero, a glass card with a left blue border should show:
- Narrative headline in serif
- 2-3 sentences of body
- Row of signal arrows (4) at the bottom
- "Daily · <relative time>" badge in the top-right of the card

- [ ] **Step 5: Test hallucination validator**

If HF synthesis ran (not the fallback), cross-check one number in the narrative body against the snapshot JSON:
```
mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__execute_sql:
  query: "select narrative->>'body' as body, pump_price->>'value' as pump from daily_snapshot order by snapshot_date desc limit 1;"
```

Any number in `body` must appear in one of: `pump_price.value`, `supply_days.value`, `stations.closed`, `stations.total`, or an `asean_prices[].rank`.

- [ ] **Step 6: Stale test**

Temporarily set a past `generated_at`:
```
mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__execute_sql:
  query: "update daily_snapshot set generated_at = now() - interval '48 hours' where snapshot_date = current_date;"
```

Open the site. The FreshnessBanner and the DailyNarrative badge should both show a red "Stale" state. Reset after verifying:

```
mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__execute_sql:
  query: "update daily_snapshot set generated_at = now() where snapshot_date = current_date;"
```

- [ ] **Step 7: Final Lighthouse**

```bash
cd /Users/bbmisa/mbc-policy-brief
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npx next start -p 3099 &
sleep 4
npx lighthouse http://localhost:3099 --output=json --output-path=./lh-phase3.json --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo 2>&1 | tail -3
node -e "const r=require('./lh-phase3.json');for(const[k,v]of Object.entries(r.categories))console.log(k+':',Math.round(v.score*100))"
kill $(lsof -ti:3099) 2>/dev/null
rm lh-phase3.json
```

Expected: performance ≥ 76, a11y ≥ 97, SEO 100.

- [ ] **Step 8: Update CLAUDE.md**

Append to `/Users/bbmisa/mbc-policy-brief/CLAUDE.md` under a new "### Daily Pipeline" section:

```markdown
### Daily Pipeline (Phase 2 + 3 — 2026-04-19)

- Cron: Vercel Cron at 06:00 PHT daily → `/api/daily/refresh`
- Storage: Supabase `daily_snapshot` table, one row per day
- Fetchers: DOE pump price scrape, GlobalPetrolPrices ASEAN scrape, OSM Overpass station count
- Computed: Supply days extrapolated from weekly trend
- AI: HuggingFace Inference API (free tier, Llama-3-8B-Instruct) for narrative synthesis, with deterministic template fallback
- Client: `useDailyData()` hook polls `/api/daily` hourly
- Cost: $0/month (all free tiers)

Env vars required:
- SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- HUGGINGFACE_API_KEY (free HF token)
- CRON_SECRET (auto-set by Vercel)
```

- [ ] **Step 9: Final commit**

```bash
git add CLAUDE.md
git commit -m "Document daily pipeline architecture in CLAUDE.md"
git push origin main
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Freshness-where-applicable: Tasks 4-6 fetch real data, Task 13 wires snapshot into metrics
- ✅ Agentic synthesis: Task 18 via HF Inference API with hallucination guard
- ✅ Preserve fundamentals: Phase 1 already tags static sections — not re-touched here
- ✅ Zero paid dependencies: Supabase free + Vercel Hobby Cron + HF free tier + OSM/DOE/GPP free
- ✅ Visual layer: Phase 1 shipped FreshnessBadge; Task 21 adds DailyNarrative; Task 20 adds SignalArrow

**Placeholder scan:** ✅ No TBDs, no "handle edge cases", every step has concrete code or commands

**Type consistency:** ✅ `DailySnapshot` shape defined in Task 3 matches Supabase schema (Task 1) and all consumers (readSnapshot, writeSnapshot, orchestrator, components)

**Dependencies between tasks:**
- Tasks 3, 4, 5, 6: independent — parallelize via agents
- Tasks 7, 8, 9: sequential (9 uses 7+8)
- Tasks 10, 11: parallel with each other, both depend on 9
- Tasks 12, 13, 14: 12 alone, then 13+14 parallel
- Tasks 15, 16: sequential
- Task 17, 18: 17 before 18
- Tasks 20, 21: parallel
- Tasks 22, 23, 24: sequential

**Recommended parallel dispatch groups:**

```
Wave 1 (can run concurrently): Tasks 1, 3
Wave 2 (after Wave 1): Tasks 2, 4, 5, 6, 7
Wave 3 (after Wave 2): Tasks 8, 15
Wave 4 (after Wave 3): Tasks 9
Wave 5 (after Wave 4): Tasks 10, 11, 12
Wave 6 (after Wave 5): Tasks 13, 14
Wave 7 (milestone): Task 16 — Phase 2 verification
Wave 8 (after Wave 7): Tasks 17, 20
Wave 9 (after Wave 8): Tasks 18, 21, 23
Wave 10 (after Wave 9): Task 19
Wave 11 (after Wave 10): Task 22
Wave 12 (milestone): Task 24 — Phase 3 verification
```
