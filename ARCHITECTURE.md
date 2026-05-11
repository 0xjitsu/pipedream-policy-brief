# Architecture

This document describes the structure of the Pipedream Policy Brief.
For project rules and conventions, see `CLAUDE.md` (Claude-specific) and
`AGENTS.md` (general agent guidance).

## System overview

The brief is a single-page Next.js 16 application with three data layers
sitting on top of a static analytical core:

| Layer | Refresh | Source | Component examples |
|-------|---------|--------|--------------------|
| Live | 5–10 min poll | Yahoo Finance, ECB Frankfurter, RSS | Ticker, MetricCard for Brent/Peso |
| Daily | Vercel Cron 06:00 PHT | DOE scrape, GPP scrape, OSM Overpass | DailyNarrative, MetricCard for pump price |
| Weekly | Manual + planned cron | Legislative tracker data | LegislativeTracker |
| Static | Versioned commits | `src/data/*.ts` | All policy framework sections |

## Data flow — daily pipeline

```
Vercel Cron (0 22 * * * UTC)
  └─> POST /api/daily/refresh (CRON_SECRET-gated)
       └─> runDailyPipeline()
            ├─> Promise.all([
            │     fetchPumpPrice(),       // DOE → firecrawl → Google News
            │     fetchAseanPrices(),     // GPP direct → firecrawl → index-pair
            │     fetchStationSnapshot(), // OSM Overpass × 3 mirrors
            │   ])
            ├─> computeSupplyDays(prev)   // linear extrapolation
            ├─> synthesizeNarrative()     // HF Inference + template fallback
            └─> writeSnapshot()           // Supabase upsert
                  └─> daily_snapshot (snapshot_date PK)

Client:
  useDailyData() — hourly poll of GET /api/daily → setSnapshot()
```

## Component tree

Top-level structure of `src/app/page.tsx`:

```
<RootLayout>
  <a href="#crisis"> skip link
  <ScrollProgress />
  <header> hero (Pipedream eyebrow, SupplyCountdown, h1, subtitle)
  <AudienceProvider>
    <Nav />
    <Ticker />
    <FreshnessBanner />
    <AudienceMain data-mode>
      <DailyNarrative />           [dynamic]
      <ReadingGuide />
      <ExecutiveSummary />
      <CrisisOverview />
      <KeyInsight />
      <SectionDivider variant="solution" />
      <PersonaImpact />            [dynamic]
      <EconomicScenarios />        [dynamic]
      <KeyInsight />
      <DistributionChannels />     [dynamic]
      ...
    </AudienceMain>
    <ShareBar />
    <BackToTop />
    <Footer />
  </AudienceProvider>
</RootLayout>
```

## Freshness tier model

Every visible metric on the page is tagged with one of four tiers via the
`<FreshnessBadge>` component. Tier definitions live in
`src/data/freshness.ts`:

- **Live** — refreshed every 5–10 minutes by client polling.
- **Daily** — refreshed once per day by Vercel Cron at 06:00 PHT.
- **Weekly** — refreshed once per week (Monday 06:00 PHT).
- **Static** — versioned via commits; "Published" label, no auto-refresh.

The `<FreshnessBanner>` shows the most recent timestamp across all three
live-ish tiers. The `<FreshnessLegend>` popover explains the system in-page.

## Environment variables

| Variable | Purpose | Required for | Tier |
|----------|---------|--------------|------|
| `SUPABASE_URL` | Snapshot read/write | Production + dev | Free |
| `SUPABASE_ANON_KEY` | Public + cron writes (RLS gated) | Production + dev | Free |
| `HUGGINGFACE_API_KEY` | AI narrative synthesis | Production + dev | Free |
| `FIRECRAWL_API_KEY` | Scrape fallback for JS-rendered pages | Production + dev | Free |
| `CRON_SECRET` | Auth for `/api/daily/refresh` | Production (auto) | — |

All free tiers. The brief is designed to run at $0/month.

## Deployment

- Hosting: Vercel Hobby plan
- Region: Singapore (sin1) — closest to PH users
- Cron slots: 2 of 2 used (daily refresh + reserved weekly slot)
- Build: `next build`, Turbopack
- No Edge Functions — all server work is Fluid Compute / Node 24

## Where things live

| Type | Location |
|------|----------|
| Page sections | `src/components/sections/` |
| Charts (Chart.js, Leaflet) | `src/components/charts/` |
| Reusable UI primitives | `src/components/ui/` |
| Layout (Nav, Footer, SectionWrapper) | `src/components/layout/` |
| Data (single source of truth) | `src/data/*.ts` |
| Client hooks | `src/hooks/` |
| Daily pipeline | `src/lib/daily-pipeline/` |
| Supabase client | `src/lib/supabase.ts` |
| API routes | `src/app/api/` |
| Static assets | `public/` |
| Plans + specs | `docs/superpowers/` |
