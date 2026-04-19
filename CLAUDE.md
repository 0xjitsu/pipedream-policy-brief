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

## Quality Standards (from April 2026 audit)

Every commit should maintain these standards. Run `/web-design-guidelines` before major releases.

### SEO (target: Lighthouse 100)

| Requirement | Implementation |
|-------------|---------------|
| `metadataBase` in layout.tsx | Resolves canonical URLs and OG image paths |
| `export const viewport` (separate from metadata) | Next.js 16 requires separate Viewport export |
| `themeColor` in viewport | Match navy `#0F1B2D` for browser chrome |
| Meta description 150–160 chars | Optimal SERP display length |
| `robots.ts` + `sitemap.ts` | Required for Lighthouse SEO 100 |
| JSON-LD structured data | `Report` schema in page.tsx |
| Preconnect hints | For all external API domains in `<head>` |

### Accessibility (target: Lighthouse 90+)

| Requirement | Why |
|-------------|-----|
| Skip navigation link | First focusable element, links to `#crisis` |
| `focus-visible` ring (global CSS) | Sky-400 ring on all interactive elements |
| `prefers-reduced-motion` media query | Disables all animations and smooth scroll |
| `color-scheme: dark` on `<html>` | Informs browser of dark theme for native controls |
| WCAG AA contrast (4.5:1 minimum) | `text-white-70` for body text, never `text-white-50` for readable content |
| `aria-hidden="true"` on decorative SVGs | All icon SVGs that aren't interactive |
| `aria-label` on nav, charts, selects | Landmark and form element labeling |
| Touch targets 44px minimum | `min-h-[44px]` on all buttons and filter pills |
| Chart text alternatives | `role="img" aria-label="..."` on chart wrappers |

### Performance (target: Lighthouse 90+)

| Requirement | Why |
|-------------|-----|
| LCP section statically imported | First visible section must NOT use `dynamic()` |
| Loading skeletons on dynamic imports | `animate-pulse bg-white-05` placeholders prevent CLS |
| `optimizePackageImports` in next.config | Tree-shake framer-motion, chart.js, react-chartjs-2 |
| Error boundary (`src/app/error.tsx`) | Glass-themed error UI with retry button |
| Cache-Control on API error responses | `s-maxage=60` prevents thundering herd on upstream failures |
| Preconnect/dns-prefetch hints | For CARTO, Yahoo Finance, Frankfurter API |

### Design System

| Token | Value | Usage |
|-------|-------|-------|
| `text-white-90` | rgba(255,255,255,0.9) | Primary emphasis text |
| `text-white-70` | rgba(255,255,255,0.7) | Standard body text (WCAG AA safe) |
| `text-white-50` | rgba(255,255,255,0.5) | Supplementary labels only (fails AA on its own) |
| `text-white-20` | rgba(255,255,255,0.2) | Decorative timestamps, dividers |
| `.glass` | blur(12px) + white/5 bg + white/8 border | All card containers |
| `.glass-hover` | translateY(-2px) + shadow on hover | Interactive cards ONLY |
| `.glass-static` | Prevents hover lift | Full-width non-interactive containers |

### Session Retrospective

#### 2026-04-05 — Full Audit & Hardening

- **What worked:** Parallel 4-agent audit (guidelines, SEO, perf, design) surfaced 50+ issues efficiently
- **What struggled:** `text-white-50` used pervasively for body text — WCAG AA failure not caught until audit
- **Rules added:** Never use `text-white-50` for readable body text. Static import for LCP sections. Always include robots.ts + sitemap.ts from day one. Define ALL color tokens upfront — don't let undefined tokens accumulate.

## Potential Data Source Upgrades (require API keys or partnerships)

| Source | Data | Cost | Notes |
|--------|------|------|-------|
| Google Maps Places API | Station open/closed status | ~$246/full PH scan | `business_status` field |
| MetroFuel Tracker API | 3,757 station prices (NCR) | Free (contact dev) | API planned by developer |
| GlobalPetrolPrices XML | National price benchmarks | Paid subscription | Weekly updates |
| PriceLOCQ partner API | 450+ station availability | Partnership required | SEAOIL network only |

### Performance optimizations (2026-04-19)

- Playfair Display (hero title) + DM Sans (hero subtitle/LCP) preloaded, `adjustFontFallback` on both
- Chart.js components (Supply, GDP/Inflation, ASEAN) dynamic-imported from CrisisOverview
- Client hooks (useMarketData, useNewsFeed, useDailyData) defer initial fetch via `requestIdleCallback`
- Section header fade uses CSS-first `FadeInOnView` (IntersectionObserver) instead of framer-motion
- `MetricCard` also uses FadeInOnView (dropped framer-motion)
- Preconnect hint for Supabase origin
- Reference section favicons set to `loading="lazy"` + `decoding="async"` to avoid competing with LCP

**Lighthouse baseline (production build):**
- Desktop preset: perf **98**, LCP **1.2s**, TBT **30ms**, TTI **1.6s**
- Mobile simulated (default, 4x CPU throttle, 1.6Mbps): perf **~75**, LCP **4.1s**, TBT **440ms**, TTI **8.4s**
- The mobile simulation is conservative; real-world mobile performance sits between these two.
