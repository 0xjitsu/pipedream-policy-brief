# Documentation Completeness & Session Archive — Design Spec

**Date:** 2026-04-19
**Status:** Approved — ready for implementation plan

## Context

This session shipped Phase 1 (visual freshness system), Phase 2 (daily Vercel Cron pipeline + Supabase snapshots), Phase 3 (HuggingFace AI synthesis + DailyNarrative), the perf-to-90 plan (Lighthouse desktop 98 / mobile 75), and the resilient-fetchers plan (firecrawl fallback + OSM 3-mirror cycle + GPP index-pairing extractor). Total: ~50 commits across 9 numbered implementation plans.

The result is a complex, production-deployed application — but the repo's contributor onramp hasn't kept pace. README is solid; CONTRIBUTING is short; CHANGELOG, ARCHITECTURE, AGENTS.md, SECURITY, and CODE_OF_CONDUCT are missing. The website doesn't surface the "how this works" story to readers who might want to verify or contribute. Three commits sit unpushed; one Supabase migration is pending; one experimental task (LCP boundary) is undecided.

This spec defines the documentation set + website surface + cleanup work needed to archive the session and enable humans + AI agents to contribute confidently.

## Goals

1. **Repo readable cold** — a new human contributor (or fresh agent) can run the app, understand its architecture, and submit a useful PR within an hour, using only files in the repo.
2. **Website self-explaining** — a reader on the live brief can find out exactly how each number is computed and how often it refreshes without leaving the page.
3. **Agent-friendly** — AGENTS.md + expanded CONTRIBUTING surface the conventions and pitfalls (Cloudflare-blocked DOE, MCP flakes, scrape fragility) that have already been learned, so future agents don't relearn them.
4. **Session is archivable** — three outstanding commits pushed, all Phase 2/3/perf/fetchers work reflected in CHANGELOG, follow-ups documented, retrospective written.
5. **YAGNI** — no new website routes, no auto-generated changelog tooling, no abstract templates. Curated content only.

## Non-goals

- Build a `/docs` route or multi-page docs site (rejected during brainstorming — embedded section preferred to preserve linear-narrative reading).
- Adopt conventional commits / changesets / semantic-release (rejected — manual curation chosen).
- Auto-publish releases on GitHub Releases (out of scope).
- Refactor `CLAUDE.md` (it stays as the Claude-specific project rules file; ARCHITECTURE.md extracts the structural pieces for the wider audience).

---

## Section 1 — Repo documentation files

Seven new/expanded markdown files. All committed at repo root unless noted.

### 1.1 `CHANGELOG.md` — manually curated

Single comprehensive entry covering 2026-04-19 release, grouped by phase.

Structure:
```
# Changelog

All notable changes to the Pipedream Policy Brief are documented here.
Format: Keep a Changelog (https://keepachangelog.com/en/1.1.0/).

## [Unreleased]
- (placeholder for next iteration)

## [2026-04-19] — Daily pipeline, AI synthesis, performance baseline

### Added
- **Visual freshness system** (Phase 1) — four-tier badge taxonomy
  (Live / Daily / Weekly / Static / Stale) rendered across every section.
  Global FreshnessBanner under the nav ticker. FreshnessLegend modal
  explains tiers in-page. See: src/data/freshness.ts.
- **Daily data pipeline** (Phase 2) — Vercel Cron at 06:00 PHT triggers
  /api/daily/refresh, which fans out to DOE pump price, GlobalPetrolPrices
  ASEAN, OSM Overpass station count, and a computed days-of-supply value.
  Result upserted to Supabase daily_snapshot table. Hourly client poll
  via useDailyData() hook.
- **AI narrative synthesis** (Phase 3) — HuggingFace Inference API
  (Llama-3-8B-Instruct) generates a 2-4 sentence daily brief from the
  snapshot. Deterministic template fallback when HF is unavailable.
  Hallucination guard rejects narratives with numbers outside the snapshot.
  DailyNarrative component renders between hero and Crisis Overview with
  signal arrows (Brent/Peso/Pump/Supply).
- **Resilient fetchers** — firecrawl fallback for JS-rendered DOE/GPP
  pages; Google News RSS tertiary fallback for pump price; OSM Overpass
  cycles through 3 endpoints (overpass-api.de, kumi.systems, private.coffee).
  fetch_log table records per-source diagnostics.
- **dev/preview/production env wiring** — SUPABASE_URL, SUPABASE_ANON_KEY,
  HUGGINGFACE_API_KEY, FIRECRAWL_API_KEY set across all three envs.

### Changed
- **Performance: Lighthouse 45 → 76 (mobile simulated), 98 (desktop)**.
  TBT 990ms → 440ms. Script-eval 3.9s → 2.2s. Wins: dynamic-imported
  Chart.js components from CrisisOverview; replaced framer-motion in
  SectionWrapper + MetricCard with CSS-first FadeInOnView; deferred
  client-hook polling via requestIdleCallback; preloaded DM Sans (LCP
  font) + lazy-loaded reference favicons.
- **Heading hierarchy** — eight `<h4>` → `<h3>` to fix Lighthouse a11y
  heading order. Accessibility 95 → 97.
- **Contrast** — bumped text-white-30 → text-white-50 across readable
  text. WCAG AA passing for body text.

### Fixed
- Mobile nav z-index conflict — drawer now sits above metric cards.
- DOE station hardcoded date "March 31, 2026" replaced with live
  FreshnessBadge fed by the daily snapshot.

### Known limitations
- DOE oil-monitor page blocked by Cloudflare, even via firecrawl.
  Google News RSS fallback is noisier but works.
- Supabase MCP intermittently fails on apply_migration (`net::ERR_FAILED`).
  Apply fetch_log table manually via dashboard until MCP recovers.
- Mobile Lighthouse plateaus at perf 75 due to AudienceProvider client
  boundary wrapping the hero. Optional refactor measured and gated.
```

(Full code blocks above are illustrative; final entry written from actual commit log.)

### 1.2 `ARCHITECTURE.md`

Extracts and expands the architecture content currently in CLAUDE.md. Sections:

- **System overview** — single-page Next.js 16 brief with two live data layers (5-10 min market polling, hourly daily snapshot) on top of a static analytical core (scenarios, pillars, anti-recs, references).
- **Data flow diagram** — ASCII or Mermaid. Vercel Cron → /api/daily/refresh → fetchers (Promise.all) → Supabase upsert → client useDailyData hook → MetricCard / DailyNarrative / StationTracker.
- **Freshness tier model** — table from `src/data/freshness.ts` plus per-section mapping.
- **Component tree** — high-level (Nav → Ticker → FreshnessBanner → hero → AudienceMain → sections).
- **Env-var matrix** — env var → purpose → where set → free tier.
- **Deployment** — Vercel Hobby, Cron at 22:00 UTC, AI Gateway not used (zero-cost requirement).

### 1.3 `AGENTS.md`

Agent-first contribution guide. Conventions adopted from CLAUDE.md but provider-neutral. Sections:

- **Quick-start commands** — `npm run dev`, `npm run build`, smoke-test scripts.
- **Where to put things** — data → `src/data/*.ts`, sections → `src/components/sections/`, charts → `src/components/charts/`, pipeline → `src/lib/daily-pipeline/`, hooks → `src/hooks/`.
- **Don't do** — `git add .`, `--no-verify`, modify `node_modules`, hardcode secrets.
- **Always do** — verify build before commit, stage specific files, present-tense imperative commit messages, explain the **why**.
- **Patterns** — additive schema evolution (`fieldName?: type`), CSS transitions over JS animation, dynamic imports for below-fold sections, FadeInOnView for fade-on-scroll.
- **Known pitfalls** — DOE Cloudflare block (use Google News fallback), Supabase MCP flake (use dashboard), OSM rate-limits (cycle mirrors), text-white-30 fails WCAG AA (use white-50+ for readable content).
- **PR checklist** — build clean, Lighthouse delta noted if perf-relevant, snapshot smoke-tested if pipeline touched, screenshot for visual changes.
- **Agent loop discipline** — if MCP fails twice, fall back to inline; if subagent hits token limit, switch to direct execution; never `git push --force` without explicit user consent.

### 1.4 `SECURITY.md`

Short — this is a public-data brief, low blast radius:

- **Reporting** — email `bernadettemisa403@gmail.com` (per session userEmail). Subject: `Pipedream Policy Brief — Security`.
- **Scope** — auth bypass on /api/daily/refresh, secret leakage, XSS in news/narrative rendering, supply-chain via dependencies.
- **Out of scope** — accuracy of scraped data (use citation), Lighthouse score deficits, third-party API rate limits.
- **No bounty** — best-effort coordinated disclosure.

### 1.5 `CODE_OF_CONDUCT.md`

Standard **Contributor Covenant v2.1** verbatim. Project contact: `bernadettemisa403@gmail.com`.

### 1.6 `CONTRIBUTING.md` (expand from current 53 lines)

Restructured sections:

- **Dev environment** — Node 22+, npm or bun, recommended VS Code extensions (Tailwind, TypeScript), `cp .env.example .env.local` (works without keys — only live features degrade).
- **First contribution path** — pick a section, read its data file in `src/data/`, edit content, submit PR. No build system to understand for content fixes.
- **Data update workflow** — how to add a new reference (`src/data/references.ts`), update a metric, change a chart input. Schema rules: every source needs `source` + `sourceUrl`; Unicode characters directly, never `\uXXXX` escapes.
- **Adding a new section** — checklist: create `src/data/<topic>.ts`, create `src/components/sections/<Topic>.tsx`, add to Nav + page.tsx (dynamic import), apply tier to `<SectionWrapper>`, write tests if logic.
- **Modifying the daily pipeline** — when to add a new fetcher, fetch_log conventions, how to test locally (`curl -H "Authorization: Bearer dev-only-secret" http://localhost:3008/api/daily/refresh`).
- **Performance guardrails** — never static-import a chart, always Lazy-load below-fold sections, prefer CSS animations, run `npm run build` and verify no LCP regression.
- **Accessibility guardrails** — heading hierarchy (h2 sections, h3 sub), `text-white-70` for body, `aria-label` on charts.
- **PR checklist** — see "PR checklist" in AGENTS.md.
- **License + CLA** — by submitting a PR you agree to license your contribution under AGPL v3 and grant the maintainer relicensing rights for dual-licensing.

### 1.7 `docs/RUNBOOK.md`

Operational runbook for the pipeline:

- **How to trigger the daily cron manually** — local curl + production "Run now" via Vercel dashboard.
- **How to inspect a snapshot** — Supabase SQL query for daily_snapshot, fetch_log query.
- **How to debug a stale banner** — check generated_at, force a refresh, check cron logs in Vercel.
- **When each fetcher is likely to fail** — DOE: Cloudflare always; expect Google News fallback. GPP: structure changes occasionally; rerun index-pair extraction. OSM: rate-limit → next mirror.
- **Restoring the pipeline after a Supabase outage** — re-run cron once the project is back; the table is idempotent (snapshot_date primary key).
- **Applying a pending migration when MCP flakes** — dashboard SQL editor URL + paste-and-run instructions.

---

## Section 2 — Embedded "Methodology & Sources" website section

### Placement

New section inserted in `src/app/page.tsx` immediately after `<NewsFeed />`, before `<References />`. Anchor id: `methodology`. Added to Nav between News and References.

### Component

`src/components/sections/MethodologyAndSources.tsx`:

- Uses `<SectionWrapper id="methodology" title="Methodology & Sources" icon="🔬" tier="static" subtitle="How every number on this page is sourced and refreshed.">`.
- `data-audience="analyst"` wrapper so executive/public modes hide it (it's most useful to implementers and researchers).
- Dynamic-imported in `page.tsx` (matches all other below-fold sections).

### Content blocks

Four glass cards rendered in sequence:

1. **Data freshness tiers** — reuses the same `FRESHNESS_TIERS` constant from `src/data/freshness.ts`. Renders a 4-row table with: color dot, tier label, cadence, examples. Visually identical to FreshnessLegend modal but as a permanent in-page section.

2. **Data source matrix** (Section 2.4 below) — table fed by new `src/data/methodology.ts`. Columns:

| Source | Type | Tier | Refreshed | Fallback when down |
|--------|------|------|-----------|--------------------|
| Yahoo Finance (Brent crude) | Live API | Live | 10 min poll | Cached value |
| Frankfurter / ECB (USD/PHP) | Live API | Live | 10 min poll | Cached value |
| Google News RSS / Al Jazeera RSS / r/Philippines | RSS | Live | 5 min poll | Show last 24h cached |
| DOE Oil Industry Monitor | HTML scrape | Daily | 24h cron | firecrawl → Google News RSS |
| GlobalPetrolPrices | HTML scrape | Daily | 24h cron | firecrawl + index-pair extractor |
| OSM Overpass | API | Daily | 24h cron | 3-endpoint mirror cycle |
| Days of Supply (derived) | Computed | Daily | 24h cron | Linear extrapolation |
| HuggingFace Inference (Llama-3-8B) | LLM API | Daily | 24h cron | Deterministic template |

3. **AI synthesis explainer** — three short paragraphs: what the synthesis does, what it can't hallucinate (with reference to the validator), how to verify (compare narrative numbers to the snapshot below).

4. **Contribute callout** — links to:
   - GitHub repo (top of README)
   - CONTRIBUTING.md
   - AGENTS.md (for AI tooling)
   - docs/RUNBOOK.md
   - Open issues / discussions

### 2.4 Data file

`src/data/methodology.ts` — typed array of source entries matching the table above. Imported by both the new section component and the route handlers in Section 3. Schema includes: `name`, `url`, `type` (`"api"|"rss"|"scrape"|"computed"|"llm"`), `tier` (`FreshnessTier`), `cadence`, `fallback` (string description).

---

## Section 3 — Auto-regenerating AI agent surfaces

Convert two existing static files to dynamic route handlers so they update automatically when `methodology.ts` changes.

### 3.1 `src/app/llms.txt/route.ts`

Replaces `public/llms.txt`. Returns plain text. Generated from:
- `package.json` (project name + description)
- README hero section
- Section list from Nav config
- Freshness tier summary from `freshness.ts`
- Source list from `methodology.ts`

Headers: `Content-Type: text/plain; charset=utf-8`, `Cache-Control: public, max-age=86400`.

### 3.2 `src/app/llms-full.txt/route.ts`

Replaces `public/llms-full.txt`. Includes everything in llms.txt plus:
- Full source matrix (Section 2.2)
- All env vars from `.env.example` (with values redacted)
- API endpoints (`/api/daily`, `/api/market`, `/api/news`, `/api/daily/refresh`)
- Architecture summary from `ARCHITECTURE.md`

### 3.3 Delete the static files

`public/llms.txt` and `public/llms-full.txt` are removed. Next.js routes take over at the same URL paths.

### 3.4 No change to `public/.well-known/ai-plugin.json`

Already correct — no endpoint changes in this work.

---

## Section 4 — Session archive cleanup

Prerequisite to writing honest docs. Must complete before Section 1.1 (CHANGELOG can only describe what's actually shipped).

### 4.1 Push three outstanding commits

Verify with `git log origin/main..HEAD --oneline`; should be `5dc5c65`, `75e78f7`, `f21bfb9`. Push: `git push origin main`.

### 4.2 Apply the pending fetch_log migration

Retry Supabase MCP `apply_migration` once. If still fails, document in CHANGELOG known-limitations + instruct user inline to apply via `https://supabase.com/dashboard/project/ciuklhiswctbnffqvlhs/sql/new`.

### 4.3 Verify the full pipeline end-to-end

Trigger `/api/daily/refresh` locally with `Authorization: Bearer dev-only-secret`. Confirm response shape: `{ ok: true, fields: { pumpPrice: true|false, aseanPrices: >=5, stations: true, supplyDays: true, narrative: true } }`. Visually confirm DailyNarrative section renders with the synthesized body.

### 4.4 Decide on Task 4 — AudienceProvider LCP experiment

From `docs/superpowers/plans/2026-04-19-pipeline-followups.md`. Capture baseline LCP, refactor hero out of AudienceProvider, remeasure. If LCP drops ≥300ms or perf improves ≥3 points: commit. Otherwise: revert + append a "negative result" note to CLAUDE.md Session Retrospective.

### 4.5 Append session retrospective to CLAUDE.md

New entry under "Session Retrospective" with date 2026-04-19, summarizing: what worked (subagent dispatch for code-heavy tasks; parallel agents for independent fetchers; hybrid inline/agent for MCP-heavy work), what struggled (MCP flakes, subagent token limits, Cloudflare-blocked DOE), rules added (DOE→GoogleNews fallback; OSM 3-mirror cycle; perf plateau acceptance).

---

## Architecture: file structure

```
/                                  (repo root)
├── README.md                      (exists — link adds for new files)
├── CHANGELOG.md                   NEW (Section 1.1)
├── ARCHITECTURE.md                NEW (Section 1.2)
├── AGENTS.md                      NEW (Section 1.3)
├── SECURITY.md                    NEW (Section 1.4)
├── CODE_OF_CONDUCT.md             NEW (Section 1.5)
├── CONTRIBUTING.md                EXPAND (Section 1.6)
├── CLAUDE.md                      EXPAND retrospective only (Section 4.5)
├── LICENSE                        (exists, unchanged)
├── docs/
│   ├── RUNBOOK.md                 NEW (Section 1.7)
│   ├── AUDIT-2026-04-06.md        (exists, unchanged)
│   ├── ROADMAP.md                 (exists, unchanged)
│   └── superpowers/
│       ├── plans/                 (exists — 9 plan files)
│       └── specs/                 (this spec lives here)
├── public/
│   ├── llms.txt                   DELETE (replaced by route handler)
│   ├── llms-full.txt              DELETE (replaced by route handler)
│   └── .well-known/
│       └── ai-plugin.json         (exists, unchanged)
└── src/
    ├── data/
    │   └── methodology.ts         NEW (Section 2.4)
    ├── components/
    │   └── sections/
    │       └── MethodologyAndSources.tsx  NEW (Section 2)
    └── app/
        ├── page.tsx               MODIFY (insert MethodologyAndSources)
        ├── llms.txt/route.ts      NEW (Section 3.1)
        └── llms-full.txt/route.ts NEW (Section 3.2)
```

---

## Order of operations

Strict dependency chain:

1. **Section 4 (archive cleanup)** — must run first. Without it, CHANGELOG describes phantom features.
2. **Section 1 (repo docs)** — write CHANGELOG.md first using the just-pushed state as ground truth. Then ARCHITECTURE → AGENTS → SECURITY → CODE_OF_CONDUCT → CONTRIBUTING (expand) → docs/RUNBOOK.
3. **Section 2 (website section)** — depends on `methodology.ts` data file, which Section 3 also needs.
4. **Section 3 (dynamic route handlers)** — depends on `methodology.ts` from Section 2.
5. **Final verify** — full build, full Lighthouse run, push all docs at once.

Section 2 and Section 3 share `src/data/methodology.ts` (created in the first task that needs it). Both reference the same typed array of source entries.

---

## Verification

- `npm run build` clean after each task.
- Lighthouse before/after Section 2+3: perf delta ≤ 1 point (the new section is dynamic-imported + static content; should be negligible).
- `curl http://localhost:3008/llms.txt | head -20` returns generated content (route works).
- `curl http://localhost:3008/llms-full.txt | wc -l` returns ≥ 200 (full content present).
- All seven new repo files exist + render in GitHub.
- CHANGELOG entries match `git log --since=2026-03-01 --oneline` for completeness.
- Run `npx markdownlint *.md docs/**/*.md` to ensure formatting passes.

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| New section adds JS weight, regresses LCP | Dynamic-imported, behind data-audience filter, methodology.ts is plain data |
| Route handlers for llms.txt slow first paint | Routes are independent of the main page; max-age caching reduces hit cost |
| CHANGELOG gets stale after future work | Section 1.6 (CONTRIBUTING) includes a "Update CHANGELOG before merging" item in the PR checklist |
| AGENTS.md and CONTRIBUTING.md duplicate each other | AGENTS.md cross-references CONTRIBUTING for human-shared content; only diverges on agent-specific patterns |
| Supabase MCP flake blocks fetch_log migration | Section 4.2 documents the dashboard fallback so the work is unblocked |

---

## What this spec does NOT define

- The exact word-for-word content of each new doc (writing-plans will produce concrete templates).
- The visual design of the new MethodologyAndSources section (it inherits the existing glass-card + SectionWrapper pattern; no new design tokens).
- Whether to migrate the existing plan files in `docs/superpowers/plans/` into an index — out of scope for this archive; they remain as-is.
