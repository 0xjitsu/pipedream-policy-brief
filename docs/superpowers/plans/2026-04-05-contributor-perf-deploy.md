# Contributor Infrastructure, Performance Hardening & Deployment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Tasks 1–4 are independent and should be dispatched as parallel agents.** Tasks 5–7 are sequential.

**Goal:** Make the Pipedream Policy Brief dashboard contributor-ready, bulletproof at 10K concurrent users, and properly deployed with its own Vercel slug.

**Architecture:** Three phases — (1) documentation & contributor infrastructure so agents/humans can onboard, (2) performance hardening via lazy loading, error boundaries, and config optimizations to handle traffic spikes, (3) deployment polish with custom Vercel slug and social meta.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, Chart.js 4.5, Leaflet 1.9, Framer Motion 12, Vercel Edge CDN

---

## File Structure

### New files:
| File | Responsibility |
|------|---------------|
| `CLAUDE.md` | Agent onboarding — project context, conventions, boundaries |
| `CONTRIBUTING.md` | Human contributor guide with CLA |
| `.env.example` | Document any future env var requirements |
| `src/app/error.tsx` | App-level React error boundary |
| ~~`src/components/ui/ChartErrorBoundary.tsx`~~ | Deferred — app-level error boundary sufficient for now |

### Modified files:
| File | Change |
|------|--------|
| `README.md` | Full rewrite per Pipedream README template |
| `next.config.ts` | Add `optimizePackageImports`, headers config |
| `src/app/page.tsx` | Dynamic imports for heavy sections |
| `src/lib/chart-defaults.ts` | No change (stays as-is, loaded when chart chunks load) |
| `src/app/api/market/route.ts` | Cache-Control on error responses |
| `src/app/api/news/route.ts` | Cache-Control on error responses |
| `src/app/layout.tsx` | OG meta, description |
| `package.json` | Rename to `pipedream-policy-brief` |

---

## Phase 1 — Documentation & Contributor Infrastructure

> **Tasks 1–4 are fully independent — dispatch as parallel agents.**

### Task 1: Project CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Write CLAUDE.md**

```markdown
# Pipedream Policy Brief

Interactive policy dashboard for the Philippine energy crisis (March 2026).
Presented to UPLIFT Committee, DOE, and DOF.

## Quick Start

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # production build
```

## Tech Stack

- Next.js 16 (App Router) + Tailwind CSS v4
- Chart.js 4.5 via react-chartjs-2 (GDP, supply, ASEAN charts)
- Leaflet 1.9 + leaflet.markercluster (10K+ station map)
- Framer Motion 12 (scroll animations)
- Vercel Edge CDN (deployment)

## Architecture

- **Data/render separation**: all content in `src/data/*.ts`, components are pure render
- **Live data**: `useMarketData()` polls Brent crude + USD/PHP every 10 min via `/api/market`
- **Live news**: `useNewsFeed()` polls RSS feeds every 5 min via `/api/news`
- **Station map**: 10K+ stations from OSM, status overlays from DOE weekly reports
- **Dark glass-morphism theme**: navy `#0F1B2D`, `backdrop-blur`, translucent borders

## Conventions

- Stage specific files (`git add <file>`), never `git add .`
- Commit messages: present tense imperative, explain the **why**
- All source URLs must be specific article-level links, not generic homepages
- Unicode characters directly in JSX — never `\uXXXX` escape sequences
- CSS transitions preferred over JS animation libraries where possible

## Key Directories

- `src/data/` — all content, metrics, references (single source of truth)
- `src/components/sections/` — page sections (CrisisOverview, EconomicScenarios, etc.)
- `src/components/charts/` — Chart.js and Leaflet visualizations
- `src/components/layout/` — Nav, Footer, SectionWrapper, ScrollProgress
- `src/hooks/` — useMarketData, useNewsFeed, useScrollSpy
- `src/app/api/` — market data and news aggregation API routes

## Boundaries

- ✅ Can modify: `src/`, `docs/`, `public/`
- ⚠️ Ask first: `package.json`, `next.config.ts`, `vercel.json`
- 🚫 Never: commit secrets, `git add .`, modify `node_modules/`

## Data Source Policy

Every claim in the dashboard must link to a specific, verified source URL.
Generic homepage URLs (e.g., `dof.gov.ph/`) are not acceptable — link to the
specific article, report, or data page. The References section consolidates
all 34+ sources for auditability.

## Live Data APIs (no keys required)

- Brent crude: Yahoo Finance `BZ=F` (polled every 10 min)
- USD/PHP: Frankfurter/ECB API (polled every 10 min)
- News: Al Jazeera RSS + Google News RSS + Reddit r/Philippines (polled every 5 min)

## Potential Data Source Upgrades (require API keys or partnerships)

| Source | Data | Cost | Notes |
|--------|------|------|-------|
| Google Maps Places API | Station open/closed status | ~$246/full PH scan | `business_status` field |
| MetroFuel Tracker API | 3,757 station prices (NCR) | Free (contact dev) | API planned by developer |
| GlobalPetrolPrices XML | National price benchmarks | Paid subscription | Weekly updates |
| PriceLOCQ partner API | 450+ station availability | Partnership required | SEAOIL network only |
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "Add CLAUDE.md for agent and contributor onboarding"
```

---

### Task 2: CONTRIBUTING.md with CLA

**Files:**
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Write CONTRIBUTING.md**

```markdown
# Contributing to Pipedream Policy Brief

Thank you for your interest in contributing. This dashboard tracks the Philippine
energy crisis and informs policy recommendations for government officials.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<you>/mbc_policy_brief.git`
3. Install dependencies: `npm install`
4. Start dev server: `npm run dev`
5. Create a feature branch: `git checkout -b feature/your-feature`

## Development Guidelines

- Read `CLAUDE.md` for project conventions and architecture
- All source URLs must link to specific pages, not generic homepages
- Use Unicode characters directly — never `\uXXXX` escape sequences
- Test your build: `npm run build` must pass clean before submitting a PR
- PRs should target the `test` branch, not `main` (unless hotfix)

## Data Contributions

The most impactful contributions are:
- **Verified source URLs** for claims that currently lack specific citations
- **Gas station status data** from DOE weekly reports or citizen observations
- **API integrations** for real-time fuel price or station availability data
- **Translations** (Filipino/Tagalog localization)

## Code Style

- TypeScript strict mode
- Tailwind CSS for all styling (no inline styles)
- Data files in `src/data/` — keep content separate from render logic
- Follow existing patterns in `src/components/sections/` for new sections

## Contributor License Agreement (CLA)

By submitting a pull request, you agree to the following:

1. You grant the maintainer (0xjitsu) a perpetual, worldwide, non-exclusive,
   royalty-free license to use, reproduce, modify, and distribute your
   contributions under any license.
2. You confirm that you have the right to grant this license.
3. This CLA enables dual-licensing: open source (AGPL v3) for community use,
   and commercial licensing for proprietary/enterprise use.

## Reporting Issues

- **Broken source links**: Open an issue with the URL and what it should point to
- **Data corrections**: Open an issue with the correct data and its source
- **Feature requests**: Open an issue describing the use case
- **Security**: Email directly — do not open a public issue
```

- [ ] **Step 2: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "Add CONTRIBUTING.md with CLA and contribution guidelines"
```

---

### Task 3: README.md Full Rewrite

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Rewrite README.md**

Follow the global README structure: hero (centered badges + nav links), problem statement,
quick start, features, architecture, project structure (in `<details>`), customization,
tech stack (inline badges), license, footer.

Key content to include:
- Title: "Pipedream Policy Brief"
- Tagline: "Interactive policy dashboard for the Philippine energy crisis"
- Badges: AGPL v3 license, Next.js, Tailwind CSS, Vercel deploy, PRs Welcome
- Quick Start: clone, install, dev, build (4 commands)
- Features: 10 sections listed with brief descriptions
- Architecture: data/render separation, live polling, dark glass-morphism
- Live Data Sources: table of APIs used (no keys required)
- Potential Upgrades: table of paid APIs with costs (for sponsors)
- Project Structure: tree view in `<details>` collapsible
- Tech Stack: badges for Next.js, Tailwind, Chart.js, Leaflet, Vercel
- License: AGPL v3 badge + dual-license explanation
- Footer: centered deploy button + links

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Rewrite README with full project documentation and contributor guide"
```

---

### Task 4: .env.example

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Write .env.example**

```env
# Pipedream Policy Brief — Environment Variables
# Currently no API keys required. All data sources are free/public.
#
# Future integrations that would require keys:
# GOOGLE_MAPS_API_KEY=       # For real-time station status (business_status field)
# GLOBALPETROLPRICES_KEY=    # For weekly national price benchmarks (XML feed)
# SUPABASE_URL=              # For citizen-reported station status storage
# SUPABASE_ANON_KEY=         # For citizen reporting frontend
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "Add .env.example documenting potential future API keys"
```

---

## Phase 2 — Performance Hardening (10K Users)

> **Tasks 5–7 are sequential** — each builds on the previous.

### Task 5: Dynamic Imports for Heavy Sections

**Files:**
- Modify: `src/app/page.tsx` (lines 4–15 — change static imports to dynamic)

**Context:** Currently, all 9 sections are statically imported in `page.tsx`, which means
Chart.js (~85KB gzip), Framer Motion (~140KB gzip), and all section code loads in the
initial bundle. The station map is already lazy-loaded — we need to do the same for
chart-heavy sections.

- [ ] **Step 1: Convert chart-heavy sections to dynamic imports**

In `src/app/page.tsx`, replace the static imports for the 4 heaviest sections with
`next/dynamic`. Keep lightweight sections (Hero, Footer, Nav) as static imports.

Remove the `"use client"` directive from the top of `page.tsx`. The page becomes a Server
Component shell, with each section loaded as a client chunk via `next/dynamic`. This reduces
the initial JS bundle since the page frame itself needs no client-side interactivity.

```tsx
import dynamic from "next/dynamic";

// Keep static — lightweight, above the fold
import { Nav } from "@/components/layout/Nav";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { Footer } from "@/components/layout/Footer";

// Lazy-load — heavy chart/map dependencies, below the fold
const CrisisOverview = dynamic(() =>
  import("@/components/sections/CrisisOverview").then((m) => ({ default: m.CrisisOverview }))
);
const EconomicScenarios = dynamic(() =>
  import("@/components/sections/EconomicScenarios").then((m) => ({ default: m.EconomicScenarios }))
);
const DistributionChannels = dynamic(() =>
  import("@/components/sections/DistributionChannels").then((m) => ({ default: m.DistributionChannels }))
);
const PolicyPillars = dynamic(() =>
  import("@/components/sections/PolicyPillars").then((m) => ({ default: m.PolicyPillars }))
);
const AntiRecommendations = dynamic(() =>
  import("@/components/sections/AntiRecommendations").then((m) => ({ default: m.AntiRecommendations }))
);
const ActionTimeline = dynamic(() =>
  import("@/components/sections/ActionTimeline").then((m) => ({ default: m.ActionTimeline }))
);
const Infrastructure = dynamic(() =>
  import("@/components/sections/Infrastructure").then((m) => ({ default: m.Infrastructure }))
);
const StationTracker = dynamic(() =>
  import("@/components/sections/StationTracker").then((m) => ({ default: m.StationTracker }))
);
const NewsFeed = dynamic(() =>
  import("@/components/sections/NewsFeed").then((m) => ({ default: m.NewsFeed }))
);
const References = dynamic(() =>
  import("@/components/sections/References").then((m) => ({ default: m.References }))
);
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: Clean build. Each section now loads as a separate JS chunk.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "Lazy-load all below-fold sections to reduce initial bundle size"
```

---

### Task 6: next.config.ts Optimizations + Error Boundaries

**Files:**
- Modify: `next.config.ts`
- Create: `src/app/error.tsx`
- Modify: `src/app/api/market/route.ts` (error response Cache-Control)
- Modify: `src/app/api/news/route.ts` (error response Cache-Control)

- [ ] **Step 1: Add optimizePackageImports to next.config.ts**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["framer-motion", "chart.js", "react-chartjs-2"],
  },
};

export default nextConfig;
```

This tells Next.js to tree-shake these packages more aggressively, only including the
modules actually imported rather than the full library barrel exports.

- [ ] **Step 2: Create App-level error boundary**

Create `src/app/error.tsx`:

```tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy">
      <div className="glass p-8 max-w-md text-center">
        <h2 className="font-serif text-xl font-bold text-white mb-3">
          Something went wrong
        </h2>
        <p className="text-sm text-white-50 mb-6">
          A component failed to render. This may be a temporary issue with
          external data sources.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 text-sm bg-white-10 hover:bg-white-20 text-white rounded-md transition-colors border border-white-20"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add Cache-Control to error responses in API routes**

In `src/app/api/market/route.ts`, find the catch block (returns `{ oilPrice: null, pesoRate: null }`)
and add Cache-Control headers while **keeping the existing response body shape** so the frontend
`useMarketData` hook continues working:

```ts
return NextResponse.json(
  { oilPrice: null, pesoRate: null },
  {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=120" },
  },
);
```

In `src/app/api/news/route.ts`, the catch block returns `fallbackNewsEvents`. Add headers:

```ts
return NextResponse.json(fallbackNewsEvents, {
  headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=120" },
});
```

This prevents error responses from hammering upstream APIs — a 500 is cached for
60 seconds, preventing a thundering herd if Yahoo Finance or Reddit is down.

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: Clean build with optimized chunks.

- [ ] **Step 5: Commit**

```bash
git add next.config.ts src/app/error.tsx src/app/api/market/route.ts src/app/api/news/route.ts
git commit -m "Add error boundaries, optimize package imports, cache error responses"
```

---

### Task 7: Rename package + Vercel slug

**Files:**
- Modify: `package.json` (line 2 — name field)

- [ ] **Step 1: Update package.json name**

Change `"name": "mbc-policy-brief"` → `"name": "pipedream-policy-brief"`

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "Rename package to pipedream-policy-brief"
```

- [ ] **Step 3: Update Vercel project slug**

Note for human: Run these commands to change the Vercel project name (affects the
`.vercel.app` URL):

```bash
# This renames the project on Vercel — the old URL will stop working
npx vercel project update --name pipedream-policy-brief

# Or via Vercel Dashboard: Settings → General → Project Name
```

The production URL will change to `pipedream-policy-brief.vercel.app`.

---

## Phase 3 — Social Meta & Final Polish

### Task 8: OG Meta Tags

**Files:**
- Modify: `src/app/layout.tsx` (metadata export)

- [ ] **Step 1: Add comprehensive metadata**

```ts
export const metadata: Metadata = {
  title: "Pipedream Policy Brief — Navigating the Energy Emergency",
  description:
    "Interactive policy dashboard for the Philippine fuel crisis. Live oil prices, station tracker, economic scenarios, and actionable recommendations for UPLIFT Committee, DOE, and DOF.",
  openGraph: {
    title: "Pipedream Policy Brief — Philippine Energy Crisis Dashboard",
    description:
      "Live oil prices, 10K+ station tracker, economic scenarios, and policy recommendations.",
    type: "website",
    locale: "en_PH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pipedream Policy Brief — Philippine Energy Crisis",
    description:
      "Interactive policy dashboard with live market data, station tracking, and economic modeling.",
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "Add OG and Twitter meta tags for social sharing"
```

---

### Task 9: Final Build + Push

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: Clean build, all static pages generated.

- [ ] **Step 2: Push all commits**

```bash
git push origin main
```

- [ ] **Step 3: Verify Vercel deployment**

```bash
npx vercel ls 2>&1 | head -5
```

Expected: Latest deployment shows `● Building` or `● Ready`.

---

## Out of Scope (Future Work)

These items were identified but deliberately excluded from this plan:

| Item | Reason | Effort |
|------|--------|--------|
| 17 remaining generic gov homepage URLs | Low impact — these agencies don't have specific subpages for the cited data | 2h research |
| `scenarios.ts` hardcoded "$115/bbl" | Cosmetic — low user impact | 15min |
| Supabase citizen reporting pipeline | Phase 2 feature — requires schema design, auth | 1-2 days |
| Google Maps Places API integration | Requires paid API key + cost sponsor | 4h + $$ |
| Filipino/Tagalog translation | Content task, not engineering | 2-3 days |
| framer-motion → CSS transitions migration | High effort, moderate gain — `optimizePackageImports` handles most of it | 1-2 days |
| Bundle analyzer setup | Nice-to-have for monitoring, not blocking | 30min |
