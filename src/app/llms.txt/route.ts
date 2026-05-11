import { NextResponse } from "next/server";
import { METHODOLOGY_SOURCES } from "@/data/methodology";
import { FRESHNESS_TIERS } from "@/data/freshness";

export const dynamic = "force-static";
export const revalidate = 86_400;

/**
 * GET /llms.txt
 *
 * Concise summary for AI agents and language models, following the
 * llmstxt.org convention. Generated from the project's own data files so
 * it stays in sync without manual edits.
 */
export async function GET(): Promise<Response> {
  const body = buildLlmsTxt();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

function buildLlmsTxt(): string {
  const sourceList = METHODOLOGY_SOURCES.map(
    (s) => `- ${s.name} (${s.tier}, ${s.cadence}) — ${s.provides}`,
  ).join("\n");

  const tierList = (["live", "daily", "weekly", "static"] as const)
    .map((id) => {
      const t = FRESHNESS_TIERS[id];
      return `- ${t.label} (${t.cadence}) — ${t.description}`;
    })
    .join("\n");

  return `# Pipedream Policy Brief

> Interactive policy dashboard for the Philippine energy crisis. Presented
> to the UPLIFT Committee, the Department of Energy, and the Department of
> Finance. Open source under AGPL v3.

## What this is

A single-page Next.js 16 application that consolidates real-time market
data, policy framework, infrastructure mapping, and legislative tracking
into a single decision-support tool for Philippine energy policymakers.

## Data freshness tiers

${tierList}

## Data sources

${sourceList}

## Key sections

- Crisis Overview — live metrics, Senate findings, supply trajectory
- Daily Narrative — AI-synthesized summary of today's shift
- Human Impact — five Filipino persona cards
- Economic Scenarios — GDP impact modeling across three supply scenarios
- Distribution Channels — three fuel relief delivery strategies
- Policy Pillars — five-pillar coordinated response framework
- Anti-Recommendations — what NOT to do (with reasoning)
- Legislative Tracker — bills, EOs, and agency actions with brief's position
- Action Timeline — phased execution schedule with agency accountability
- Infrastructure — sites, capacity, and the missing strategic reserve
- Station Tracker — live map of fuel availability across 10K+ stations
- Live News — RSS aggregator (Al Jazeera, Google News, r/Philippines)
- Methodology & Sources — this content, in-page
- References — every citation, table-form

## Architecture (high level)

Three live data layers + static analytical core:
- Live: Yahoo Finance (Brent), Frankfurter (USD/PHP), RSS feeds (5–10 min)
- Daily: Vercel Cron triggers /api/daily/refresh → DOE + GPP + OSM + LLM
  synthesis → Supabase daily_snapshot upsert
- Weekly: planned (placeholder cron exists)
- Static: every analytical framework (pillars, scenarios, anti-recs)

## More

- Architecture: /ARCHITECTURE.md
- Agent guide: /AGENTS.md
- Contributing: /CONTRIBUTING.md
- Runbook: /docs/RUNBOOK.md
- Full data dump: /llms-full.txt
- Repository: https://github.com/0xjitsu/pipedream-policy-brief
`;
}
