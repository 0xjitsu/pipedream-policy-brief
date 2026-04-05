<div align="center">

# Pipedream Policy Brief

**Interactive policy dashboard for the Philippine energy crisis**

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://vercel.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Quick Start](#quick-start) · [Features](#whats-inside) · [Data Sources](#live-data-sources) · [Roadmap](docs/ROADMAP.md) · [Contributing](CONTRIBUTING.md)

</div>

---

## Why This Exists

The Philippines faces its worst energy crisis since the 1990s. Supply continuity beyond May 2026 is unconfirmed, cargo premiums have surged 120%+, and 98% of the country's oil imports originate from a single geopolitical flashpoint: the Middle East.

Policymakers are making decisions with fragmented information — DOE data in one spreadsheet, Senate findings in a PDF, market prices in a separate tab. This dashboard consolidates real-time market data, policy analysis, infrastructure mapping, and legislative context into a single decision-support tool for the UPLIFT Committee, the Department of Energy, the Department of Finance, and the Senate.

---

## Quick Start

```bash
git clone https://github.com/0xjitsu/pipedream-policy-brief.git
cd pipedream-policy-brief
npm install
npm run dev       # http://localhost:3000
npm run build     # verify production build
```

No API keys required. All live data is sourced from free, public APIs.

---

## What's Inside

The dashboard is structured as 10 sequential sections, each addressing a distinct dimension of the crisis:

| # | Section | Description |
|---|---------|-------------|
| 1 | **Crisis Overview** | Senate findings, key metrics, live Brent crude price and USD/PHP rate |
| 2 | **Economic Scenarios** | GDP impact modeling across 3 supply scenarios with Chart.js visualizations |
| 3 | **Distribution Channels** | 3 fuel distribution strategies with process flows, pros/cons charts, and readiness gauges |
| 4 | **Policy Pillars** | 5 prioritized pillars (Critical → Strategic) with 17 actionable recommendations |
| 5 | **Not Recommended** | 4 anti-recommendations with sourced reasoning for why they were excluded |
| 6 | **Action Timeline** | Week-by-week implementation roadmap with ownership and dependencies |
| 7 | **Infrastructure** | ASEAN comparison charts and supply chain visualization |
| 8 | **Station Tracker** | 10,000+ gas stations on a Leaflet map with DOE data overlays |
| 9 | **Live News** | RSS aggregation from Al Jazeera, Google News, and Reddit r/Philippines |
| 10 | **References** | 34 consolidated sources with category filters and DOI/article-level links |

---

## How It Works

All content is separated from render logic. Text, numbers, citations, and configuration live in `src/data/` as typed TypeScript modules. Section components receive data as props and are pure render functions — no data fetching inside components.

**Live market data** — `useMarketData()` calls `/api/market` every 10 minutes. The API route proxies Yahoo Finance (Brent crude `BZ=F`) and the Frankfurter/ECB API (USD/PHP). No API keys are required for either source.

**Live news** — `useNewsFeed()` calls `/api/news` every 5 minutes. The API route fetches RSS feeds from Al Jazeera, Google News, and Reddit, parses them server-side, and returns normalized JSON.

**Station map** — OpenStreetMap data provides the base 10,000+ station locations. DOE weekly report overlays are applied client-side via Leaflet. The map is lazy-loaded to avoid SSR issues with Leaflet's DOM dependency.

**Theme** — Dark glass-morphism: navy `#0F1B2D` background, `backdrop-blur` panels, translucent borders, and CSS-first transitions. Hover lift (`translateY(-2px)`) is applied to interactive cards only, with `@media (hover: none)` disabling it on touch devices.

---

<details>
<summary><strong>Project Structure</strong></summary>

```
src/
├── app/
│   ├── api/
│   │   ├── market/    # Brent crude + USD/PHP proxy routes
│   │   └── news/      # RSS aggregation proxy routes
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── charts/        # Chart.js, Leaflet, ProcessFlow, Gantt
│   ├── layout/        # Nav, Footer, ScrollProgress
│   ├── sections/      # 10 page sections (CrisisOverview, EconomicScenarios, etc.)
│   └── ui/            # MetricCard, SectionWrapper, Cite
├── data/              # All content — pillars, channels, references, metrics
├── hooks/             # useMarketData, useNewsFeed, useScrollSpy
└── lib/               # Chart.js defaults, animation utils
```

</details>

<details>
<summary><strong>Developer Setup</strong></summary>

**Prerequisites**

- Node.js 20+ (or Bun)
- Git

**Local development**

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3000`. No environment variables are required for local development — all data sources are public and unauthenticated.

**Build check**

```bash
npm run build
```

Always run a build check before pushing. The build will catch TypeScript errors, import issues, and any SSR-incompatible code (e.g., Leaflet DOM access outside `useEffect`).

**Adding content**

All content changes should go in `src/data/`. Do not embed text, numbers, or citations directly in components. This keeps the render layer stable and makes content audits straightforward.

**Citation standards**

Every claim in the dashboard must link to a specific, verified source URL — not a generic homepage. The References section (`src/data/references.ts`) is the single source of truth for all 34+ sources.

</details>

---

## Live Data Sources

All sources below are free and require no API keys.

| Source | Data | Update Frequency |
|--------|------|-----------------|
| Yahoo Finance (`BZ=F`) | Brent crude oil price | Every 10 minutes |
| Frankfurter / ECB API | USD/PHP exchange rate | Every 10 minutes |
| Al Jazeera RSS | Energy and Middle East news | Every 5 minutes |
| Google News RSS | Philippine fuel news | Every 5 minutes |
| Reddit r/Philippines | Community discussion | Every 5 minutes |

---

## Agent & AI Optimization

This dashboard is designed to be machine-readable and AI-agent friendly:

| Feature | Path | Purpose |
|---------|------|---------|
| `llms.txt` | [`/llms.txt`](https://pipedream-policy-brief.vercel.app/llms.txt) | Standard AI agent discovery file — site overview, key data, API endpoints |
| `llms-full.txt` | [`/llms-full.txt`](https://pipedream-policy-brief.vercel.app/llms-full.txt) | Extended version with all policy recommendations, references, and API schemas |
| JSON-LD | Embedded in page | Schema.org `Report` structured data with keywords, license, publisher |
| Semantic HTML | Throughout | `aria-label`, `role="img"`, heading hierarchy, landmark regions |
| Open APIs | `/api/market`, `/api/news` | JSON endpoints, no authentication required |
| Data/render separation | `src/data/*.ts` | All content in typed TypeScript modules — easy to parse programmatically |

**To cite this dashboard:**

> Pipedream. (2026). "Navigating the Energy Emergency: Philippine Fuel Crisis Policy Brief." Retrieved from https://pipedream-policy-brief.vercel.app

---

## Potential Upgrades

The following data sources would significantly enhance the station tracker and price accuracy. They are documented here for potential sponsors or institutional partners.

| Source | Data | Cost | Notes |
|--------|------|------|-------|
| Google Maps Places API | Station open/closed status | ~$246/full PH scan | Uses `business_status` field |
| MetroFuel Tracker API | 3,757 station prices (NCR) | Free (contact developer) | API planned by developer |
| GlobalPetrolPrices XML | National price benchmarks | Paid subscription | Weekly update cadence |
| PriceLOCQ partner API | 450+ station availability | Partnership required | SEAOIL network only |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org) App Router |
| Styling | [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com) |
| Charts | [![Chart.js](https://img.shields.io/badge/Chart.js-4.5-FF6384?logo=chart.js&logoColor=white)](https://www.chartjs.org) via react-chartjs-2 |
| Maps | [![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)](https://leafletjs.com) + leaflet.markercluster |
| Animation | [![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-black?logo=framer&logoColor=white)](https://www.framer.com/motion/) |
| Language | [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org) |
| Deployment | [![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://vercel.com) Edge CDN |

---

## License

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL v3)**. You may use, modify, and distribute this software freely, provided that any derivative works are also licensed under AGPL v3 and that the source code is made available to users interacting with it over a network.

**Commercial use:** If you intend to use this software in a proprietary product or service without open-sourcing your modifications, a commercial license is available. Contact the maintainer to discuss terms.

**Contributors:** By submitting a pull request, you agree to the Contributor License Agreement (CLA) documented in [CONTRIBUTING.md](CONTRIBUTING.md). The CLA grants the maintainer perpetual rights to relicense contributions, which is necessary to keep the dual-license model viable.

---

<div align="center">

Built for the UPLIFT Committee · Agent-optimized with [llms.txt](https://pipedream-policy-brief.vercel.app/llms.txt)

[Quick Start](#quick-start) · [Report a Bug](https://github.com/0xjitsu/pipedream-policy-brief/issues/new?labels=bug) · [Request a Feature](https://github.com/0xjitsu/pipedream-policy-brief/issues/new?labels=enhancement)

</div>
