# EOC Pivot + Station Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Edgar Chua's market-stability framing into the policy brief and add a map-based gas station status tracker (out-of-supply stations) seeded from news data, designed for future crowd-sourced citizen reporting.

**Architecture:** Three parallel workstreams — (A) content pivot to reflect EOC/MBC revised framing across pillars, anti-recs, and channels, (B) new `StationTracker` map section using Leaflet + CartoDB DarkMatter tiles with station status data, (C) wire into page layout and deploy.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, Leaflet (zero API keys, ~140KB gzipped) + CartoDB DarkMatter dark tiles, existing glass-morphism dark theme.

---

## Workstream A: Content Pivot — EOC Market-Stability Framing

The MBC revised statement (with EOC interview inputs) fundamentally shifts the argument:

1. **Excise taxes are a demand signal**, not just revenue — suspending them overstimulates demand when supply is scarce
2. **This is a supply crisis, not just a price crisis** — availability at any price > affordability
3. **Targeted digital relief** (GCash/PayMaya/PriceLOCQ fuel vouchers) over blanket tax holidays
4. **Deregulation preserves trader incentives** — re-regulation drives supply out of the country

These themes must be woven into Pillars, Anti-Recs, Distribution Channels, and the Executive Summary.

---

### Task 1: Update Pillar 2 (Fiscal Intervention) — Excise as Demand Signal

**Files:**
- Modify: `src/data/pillars.ts` (Pillar 2, id: 2)

- [ ] **Step 1: Update Pillar 2 rationale**

Replace the current rationale:
```
"RA 12316 authorizes excise tax suspension but implementation targets April 12–13. The $80/bbl threshold is breached. Every day of delay costs billions."
```

With the EOC-informed version:
```
"Maintaining fuel excise taxes is not merely a fiscal necessity — it is a critical market signal. RA 12316 authorizes suspension, but as MBC Chairman Edgar Chua emphasizes, suspending these taxes creates a broad artificial subsidy that overstimulates demand when global supplies are precarious. Depressing prices artificially risks triggering the very shortages we seek to avoid by masking true scarcity. The ₱20B+ annual excise revenue also funds the targeted relief and infrastructure programs that are the real solutions."
```

- [ ] **Step 2: Add new recommendation to Pillar 2**

Add as the first recommendation:
```ts
{
  title: "Guard excise revenue for hyper-targeted digital relief",
  detail:
    "Deploy direct fuel vouchers via GCash, PayMaya, and PriceLOCQ to PUV drivers, small-scale farmers, and fisherfolk. Digital delivery ensures zero leakage and immediate verification — no intermediaries, no blanket subsidies.",
}
```

- [ ] **Step 3: Verify build passes**

Run: `cd /Users/bbmisa/mbc-policy-brief && npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/data/pillars.ts
git commit -m "Pivot Pillar 2 to EOC demand-signal framing for excise taxes"
```

---

### Task 2: Update Pillar 1 (Supply Security) — Supply vs. Price Distinction

**Files:**
- Modify: `src/data/pillars.ts` (Pillar 1, id: 1)

- [ ] **Step 1: Strengthen Pillar 1 rationale with supply-vs-price framing**

Prepend to the existing rationale:
```
"We must distinguish between a price disruption and a supply collapse. While high prices are a burden, a scenario where fuel is unavailable at any price — due to disincentivized imports — would be catastrophic. Preserving a deregulated environment ensures all market players have the incentive to secure and move product into the country. "
```

So the full rationale becomes:
```
"We must distinguish between a price disruption and a supply collapse. While high prices are a burden, a scenario where fuel is unavailable at any price — due to disincentivized imports — would be catastrophic. Preserving a deregulated environment ensures all market players have the incentive to secure and move product into the country. Supply beyond May is unconfirmed. PNOC's successful procurement of 150,000 barrels proves government-facilitated supply works. This must be scaled using the ₱20 billion Malampaya fund."
```

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/bbmisa/mbc-policy-brief && npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/data/pillars.ts
git commit -m "Strengthen Pillar 1 with supply-vs-price distinction per EOC framing"
```

---

### Task 3: Update Anti-Recommendations with Market-Stability Arguments

**Files:**
- Modify: `src/data/anti-recs.ts`

- [ ] **Step 1: Strengthen anti-rec #1 (Full re-regulation) with deregulation argument**

Update reason to:
```
"Requires ₱17B in government subsidies at $50/bbl per Petron Senate testimony. More critically, re-regulation disincentivizes the very market players — from major refiners to smaller traders — who currently have the incentive to secure and move product into the country. In a supply crisis, the deregulated market is our best mechanism for attracting imports."
```

- [ ] **Step 2: Update anti-rec #4 (Excise + VAT removal) with demand-signal argument**

Update reason to:
```
"Economic planning secretary warned of 'triple whammy': budget deficit + reduced spending + GDP contraction. As MBC Chairman Edgar Chua notes, broad tax relief has the same effect as a fuel subsidy — maintaining demand higher than it would otherwise be at a time when supply is in question. The companies MBC represents do not need subsidies; they need supply. Fiscal interventions must be sequenced, targeted, and reversible."
```

- [ ] **Step 3: Verify build passes**

Run: `cd /Users/bbmisa/mbc-policy-brief && npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/data/anti-recs.ts
git commit -m "Strengthen anti-recs with EOC market-stability and demand-signal arguments"
```

---

### Task 4: Update Distribution Channels — Fintech-First Emphasis

**Files:**
- Modify: `src/data/channels.ts`

- [ ] **Step 1: Add GCash/PayMaya to Channel 2 how-it-works**

Add to `channels[1].how` array (Channel 2 — Targeted Distribution):
```
"For beneficiaries without station access: direct fuel vouchers via GCash or PayMaya, redeemable at participating stations — maximizing reach with zero physical infrastructure build"
```

- [ ] **Step 2: Add fintech advantage to Channel 2**

Add to `channels[1].advantages` array:
```
"Compatible with existing fintech wallets (GCash 93M users, PayMaya 60M users) — no app installation needed for SMS voucher redemption"
```

- [ ] **Step 3: Update sequencingRecommendation (top-level export in channels.ts, NOT a channel property)**

Update the `export const sequencingRecommendation` string to reflect the fintech-first approach:
```
"Deploy Channel 2 as primary within 2–3 weeks using PriceLOCQ for Business (PLB) infrastructure already operational at 450+ stations, supplemented by GCash/PayMaya fuel vouchers for digital-first delivery. Extend PLB to additional fuel brands through API integration for national multi-provider coverage. Revenue from maintained excise taxes funds the subsidy — making the fiscal model self-sustaining. Hold Channel 1 (wholesale) as immediate fallback for commercial consumers not on the whitelist. Prepare Channel 3 (ayuda) for humanitarian-scale deployment if the crisis extends beyond 60 days."
```

- [ ] **Step 4: Verify build passes**

Run: `cd /Users/bbmisa/mbc-policy-brief && npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/channels.ts
git commit -m "Add fintech-first delivery (GCash/PayMaya) to Channel 2 per EOC direction"
```

---

### Task 5: Update Hero Subtitle and Context

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update the hero subtitle to reflect supply-first framing**

Change:
```
Policy recommendations for the Philippine fuel crisis
```
To:
```
Supply security, market stability, and targeted relief for the Philippine fuel crisis
```

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/bbmisa/mbc-policy-brief && npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "Update hero subtitle to reflect supply-first EOC framing"
```

---

## Workstream B: Gas Station Status Tracker (Map Section)

A new dashboard section showing which gas stations are out of fuel, seeded from news reports, designed for future citizen crowd-sourcing.

---

### Task 6: Add Station Tracker Types

**Files:**
- Modify: `src/data/types.ts`

- [ ] **Step 1: Add station status types**

Add to types.ts:
```ts
export type StationStatus = "operational" | "low-supply" | "out-of-stock" | "closed";

export interface TrackedStation {
  id: string;
  name: string;
  brand: string;
  lat: number;
  lng: number;
  status: StationStatus;
  lastReported: string;
  reportSource: "news" | "citizen" | "official";
  sourceUrl?: string;
  details?: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data/types.ts
git commit -m "Add TrackedStation types for station status tracker"
```

---

### Task 7: Create Station Seed Data

**Files:**
- Create: `src/data/station-tracker.ts`

- [ ] **Step 1: Create seed data with known closure locations**

Create `src/data/station-tracker.ts` with approximately 20–30 stations across Metro Manila and key provinces based on news reports. Include a mix of statuses:
- 8–10 `out-of-stock` (from news reports of closures)
- 5–8 `low-supply` (stations with partial availability)
- 10–15 `operational` (as context/contrast)

Each station needs: id, name, brand (Petron/Shell/Caltex/Seaoil/Independent), lat/lng (real coordinates for the area), status, lastReported date, reportSource ("news"), sourceUrl (link to the news article if available), and optional details.

Key locations based on news coverage:
- NCR stations that closed due to supply issues
- Provinces with reported shortages (Mindanao, Visayas)
- Rural stations most affected

Also export summary stats:
```ts
export const trackerStats = {
  totalTracked: number,
  outOfStock: number,
  lowSupply: number,
  operational: number,
  lastUpdated: string,
  crowdSourceEnabled: false, // Phase 2
};
```

- [ ] **Step 2: Commit**

```bash
git add src/data/station-tracker.ts
git commit -m "Add seed station tracker data from news reports"
```

---

### Task 8: Install Leaflet

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install leaflet and types**

Run: `cd /Users/bbmisa/mbc-policy-brief && bun add leaflet && bun add -d @types/leaflet`

Note: Leaflet is ~140KB gzipped (3.5x smaller than Mapbox GL JS), requires zero API keys, and CartoDB DarkMatter tiles (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`) provide a dark theme matching the glass-morphism UI. No accounts, no env vars, no token failure mode.

- [ ] **Step 2: Commit**

```bash
git add package.json bun.lockb
git commit -m "Add leaflet dependency for station tracker map"
```

---

### Task 9: Create StationMap Component

**Files:**
- Create: `src/components/charts/StationMap.tsx`

- [ ] **Step 1: Build the map component**

Create a `"use client"` component that accepts `stations: TrackedStation[]` as a prop and renders:
- A Leaflet map centered on the Philippines (lat: 12.8797, lng: 121.774)
- Zoom level ~6 to see the whole archipelago
- CartoDB DarkMatter tiles: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png` (no API key needed, dark theme matching glass UI)
- `L.circleMarker` for each station, color-coded by status:
  - `operational`: green (#10B981)
  - `low-supply`: amber (#F59E0B)
  - `out-of-stock`: red (#EF4444)
  - `closed`: gray (#6B7280)
- Popup on click showing: station name, brand, status, last reported date, source link (if sourceUrl exists, render as `<a>` tag)
- Legend overlay (glass-styled, `position: absolute` bottom-right) showing status colors and counts

Import Leaflet CSS: `import "leaflet/dist/leaflet.css"` at the top of the component.

Handle SSR: Use `next/dynamic` with `{ ssr: false }` to wrap the map, or guard with `typeof window !== "undefined"` check. Leaflet requires the DOM and will crash on server render.

**IMPORTANT:** The component MUST accept `stations: TrackedStation[]` as a prop so the parent `StationTracker` section can pass filtered data down when the user toggles status filters.

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/bbmisa/mbc-policy-brief && npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/charts/StationMap.tsx
git commit -m "Add StationMap component with status-coded markers"
```

---

### Task 10: Create StationTracker Section

**Files:**
- Create: `src/components/sections/StationTracker.tsx`

- [ ] **Step 1: Build the section component**

Create a section that includes:
- SectionWrapper with id="tracker", title="Station Status Tracker", subtitle with dynamic date
- Summary stat cards (glass-styled) at the top: Total Tracked, Out of Stock, Low Supply, Operational
- The StationMap component (full-width, ~500px height)
- A "Data Sources" callout explaining: "Station statuses are compiled from verified news reports and DOE monitoring data. Crowd-sourced citizen reporting coming soon."
- A filter bar (pill buttons) to toggle visibility by status: All | Out of Stock | Low Supply | Operational — use `useState<StationStatus | "all">("all")` and filter the `trackedStations` array before passing to `<StationMap stations={filteredStations} />`
- Source attribution: DOE + news articles

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/bbmisa/mbc-policy-brief && npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/StationTracker.tsx
git commit -m "Add StationTracker section with map and status filters"
```

---

### Task 11: Wire StationTracker into Page and Nav

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/layout/Nav.tsx`

- [ ] **Step 1: Add StationTracker to page**

Import `StationTracker` and add it after `Infrastructure` and before `NewsFeed`:
```tsx
<Infrastructure />
<div className="border-t border-white-08" />
<StationTracker />
<div className="border-t border-white-08" />
<NewsFeed />
```

- [ ] **Step 2: Add to nav**

Add `{ id: "tracker", label: "Station Tracker" }` to the sections array in Nav.tsx, between "Infrastructure" and "Live News".

- [ ] **Step 3: Verify build passes**

Run: `cd /Users/bbmisa/mbc-policy-brief && npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/components/layout/Nav.tsx
git commit -m "Wire StationTracker section into page layout and navigation"
```

---

## Workstream C: Deploy

### Task 12: Final Build, Commit, Push, Deploy

Note: No env vars needed — Leaflet + CartoDB DarkMatter tiles require zero API keys.

- [ ] **Step 1: Full build verification**

Run: `cd /Users/bbmisa/mbc-policy-brief && npm run build`
Expected: Clean build with new `/tracker` dynamic route if API exists, or static page

- [ ] **Step 2: Push to trigger Vercel deploy**

```bash
git push
```

- [ ] **Step 3: Verify deployment**

Check Vercel deployment status and preview URL.

---

## Architecture Notes

### Station Tracker — Phase 1 vs Phase 2

**Phase 1 (This Plan):**
- Static seed data from news reports
- Map visualization with status markers
- Filter by status
- All data in `src/data/station-tracker.ts`
- Updates via code commits (daily auto-deploy handles freshness)

**Phase 2 (Future — Crowd-Sourced):**
- API route `/api/stations` with Supabase backend
- Citizen reporting form: photo upload (Vercel Blob), geolocation, station picker
- Moderation queue before data goes live
- Real-time updates via polling or WebSocket
- Upvote/confirm system for citizen reports
- Integration with DOE official station registry

### Why Leaflet over Mapbox

- Zero API keys, zero accounts, zero env vars — one less thing to break
- ~140KB gzipped vs ~500KB for Mapbox GL JS — 3.5x smaller bundle
- CartoDB DarkMatter tiles match the glass-morphism dark theme perfectly
- The Philippines is well-mapped in OpenStreetMap
- For ~30 static markers with status colors, Leaflet's circle markers are sufficient

### EOC Framing — Key Quotes to Reference

These quotes from the revised MBC statement should be woven naturally into the data files (not displayed as block quotes unless explicitly appropriate):

1. "Suspending excise taxes has the same effect as a broad fuel subsidy that will maintain demand levels higher than they otherwise would be"
2. "The companies we represent do not need subsidies — those should be directed to jeepney drivers, etc — but we do need supply"
3. "We believe an efficient market and enlightened regulation our best bet at securing it"
4. "Where fuel is unavailable at any price — due to disincentivized imports — would be catastrophic"

---

## Execution Order

Recommended parallel execution:
- **Agent 1**: Tasks 1–5 (content pivot — all data file edits)
- **Agent 2**: Tasks 6–11 (station tracker — types, data, components, wiring)
- **Sequential**: Task 12 (build and deploy — after both agents complete)

Total estimated tasks: 12 tasks, ~35 steps
