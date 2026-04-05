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
