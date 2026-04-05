# Pipedream Policy Brief — Roadmap

> From policy dashboard to institutional decision-support platform.

**Last updated:** April 5, 2026
**Current version:** 0.1.0 (public beta)
**Live:** [pipedream-policy-brief.vercel.app](https://pipedream-policy-brief.vercel.app)

---

## Where We Are (v0.1 — Shipped)

The dashboard is production-ready with 10 sections, 12 charts, live market data, 10,469 mapped stations, and an agent-optimized surface (llms.txt, JSON-LD, open APIs). It consolidates DOE, Senate, market, and infrastructure data into a single decision-support tool.

**What's working:**
- Live Brent crude + USD/PHP polling (10-min interval, Yahoo Finance + ECB)
- Live news aggregation from 4 RSS feeds + Reddit (5-min interval)
- Interactive Leaflet station map with clustering and status overlays
- 5 policy pillars, 3 distribution channel analyses, 4-phase action timeline
- AGPL-3.0 dual-license, CLA, CONTRIBUTING.md, CI/CD (daily auto-deploy)
- AI agent discoverability (llms.txt, llms-full.txt, JSON-LD, semantic HTML)
- Lighthouse 90+ across all categories

**What's missing:** Real-time station status, Filipino translation, DOE API integration, automated testing, multi-page depth, institutional partnerships.

---

## Phase 1 — Data Credibility (v0.2)

*Timeline: 2–4 weeks · Priority: Critical*
*Why: The dashboard's value is only as good as its data freshness and accuracy.*

### 1.1 DOE Weekly Report Integration

| Item | Detail |
|------|--------|
| **What** | Parse DOE's weekly fuel price monitoring report PDF and overlay on station map |
| **Why** | Replaces static "₱130+/L" with actual per-region, per-product pump prices |
| **How** | Server-side PDF scraper → `/api/doe-prices` → `useDOEPrices()` hook |
| **Effort** | Medium (3–5 days) |
| **Blocker** | DOE publishes PDFs, not APIs — scraper must handle format changes |

### 1.2 Station Status Verification

| Item | Detail |
|------|--------|
| **What** | Cross-reference OSM station data with Google Maps `business_status` field |
| **Why** | 425 "closed" stations are estimated — Google Places gives ground truth |
| **Cost** | ~$246 for full PH scan (10,469 stations × $0.024/request) |
| **Sponsor opportunity** | One-time data purchase, reusable monthly |
| **Alternative** | Community-sourced status updates via GitHub Issues template |

### 1.3 MetroFuel Tracker API

| Item | Detail |
|------|--------|
| **What** | Integrate 3,757 NCR station prices from MetroFuel's upcoming API |
| **Why** | Most granular station-level pricing data available in PH |
| **Status** | API planned by developer — contact for beta access |
| **Effort** | Low (1–2 days once API is available) |

### 1.4 Historical Price Tracking

| Item | Detail |
|------|--------|
| **What** | Store daily Brent + USD/PHP + diesel snapshots in Supabase |
| **Why** | Enable trend charts, week-over-week deltas, "price since crisis started" |
| **How** | Cron job (daily) → Supabase insert → `/api/price-history` endpoint |
| **Effort** | Low (1–2 days) |

---

## Phase 2 — Reach & Accessibility (v0.3)

*Timeline: 4–6 weeks · Priority: High*
*Why: Policymakers, journalists, and the public need to access this in their language and format.*

### 2.1 Filipino/Tagalog Translation

| Item | Detail |
|------|--------|
| **What** | Full i18n with language toggle (EN/FIL) |
| **Why** | Policy briefs for Philippine government should be readable in Filipino |
| **How** | `next-intl` or custom i18n with `/en` and `/fil` routes |
| **Scope** | All 10 sections, nav, footer, ticker, tooltips |
| **Contributor opportunity** | Translation review by native speakers |

### 2.2 PDF Export

| Item | Detail |
|------|--------|
| **What** | "Download as PDF" button generating a print-optimized policy brief |
| **Why** | Senate committees and DOE staff work from printed/emailed PDFs |
| **How** | `@react-pdf/renderer` or `puppeteer` server-side generation |
| **Scope** | Cover page, executive summary, key charts, recommendations, references |
| **Effort** | Medium (3–5 days) |

### 2.3 Embeddable Widgets

| Item | Detail |
|------|--------|
| **What** | Standalone `<iframe>` widgets for key metrics (supply gauge, price ticker, station map) |
| **Why** | News outlets and government portals can embed live data without building their own |
| **How** | `/embed/supply`, `/embed/prices`, `/embed/map` routes with minimal chrome |
| **Effort** | Medium (2–3 days per widget) |

### 2.4 Mobile PWA

| Item | Detail |
|------|--------|
| **What** | Progressive Web App with offline support and push notifications |
| **Why** | Field workers and LGU officials need mobile-first access in low-connectivity areas |
| **How** | `next-pwa`, service worker caching, web push for price alerts |
| **Effort** | Medium (3–4 days) |

---

## Phase 3 — Analytical Depth (v0.4)

*Timeline: 6–10 weeks · Priority: Medium*
*Why: Move from "what's happening" to "what should we do about it" with scenario modeling.*

### 3.1 Interactive Scenario Builder

| Item | Detail |
|------|--------|
| **What** | User-adjustable sliders for oil price, exchange rate, and supply duration |
| **Why** | Policymakers can model "what if Brent hits $150?" or "what if supply drops to 30 days?" |
| **How** | Client-side calculator with Chart.js updating in real-time |
| **Outputs** | GDP impact, inflation forecast, fiscal cost of each channel, days to depletion |
| **Effort** | High (5–7 days) |

### 3.2 Supply Chain Simulation

| Item | Detail |
|------|--------|
| **What** | Animated flow diagram showing oil from source → tanker → depot → station |
| **Why** | Visualizes the 98% Middle East dependence and single-point-of-failure risk |
| **How** | deck.gl or custom SVG animation with chokepoint highlighting |
| **Effort** | High (5–7 days) |

### 3.3 ASEAN Benchmarking Deep Dive

| Item | Detail |
|------|--------|
| **What** | Dedicated comparison page: PH vs MY, TH, ID, VN, SG on fuel policy, pricing, reserves |
| **Why** | "Why can Malaysia sell fuel at ₱45/L?" is the most common public question |
| **How** | Multi-page route `/asean` with per-country profiles |
| **Data** | IEA, World Bank, national energy ministry reports |

### 3.4 Sentiment Analysis Dashboard

| Item | Detail |
|------|--------|
| **What** | NLP-powered sentiment tracking on energy crisis coverage |
| **Why** | Track public mood shift, identify misinformation, measure policy announcement impact |
| **How** | Hugging Face Inference API (free) → sentiment scores on news headlines |
| **Effort** | Medium (3–4 days) |

---

## Phase 4 — Institutional Platform (v1.0)

*Timeline: 10–16 weeks · Priority: Strategic*
*Why: Transform from a one-off brief into a standing institutional tool.*

### 4.1 Multi-Stakeholder Dashboards

| Audience | Tailored View |
|----------|---------------|
| **DOE** | Supply metrics, station status, import pipeline, weekly compliance |
| **DOF** | Fiscal impact modeling, subsidy cost projections, revenue impact |
| **Senate** | Hearing prep briefs, legislative tracker, committee action items |
| **LGUs** | Local station availability, regional pricing, community impact scores |
| **Media** | Embeddable charts, press-ready data exports, headline tracker |

### 4.2 API Platform

| Item | Detail |
|------|--------|
| **What** | Public REST + GraphQL API with rate limiting and optional API keys |
| **Why** | Researchers, journalists, and other tools should be able to query our data |
| **Endpoints** | `/api/v1/prices`, `/api/v1/stations`, `/api/v1/supply`, `/api/v1/news` |
| **Docs** | OpenAPI spec served at `/api/docs` |

### 4.3 Collaborative Annotations

| Item | Detail |
|------|--------|
| **What** | Allow verified government users to annotate data points with context |
| **Why** | DOE can flag "this station reopened" or "this price is incorrect" |
| **How** | Supabase auth + RLS policies, annotation layer on charts and map |

### 4.4 Automated Intelligence Briefs

| Item | Detail |
|------|--------|
| **What** | AI-generated daily/weekly summary email to subscribers |
| **Why** | Decision-makers don't have time to check dashboards daily |
| **How** | Cron → aggregate latest data → AI SDK summarize → Resend email |
| **Frequency** | Daily briefing (5am PHT), weekly deep dive (Monday 8am) |

---

## For Sponsors & Partners

### Why Sponsor This Project?

1. **Public good** — Open-source tool addressing a national emergency affecting 115M Filipinos
2. **Institutional credibility** — Already presented to UPLIFT Committee, DOE, and DOF
3. **Low cost, high impact** — Key data upgrades cost $250–$500 total (Google Places, hosting)
4. **Attribution** — Sponsor logo in footer, README, and llms.txt
5. **Dual license** — Commercial license available for organizations that need proprietary deployment

### Sponsorship Tiers

| Tier | Contribution | Recognition |
|------|-------------|-------------|
| **Data Partner** | Provide API access or data feeds | Logo + "Data provided by" attribution |
| **Infrastructure Sponsor** | Cover hosting, API costs ($50–250/mo) | Logo + sponsor badge in nav |
| **Development Partner** | Contribute engineering time or fund features | Logo + co-maintainer credit |
| **Institutional Adopter** | Deploy internally, provide feedback loop | Priority feature requests, SLA |

### Immediate Sponsorship Opportunities

| Opportunity | Cost | Impact |
|-------------|------|--------|
| Google Places API scan (station verification) | ~$246 one-time | Ground-truth status for 10,469 stations |
| Vercel Pro hosting (faster builds, analytics) | $20/mo | Better performance monitoring |
| Filipino translation review | Volunteer or $500 contracted | 60M+ potential Filipino readers |
| DOE PDF scraper maintenance | $200/mo contracted | Weekly automated price updates |

### For AI/Tech Companies

This dashboard is **agent-optimized** — a reference implementation of how policy tools should work with AI:

- **llms.txt** and **llms-full.txt** for agent discovery
- **Open JSON APIs** (no auth required) for programmatic access
- **JSON-LD structured data** for search engine and AI understanding
- **Semantic HTML** with ARIA labels for accessibility bots
- **Data/render separation** — all content in typed TypeScript modules, easy to parse

If you're building energy AI, crisis response tools, or government tech — this is a collaboration surface.

---

## For Contributors

### Good First Issues

| Issue | Difficulty | Skills |
|-------|-----------|--------|
| Add Filipino translations for section headers | Easy | Filipino language |
| Add missing station brands (Unioil, Total, Caltex) | Easy | Data entry, OSM |
| Create loading skeleton for station map | Easy | React, Tailwind |
| Add "Share this section" buttons | Easy | React, Web Share API |
| Write automated tests for API routes | Medium | Jest/Vitest, Next.js |
| Implement PDF export for recommendations | Medium | React-PDF or Puppeteer |
| Add historical price chart (30-day trend) | Medium | Chart.js, Supabase |
| Build embeddable supply gauge widget | Medium | Next.js routing, iframes |

### Architecture Decisions Needed (RFCs Welcome)

1. **i18n approach** — `next-intl` vs custom context vs URL-based (`/en`, `/fil`)
2. **Database** — Supabase (Postgres) vs Vercel KV vs edge-only (no DB)
3. **Auth for annotations** — Supabase Auth vs Clerk vs simple magic links
4. **PDF generation** — Client-side (`@react-pdf/renderer`) vs server-side (Puppeteer)
5. **Mobile strategy** — PWA vs React Native vs responsive-only

---

## Metrics We're Tracking

| Metric | Current | Target (v1.0) |
|--------|---------|---------------|
| Lighthouse Performance | 90+ | 95+ |
| Lighthouse Accessibility | 90+ | 100 |
| Lighthouse SEO | 100 | 100 |
| Stations mapped | 10,469 | 12,000+ |
| Data sources | 34 | 50+ |
| Live API feeds | 2 (Brent, PHP) | 6+ (add diesel, supply, DOE, sentiment) |
| Languages | 1 (EN) | 2 (EN, FIL) |
| Contributors | 1 | 10+ |
| Institutional users | 3 (UPLIFT, DOE, DOF) | 10+ |

---

## Contact

- **GitHub:** [github.com/0xjitsu/pipedream-policy-brief](https://github.com/0xjitsu/pipedream-policy-brief)
- **Issues:** [Report a bug or request a feature](https://github.com/0xjitsu/pipedream-policy-brief/issues/new)
- **License:** AGPL-3.0 (open source) + commercial license available

---

*This roadmap is a living document. PRs welcome.*
