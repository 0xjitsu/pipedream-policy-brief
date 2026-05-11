# Changelog

All notable changes to the Pipedream Policy Brief are documented here.
This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

The brief is a single-page Next.js app; "releases" correspond to coherent
chunks of work landing on `main`. Date-stamped entries below describe what
shipped on that day.

## [Unreleased]

### Added — Documentation completeness (2026-04-19)
- `CHANGELOG`, `ARCHITECTURE`, `AGENTS`, `SECURITY`, `CODE_OF_CONDUCT` at repo root.
- Expanded `CONTRIBUTING.md` from 53 → 146 lines with full dev workflow + PR checklist.
- `docs/RUNBOOK.md` with operational playbooks for the daily pipeline,
  per-source debug paths, and migration-recovery instructions.
- In-page "Methodology & Sources" section between News and References,
  fed by `src/data/methodology.ts`, surfacing data freshness tiers,
  source matrix, AI synthesis explainer, and contribute callout.
- Dynamic `/llms.txt` and `/llms-full.txt` route handlers
  (`src/app/llms.txt/route.ts`, `src/app/llms-full.txt/route.ts`)
  replacing the static `public/llms*.txt` files. Generated from
  `methodology.ts` and `freshness.ts` so they auto-update.

### Changed — Mobile LCP refactor
- Hoisted hero `<header>` above `<AudienceProvider>` boundary so the hero
  is pure SSR. Mobile-simulated Lighthouse: perf 37 → 56, LCP 6.9s → 3.8s,
  TBT 4540ms → 3650ms (single-run deltas). `Nav`, `Ticker`,
  `FreshnessBanner`, and `AudienceMain` remain inside the provider.

### Added — Diagnostic table
- `public.fetch_log` Supabase table (per-source/strategy diagnostic log)
  applied. Already wired in `fetchLog.ts` — table existence now matches.

---

## [2026-04-19] — Daily pipeline, AI synthesis, performance baseline

### Added — Visual freshness system (Phase 1)
- Four-tier badge taxonomy (Live / Daily / Weekly / Static / Stale) rendered
  across every section via `FreshnessBadge` (`src/components/ui/FreshnessBadge.tsx`).
- Global `FreshnessBanner` pinned under the nav ticker showing the latest
  generated-at timestamp.
- `FreshnessLegend` popover modal explaining tiers in-page.
- Tier definitions + stale thresholds in `src/data/freshness.ts`.

### Added — Daily data pipeline (Phase 2)
- Vercel Cron schedule `0 22 * * *` (06:00 PHT) triggering
  `/api/daily/refresh` (`src/app/api/daily/refresh/route.ts`).
- Fan-out fetchers in `src/lib/daily-pipeline/`:
  - `fetchPumpPrice` — DOE Oil Industry Monitor scrape
  - `fetchAseanPrices` — GlobalPetrolPrices scrape with index-pair extractor
  - `fetchStationSnapshot` — OSM Overpass node count, three-endpoint mirror cycle
  - `computeSupplyDays` — linear extrapolation from the existing weekly trend
- Snapshot persistence in Supabase `daily_snapshot` table; one row per date,
  upserted on conflict.
- Client read path: `useDailyData()` hook (`src/hooks/useDailyData.ts`)
  polls `/api/daily` hourly and renders stale state after 36h.

### Added — AI narrative synthesis (Phase 3)
- HuggingFace Inference API (`meta-llama/Meta-Llama-3-8B-Instruct`) generates
  a 2–4 sentence daily brief from the snapshot. Free tier, no key in env
  beyond `HUGGINGFACE_API_KEY`.
- Deterministic template fallback when HF is unavailable or rate-limited.
- Hallucination guard rejects narratives whose numbers aren't in the source
  snapshot (`validateNarrative` in `synthesizeNarrative.ts`).
- `DailyNarrative` section component renders between hero and Crisis
  Overview with four signal arrows (Brent / Peso / Pump / Supply).

### Added — Resilient fetchers
- firecrawl fallback for JS-rendered DOE and GPP pages (`firecrawl.ts`).
- Google News RSS tertiary fallback for pump price when DOE is Cloudflare-blocked.
- OSM Overpass cycles through `overpass-api.de`, `overpass.kumi.systems`,
  `overpass.private.coffee`.
- `fetch_log` Supabase table for per-source diagnostics (`fetchLog.ts`).

### Added — Environment wiring
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `HUGGINGFACE_API_KEY`,
  `FIRECRAWL_API_KEY` set across production / preview / development.
- `CRON_SECRET` auto-set by Vercel for the cron handler.

### Changed — Performance
- Lighthouse mobile-simulated perf: **45 → 76** (script-eval 3.9s → 2.2s,
  TBT 990ms → 440ms).
- Lighthouse desktop preset: **98 / LCP 1.2s / TBT 30ms / TTI 1.6s**.
- Wins: dynamic-imported Chart.js components from `CrisisOverview`;
  replaced framer-motion in `SectionWrapper` and `MetricCard` with
  CSS-first `FadeInOnView`; deferred client-hook polling via
  `requestIdleCallback`; preloaded DM Sans (LCP font);
  lazy-loaded reference favicons.

### Changed — Accessibility
- Heading hierarchy: eight `<h4>` → `<h3>` (Lighthouse a11y heading-order).
- Contrast: `text-white-30` → `text-white-50` across readable text.
- Accessibility score: 95 → 97.

### Fixed
- Mobile nav drawer z-index conflict with metric cards.
- Hardcoded "Updated March 31, 2026" replaced with live `FreshnessBadge`
  fed by the daily snapshot in `StationTracker`.

### Known limitations
- DOE oil-monitor is Cloudflare-protected — direct fetch and firecrawl both
  receive the challenge page. Google News RSS fallback is noisier.
- Supabase MCP `apply_migration` intermittently fails with `net::ERR_FAILED`;
  apply via dashboard SQL editor when this happens.
- Mobile Lighthouse plateaus at perf ~75 / LCP ~4.1s under simulated
  throttling. Desktop preset and real-world mobile are unaffected.

---

## Earlier work

Pre-2026-04-19 history lives in the git log directly. The first version of
the brief (initial commits) shipped on 2026-03-30 covering: hero,
CrisisOverview, EconomicScenarios, DistributionChannels, PolicyPillars,
AntiRecommendations, ActionTimeline, Infrastructure, StationTracker,
NewsFeed, References, PublicRoadmap.
