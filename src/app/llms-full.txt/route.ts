import { NextResponse } from "next/server";
import { METHODOLOGY_SOURCES } from "@/data/methodology";
import { FRESHNESS_TIERS } from "@/data/freshness";

export const dynamic = "force-static";
export const revalidate = 86_400;

/**
 * GET /llms-full.txt
 *
 * Comprehensive structured dump for AI agents — extends /llms.txt with
 * full source matrix, environment variables, API endpoints, and pointers
 * to the architecture and operational docs.
 */
export async function GET(): Promise<Response> {
  const body = buildLlmsFullTxt();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

function buildLlmsFullTxt(): string {
  const sourceTable = METHODOLOGY_SOURCES.map(
    (s) =>
      `| ${s.name} | ${s.type} | ${s.tier} | ${s.cadence} | ${s.provides} | ${s.fallback} |`,
  ).join("\n");

  const tierTable = (["live", "daily", "weekly", "static"] as const)
    .map((id) => {
      const t = FRESHNESS_TIERS[id];
      return `| ${t.label} | ${t.cadence} | ${t.description} | ${t.examples.join(", ")} |`;
    })
    .join("\n");

  return `# Pipedream Policy Brief — Full Reference

Comprehensive structured reference for AI agents. For the concise overview
see /llms.txt.

## Project

- Name: Pipedream Policy Brief
- Repository: https://github.com/0xjitsu/pipedream-policy-brief
- License: AGPL v3 with commercial dual-license
- Stack: Next.js 16, TypeScript, Tailwind v4, Chart.js, Leaflet, Supabase,
  HuggingFace Inference, Vercel Cron, Vercel Hobby hosting

## Data freshness tiers

| Tier | Cadence | Description | Examples |
|------|---------|-------------|----------|
${tierTable}

## Data sources

| Source | Type | Tier | Cadence | Provides | Fallback |
|--------|------|------|---------|----------|----------|
${sourceTable}

## API endpoints

| Path | Method | Auth | Purpose |
|------|--------|------|---------|
| /api/market | GET | none | Brent crude + USD/PHP (cached 10 min) |
| /api/news | GET | none | Aggregated RSS feed events (cached 5 min) |
| /api/daily | GET | none | Latest daily_snapshot row |
| /api/daily/refresh | POST/GET | CRON_SECRET Bearer | Runs the daily pipeline |
| /api/weekly/refresh | POST/GET | CRON_SECRET Bearer | Placeholder; no-op for now |
| /llms.txt | GET | none | Agent-friendly project overview |
| /llms-full.txt | GET | none | This document |
| /robots.txt | GET | none | Allow all crawlers |
| /sitemap.xml | GET | none | Single-page sitemap |
| /icon | GET | none | Dynamic favicon (edge ImageResponse) |
| /opengraph-image | GET | none | Dynamic OG image |
| /twitter-image | GET | none | Dynamic Twitter card |

## Environment variables

| Variable | Purpose | Set in |
|----------|---------|--------|
| SUPABASE_URL | Snapshot read/write | production, preview, development |
| SUPABASE_ANON_KEY | Public reads + cron writes (RLS-gated) | production, preview, development |
| HUGGINGFACE_API_KEY | AI narrative synthesis | production, preview, development |
| FIRECRAWL_API_KEY | Scrape fallback for JS-rendered pages | production, preview, development |
| CRON_SECRET | Auth for /api/*/refresh endpoints | production (auto by Vercel) |

## Directory layout

\`\`\`
src/
├── app/
│   ├── api/{market,news,daily,daily/refresh,weekly/refresh}/route.ts
│   ├── {llms.txt,llms-full.txt,robots.ts,sitemap.ts}
│   ├── {icon,opengraph-image,twitter-image}.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── charts/        # Chart.js + Leaflet (all dynamic-imported)
│   ├── layout/        # Nav, Footer, SectionWrapper, ScrollProgress, AudienceMain
│   ├── sections/      # 13+ page sections, each a self-contained module
│   └── ui/            # Reusable primitives (FreshnessBadge, MetricCard, FadeInOnView, etc.)
├── contexts/
│   └── AudienceContext.tsx
├── data/              # Single source of truth — all content as TypeScript
├── hooks/             # useMarketData, useNewsFeed, useDailyData, useDeferredMount, useScrollSpy
└── lib/
    ├── daily-pipeline/  # Fetchers, orchestrator, synthesizer, fetchLog
    └── supabase.ts
\`\`\`

## Documentation index

- README.md — project overview, quick start, features
- ARCHITECTURE.md — system structure, data flow, freshness tiers
- AGENTS.md — AI agent contribution guide (provider-neutral)
- CONTRIBUTING.md — human contributor guide
- CHANGELOG.md — version history
- SECURITY.md — vulnerability disclosure policy
- CODE_OF_CONDUCT.md — Contributor Covenant 2.1
- CLAUDE.md — Claude-specific project rules + retrospectives
- docs/RUNBOOK.md — operational playbooks
- docs/ROADMAP.md — what's coming next
- docs/AUDIT-2026-04-06.md — 2026-04-06 site audit
- docs/superpowers/specs/ — design specs (this session's specs live here)
- docs/superpowers/plans/ — implementation plans (this session's plans live here)

## Pipeline behavior

Trigger: Vercel Cron at \`0 22 * * *\` UTC (06:00 PHT) calls /api/daily/refresh.

Pipeline (src/lib/daily-pipeline/index.ts):
1. readLatestSnapshot() — fetch previous day's row for delta computation
2. Promise.all([fetchPumpPrice(), fetchAseanPrices(), fetchStationSnapshot()])
3. computeSupplyDays(prev) — linear extrapolation
4. synthesizeNarrative({ snapshot, previous, recentHeadlines })
5. writeSnapshot() — upsert daily_snapshot by snapshot_date

Each fetcher returns null on failure; pipeline degrades gracefully. The
UI falls back to hardcoded values from src/data/crisis-overview.ts when
snapshot fields are null.

## Verification

To verify any numeric claim in the brief:
1. Open the section showing the claim.
2. Click the source link in the metric card or table footer.
3. The source URL is always specific (article-level), never a generic homepage.

To verify the AI-synthesized narrative:
1. Compare each number in the narrative body to the snapshot.
2. The pipeline's hallucination validator rejects any number not present
   in the source snapshot — so all numbers should be cross-referenceable
   to the metric cards or table data directly below the narrative.

`;
}
