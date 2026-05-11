# Documentation Completeness & Session Archive — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land seven repo doc files, one embedded website section, two dynamic AI-agent route handlers, and finalize the session archive (push outstanding commits, apply pending migration, run the LCP experiment, write the retrospective) — so humans and AI agents can confidently contribute.

**Architecture:** Five phases. Phase A cleans up the working state so docs describe reality. Phase B writes the seven repo markdown files. Phase C creates `src/data/methodology.ts` plus the in-page section that consumes it. Phase D converts the static `public/llms*.txt` assets into Next.js route handlers that read the same data file. Phase E does the final build, Lighthouse check, and push.

**Tech Stack:** Existing — Next.js 16 App Router, TypeScript, Tailwind v4, Vercel, Supabase. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-04-19-docs-and-archive-design.md`

---

## File Structure

```
/                                           (repo root)
├── README.md                               (existing — add link section near bottom)
├── CHANGELOG.md                            NEW — Task 6
├── ARCHITECTURE.md                         NEW — Task 7
├── AGENTS.md                               NEW — Task 8
├── SECURITY.md                             NEW — Task 9
├── CODE_OF_CONDUCT.md                      NEW — Task 10
├── CONTRIBUTING.md                         REWRITE — Task 11
├── CLAUDE.md                               APPEND retrospective — Task 5
├── docs/
│   └── RUNBOOK.md                          NEW — Task 12
├── public/
│   ├── llms.txt                            DELETE — Task 18
│   └── llms-full.txt                       DELETE — Task 18
└── src/
    ├── data/
    │   └── methodology.ts                  NEW — Task 13
    ├── components/sections/
    │   └── MethodologyAndSources.tsx       NEW — Task 14
    └── app/
        ├── page.tsx                        MODIFY — Task 15
        ├── llms.txt/
        │   └── route.ts                    NEW — Task 16
        └── llms-full.txt/
            └── route.ts                    NEW — Task 17
```

Cross-task dependencies:
- Task 13 (`methodology.ts`) is required by Tasks 14, 16, 17.
- All Phase B tasks (6–12) are independent — agent could parallelize if dispatcher allows.
- Phase A must complete before Task 6 (CHANGELOG depends on the final pushed state).

---

# Phase A — Session archive cleanup

## Task 1: Push outstanding commits

**Files:** None modified — git only.

- [ ] **Step 1: Verify three commits are local-only**

```bash
cd /Users/bbmisa/mbc-policy-brief && export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
git log origin/main..HEAD --oneline
```

Expected: three lines exactly:
```
f21bfb9 Extract GPP prices by index pairing (country block + price block are disjoint)
75e78f7 Anchor ASEAN extractor on price-table heading, not country nav
5dc5c65 Add Google News RSS fallback for DOE pump price (Cloudflare-blocked)
```

If more or fewer commits appear, list them in the report and proceed — they're all legitimate work from this session.

- [ ] **Step 2: Push**

```bash
git push origin main
```

Expected: `e0b72f6..f21bfb9  main -> main` (or whatever the latest local SHA is).

- [ ] **Step 3: Confirm remote matches local**

```bash
git fetch origin && git log origin/main..HEAD --oneline | wc -l
```

Expected: `0`.

---

## Task 2: Apply the pending fetch_log migration

**Files:** `supabase/migrations/0002_fetch_log.sql` (already exists)

- [ ] **Step 1: Retry the Supabase MCP**

Call `mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__apply_migration`:
```
project_id: ciuklhiswctbnffqvlhs
name: fetch_log
query: <contents of supabase/migrations/0002_fetch_log.sql>
```

If success: skip to Step 3.

If `net::ERR_FAILED` (or any error): proceed to Step 2.

- [ ] **Step 2: Manual dashboard fallback**

Print this instruction to the user:

```
Supabase MCP is unavailable. Please apply the fetch_log migration manually:

1. Open https://supabase.com/dashboard/project/ciuklhiswctbnffqvlhs/sql/new
2. Paste the SQL from supabase/migrations/0002_fetch_log.sql
3. Click Run
4. Reply "applied" so I can verify and continue.
```

Wait for the user's response. Once they say "applied", proceed to Step 3.

- [ ] **Step 3: Verify the table exists**

Call `mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__list_tables`:
```
project_id: ciuklhiswctbnffqvlhs
schemas: ["public"]
verbose: false
```

Expected: both `daily_snapshot` AND `fetch_log` appear in the result.

If MCP still fails, accept the user's "applied" confirmation as ground truth and continue.

---

## Task 3: Verify the full pipeline end-to-end

**Files:** None modified.

- [ ] **Step 1: Restart dev server**

```bash
cd /Users/bbmisa/mbc-policy-brief && export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
lsof -ti:3008 | xargs kill 2>/dev/null
grep -q "^CRON_SECRET=" .env.local || echo "CRON_SECRET=dev-only-secret" >> .env.local
npx next dev -p 3008 >/tmp/next-dev.log 2>&1 &
sleep 6
```

- [ ] **Step 2: Trigger the cron locally**

```bash
curl -s -H "Authorization: Bearer dev-only-secret" http://localhost:3008/api/daily/refresh | head -200
```

Expected JSON shape:
```json
{"ok":true,"snapshotDate":"2026-04-19","generatedAt":"...","fields":{"pumpPrice":<bool>,"aseanPrices":<num>,"stations":<bool>,"supplyDays":true,"narrative":true}}
```

Required: `supplyDays:true` and `narrative:true` at minimum. Other fields may be false depending on whether scrapers happen to succeed today — that's OK, the UI degrades gracefully.

- [ ] **Step 3: Verify snapshot read**

```bash
curl -s http://localhost:3008/api/daily | head -200
```

Expected: a JSON object with `snapshotDate`, `generatedAt`, and at least `supplyDays`, `narrative`, and `aseanPrices` (array, may be empty).

- [ ] **Step 4: Inspect fetch_log if Task 2 succeeded**

Call `mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__execute_sql`:
```
project_id: ciuklhiswctbnffqvlhs
query: select source, strategy, success, count(*) as n from fetch_log group by 1,2,3 order by 1,2
```

If MCP works, expected: rows for `{doe, gpp, osm}` × `{primary, firecrawl, mirror}` combinations. Record the result in the verification report. If MCP fails, skip and note in report.

- [ ] **Step 5: Kill dev server**

```bash
lsof -ti:3008 | xargs kill 2>/dev/null
```

No commit (this is verification only).

---

## Task 4: AudienceProvider LCP experiment (measure → decide)

**Files:** `src/app/page.tsx`

- [ ] **Step 1: Capture baseline production Lighthouse**

```bash
cd /Users/bbmisa/mbc-policy-brief && export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npm run build 2>&1 | tail -3
lsof -ti:3099 | xargs kill 2>/dev/null
npx next start -p 3099 >/dev/null 2>&1 &
sleep 4
npx lighthouse http://localhost:3099 --output=json --output-path=./lh-before.json --chrome-flags="--headless --no-sandbox" --only-categories=performance 2>&1 | tail -2
node -e "const r=require('./lh-before.json');const a=r.audits;console.log('BEFORE perf:',Math.round(r.categories.performance.score*100),'LCP:',a['largest-contentful-paint'].displayValue,'TBT:',a['total-blocking-time'].displayValue)"
lsof -ti:3099 | xargs kill 2>/dev/null
```

Record the numbers in a comment for Step 4.

- [ ] **Step 2: Read current `src/app/page.tsx`**

Identify the line where `<AudienceProvider>` opens and the line where it closes. The hero `<header>` is currently inside.

- [ ] **Step 3: Refactor — hoist hero out of AudienceProvider**

Move the skip link, `<ScrollProgress />`, and the entire `<header className="pt-[120px] ...">...</header>` block to OUTSIDE `<AudienceProvider>` (before it). Wrap the whole return in a React fragment `<>...</>`.

Pseudocode of the target:

```tsx
return (
  <>
    <a href="#crisis" ...>Skip to content</a>
    <ScrollProgress />
    <header className="pt-[120px] ..."> ...hero unchanged... </header>
    <AudienceProvider>
      <Nav />
      <Ticker />
      <FreshnessBanner />
      <AudienceMain>
        ...all existing sections...
      </AudienceMain>
      <ShareBar />
      <BackToTop />
      <Footer />
    </AudienceProvider>
  </>
);
```

Keep `pt-[120px]` on the header so it still clears the fixed nav once the nav renders.

- [ ] **Step 4: Build + measure**

```bash
npm run build 2>&1 | tail -3
lsof -ti:3099 | xargs kill 2>/dev/null
npx next start -p 3099 >/dev/null 2>&1 &
sleep 4
npx lighthouse http://localhost:3099 --output=json --output-path=./lh-after.json --chrome-flags="--headless --no-sandbox" --only-categories=performance 2>&1 | tail -2
node -e "const r=require('./lh-after.json');const a=r.audits;console.log('AFTER perf:',Math.round(r.categories.performance.score*100),'LCP:',a['largest-contentful-paint'].displayValue,'TBT:',a['total-blocking-time'].displayValue)"
lsof -ti:3099 | xargs kill 2>/dev/null
rm lh-before.json lh-after.json
```

- [ ] **Step 5: Decide and commit OR revert**

Compare BEFORE vs AFTER:
- **Improved** (LCP ≥ 300ms faster OR perf ≥ 3 points higher): commit it.
- **Flat or worse**: revert.

If improved:
```bash
git add src/app/page.tsx
git commit -m "$(cat <<'EOF'
Hoist hero above AudienceProvider to unblock mobile LCP

Before: perf <X>, LCP <Y>s, TBT <Z>ms
After:  perf <X'>, LCP <Y'>s, TBT <Z'>ms

The hero header is purely presentational; wrapping it in the
AudienceProvider client boundary forced the whole tree into client
rendering. Hoisting the hero out lets it render as SSR-only, which
Lighthouse mobile accepts as LCP sooner.
EOF
)"
```

If flat/worse:
```bash
git checkout -- src/app/page.tsx
```
Record the negative result for Task 5 (CLAUDE.md retrospective will mention it).

---

## Task 5: Append session retrospective to CLAUDE.md

**Files:** `CLAUDE.md` (append only — do not modify earlier sections)

- [ ] **Step 1: Read the existing "Session Retrospective" anchor**

Open `CLAUDE.md` and find the section heading `## Session Retrospective` (or the last `### 2026-` dated subsection if the heading style differs).

- [ ] **Step 2: Append a new dated entry at the end of that section**

Append exactly:

```markdown
### 2026-04-19 — Daily pipeline + AI synthesis + perf push + docs archive

- **What worked:**
  - Subagent-driven development for pure-code tasks (font preload, dynamic
    imports, FadeInOnView, fetcher rewrites) — fast iteration, clean commits.
  - Hybrid execution: MCP-heavy or secret-handling tasks done inline,
    code-heavy tasks dispatched to subagents.
  - CSS-first FadeInOnView replaced framer-motion in 13+ section wrappers
    and dropped script-evaluation from 3.9s to 2.2s.
  - Two-tier data freshness UI (FreshnessBadge + FreshnessBanner) unified
    the visual language without needing per-section design work.
  - HuggingFace Inference free tier + deterministic template fallback gave
    us zero-cost AI synthesis with a hallucination guard.

- **What struggled:**
  - Supabase MCP intermittently returned `net::ERR_FAILED` during
    `apply_migration`. Workaround: dashboard fallback or retry-after-pause.
  - DOE oil-monitor page is fully behind Cloudflare; even firecrawl gets
    the challenge page. Google News RSS works as a noisy tertiary fallback.
  - Subagent dispatch hits the 200K token limit when too many MCP tools
    are in scope. Workaround: load only the tools the subagent needs;
    fall back to direct execution if the limit is hit.
  - Mobile Lighthouse simulated mode plateaus at perf ~75 / LCP ~4.1s on
    this codebase. Desktop preset shows perf 98 / LCP 1.2s — the real-world
    story is fine.
  - [If Task 4 reverted] AudienceProvider boundary tightening: no measurable
    LCP gain — left as-is.

- **Rules added:**
  - When DOE is blocked, fall through to firecrawl, then Google News RSS.
  - For Overpass, always cycle three endpoints with the same query.
  - Mobile Lighthouse perf simulated < 80 is acceptable when desktop is 90+
    AND TBT/script-eval are within budget.
  - When subagent tooling overhead crosses 200K tokens, switch to inline.
  - Pre-publish PII sweep + commit-history check before pushing the brief
    public.
  - Conventional-commits is NOT adopted — keep prose-style commit messages
    that explain the **why**.
```

- [ ] **Step 3: Commit**

```bash
cd /Users/bbmisa/mbc-policy-brief && export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
git add CLAUDE.md
git commit -m "Append 2026-04-19 session retrospective"
```

---

# Phase B — Repo documentation files

## Task 6: Write CHANGELOG.md

**Files:** Create `CHANGELOG.md` (repo root)

Use the actual pushed-state commit log to enumerate what shipped. Do NOT include phantom features.

- [ ] **Step 1: Generate the commit list for the session**

```bash
cd /Users/bbmisa/mbc-policy-brief && export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
git log --since=2026-03-25 --oneline | tee /tmp/session-commits.txt | wc -l
```

Inspect `/tmp/session-commits.txt` to understand the full scope.

- [ ] **Step 2: Write CHANGELOG.md with this structure**

Create `/Users/bbmisa/mbc-policy-brief/CHANGELOG.md`:

```markdown
# Changelog

All notable changes to the Pipedream Policy Brief are documented here.
This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

The brief is a single-page Next.js app; "releases" correspond to coherent
chunks of work landing on `main`. Date-stamped entries below describe what
shipped on that day.

## [Unreleased]

_Add new entries here as work lands. Move to a dated section on release._

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
```

- [ ] **Step 3: Verify markdown renders cleanly**

```bash
head -50 CHANGELOG.md && echo "---" && wc -l CHANGELOG.md
```

Expected: a single coherent document starting with the title and listing the 2026-04-19 entry.

- [ ] **Step 4: Commit**

```bash
git add CHANGELOG.md
git commit -m "Add CHANGELOG.md with 2026-04-19 session entry"
```

---

## Task 7: Write ARCHITECTURE.md

**Files:** Create `ARCHITECTURE.md` (repo root)

- [ ] **Step 1: Write the file**

Create `/Users/bbmisa/mbc-policy-brief/ARCHITECTURE.md` with this structure (fill in concrete content from the codebase):

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add ARCHITECTURE.md
git commit -m "Add ARCHITECTURE.md (extracted + expanded from CLAUDE.md)"
```

---

## Task 8: Write AGENTS.md

**Files:** Create `AGENTS.md` (repo root)

- [ ] **Step 1: Write the file**

Create `/Users/bbmisa/mbc-policy-brief/AGENTS.md`:

```markdown
# Agent Contribution Guide

This file is the entry point for AI coding agents (Claude, Copilot,
Cursor, Devin, Aider, et al). Conventions are provider-neutral. For
Claude-specific rules, see `CLAUDE.md`. For human contributors, see
`CONTRIBUTING.md` — most of this also applies.

## Quick-start commands

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build verification
npm run lint         # next lint (no separate test runner — see below)
```

There is no Jest/Vitest test suite. Verification is done via:
1. `npm run build` (TypeScript + Next.js compile gate)
2. Local smoke-test scripts under `scripts/` (created and deleted per task)
3. Lighthouse runs for perf-sensitive changes
4. Visual verification via Playwright/Preview MCP when available

## Where to put new code

| What | Where |
|------|-------|
| New section content | `src/data/<topic>.ts` |
| New section component | `src/components/sections/<Topic>.tsx` |
| New chart | `src/components/charts/<Chart>.tsx` |
| New reusable UI primitive | `src/components/ui/` |
| New client hook | `src/hooks/use<Thing>.ts` |
| New daily fetcher | `src/lib/daily-pipeline/fetch<Thing>.ts` |
| New API route | `src/app/api/<path>/route.ts` |
| New static asset | `public/` |

## Conventions

- Stage specific files: `git add <path>`, never `git add .` or `git add -A`.
- Commit messages: present tense imperative, explain the **why** in the
  body. No conventional-commits prefixes (project chose prose style).
- TypeScript optional fields in sortable interfaces must use `??`:
  `a[sortKey] ?? ""` (otherwise `.localeCompare()` errors on undefined).
- Unicode characters directly in JSX: `–`, `—`, `±`, `→`, `₂`, `²`.
  Never `\uXXXX` escape sequences — they render as literal text.
- Additive schema evolution: when extending data interfaces, add OPTIONAL
  fields (`fieldName?: type`) rather than modifying existing ones.
- Path exports for shell subprocesses (npm, vercel, gh):
  `export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"`.
- `bat` alias may break heredocs in zsh — use inline messages or `/bin/cat`.

## Performance guardrails

- LCP element MUST be statically rendered. Never use `dynamic()` for
  components in the initial viewport.
- Below-fold sections use `dynamic()` with a loading skeleton (matching
  `min-h` to prevent CLS).
- Prefer CSS animations + IntersectionObserver (`FadeInOnView`) over
  framer-motion when the animation is just opacity/translate.
- `optimizePackageImports` already covers `framer-motion`, `chart.js`,
  `react-chartjs-2`. Don't tree-shake manually.
- Run `npm run build` and inspect output for chunk-size regressions
  before committing perf-sensitive code.

## Accessibility guardrails

- Section headings: `<h2>` from `SectionWrapper.title`. Sub-headings use
  `<h3>`. Never skip to `<h4>` under a `<h2>` parent.
- Body text: `text-white-70` minimum. `text-white-50` is for labels.
  `text-white-30` and below: decorative only.
- Charts wrapped with `role="img"` and `aria-label="..."`.
- Touch targets `min-h-[44px]` on buttons, filter pills, nav links.
- `aria-hidden="true"` on decorative SVGs/icons.

## Known pitfalls (already learned the hard way)

| Pitfall | What to do |
|---------|------------|
| DOE oil-monitor returns Cloudflare challenge | `fetchPumpPrice` falls through to firecrawl → Google News RSS. Don't try to bypass Cloudflare. |
| Supabase MCP `net::ERR_FAILED` on `apply_migration` | Retry once. If still failing, fall back to dashboard SQL editor. |
| OSM Overpass rate-limits | `fetchStationSnapshot` cycles three endpoints. Add more mirrors if all three fail. |
| `text-white-30` fails WCAG AA contrast | Use `text-white-50` minimum for readable content. |
| Subagent hits 200K token limit | Switch to inline execution. Don't retry the subagent. |
| `vercel env add` chokes on stdin newlines | Use `printf "%s" "$VAL" \| vercel env add NAME env`, never `echo`. |

## Daily pipeline modifications

When adding a new fetcher to `runDailyPipeline`:

1. Create `src/lib/daily-pipeline/fetch<Thing>.ts`. Return `null` on any
   error — pipeline must degrade gracefully.
2. Wrap each strategy in `logFetch({ source, strategy, success, durationMs })`
   so the `fetch_log` table reflects per-source health.
3. Add to the `Promise.all` in `src/lib/daily-pipeline/index.ts`.
4. Extend `DailySnapshot` type in `src/data/types.ts` with the new field
   (optional, for additive schema evolution).
5. Add a row to `src/data/methodology.ts` so the in-page Methodology
   section and `/llms.txt` route reflect the new source.
6. Smoke-test locally via `curl -H "Authorization: Bearer dev-only-secret"
   http://localhost:3008/api/daily/refresh`.

## PR checklist

Before opening a PR:

- [ ] `npm run build` is clean.
- [ ] If perf-relevant: ran Lighthouse before/after; no regression worse than
  −2 points on any category. Record numbers in the PR description.
- [ ] If pipeline-touching: triggered `/api/daily/refresh` locally and
  observed expected snapshot shape.
- [ ] If visual: screenshot in PR description (desktop + 375px mobile).
- [ ] `CHANGELOG.md` "[Unreleased]" section updated with one line per
  user-visible change.
- [ ] No secrets staged. `git diff --cached` reviewed.
- [ ] Specific files staged (no `git add .`).

## Hard rules — never

- Never `git push --force` without explicit user consent.
- Never `--no-verify` to bypass hooks.
- Never modify `node_modules/`, `.next/`, `.vercel/`.
- Never commit `.env.local` or any file containing real secrets.
- Never invent numbers in any user-visible text. If you need a value that
  isn't in the data files or the snapshot, ask first.
```

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "Add AGENTS.md for AI coding agents (provider-neutral)"
```

---

## Task 9: Write SECURITY.md

**Files:** Create `SECURITY.md` (repo root)

- [ ] **Step 1: Write the file**

Create `/Users/bbmisa/mbc-policy-brief/SECURITY.md`:

```markdown
# Security Policy

## Reporting

This project handles only public policy data and free public-API content.
Blast radius for any vulnerability is small, but disclosures are still
welcome.

Send reports to **bernadettemisa403@gmail.com** with subject prefix
`[Pipedream Policy Brief — Security]`.

Best-effort response time: 7 days. Best-effort fix time: 30 days.
No bounty program — this is a public-good project.

## In scope

- Authentication bypass on `/api/daily/refresh` or other cron endpoints
- Secret leakage in client bundle or API responses
- Cross-site scripting in news feed, narrative, or any user-rendered content
- Supply-chain vulnerabilities in npm dependencies
- Server-side request forgery in scraper fallbacks

## Out of scope

- Inaccuracy of scraped data (use the source citation linked in each card)
- Lighthouse score deficits
- Third-party API rate-limit responses
- Theoretical issues with no reproducible exploit

## Coordinated disclosure

Please give us a reasonable window to fix before public disclosure. We
will credit reporters who request it in the CHANGELOG.

## Dependencies

`npm audit` runs on every CI build. We patch high/critical vulnerabilities
in the same week they're disclosed.
```

- [ ] **Step 2: Commit**

```bash
git add SECURITY.md
git commit -m "Add SECURITY.md with disclosure policy"
```

---

## Task 10: Write CODE_OF_CONDUCT.md

**Files:** Create `CODE_OF_CONDUCT.md` (repo root)

- [ ] **Step 1: Write the file with Contributor Covenant 2.1 verbatim**

Create `/Users/bbmisa/mbc-policy-brief/CODE_OF_CONDUCT.md`. Copy the full text of Contributor Covenant 2.1 from `https://www.contributor-covenant.org/version/2/1/code_of_conduct/`. Replace the contact placeholder with `bernadettemisa403@gmail.com`.

Required sections (all from the Covenant):
- Our Pledge
- Our Standards
- Enforcement Responsibilities
- Scope
- Enforcement
- Enforcement Guidelines (Correction / Warning / Temporary Ban / Permanent Ban)
- Attribution

- [ ] **Step 2: Commit**

```bash
git add CODE_OF_CONDUCT.md
git commit -m "Add CODE_OF_CONDUCT.md (Contributor Covenant 2.1)"
```

---

## Task 11: Rewrite CONTRIBUTING.md

**Files:** Modify `CONTRIBUTING.md` (currently 53 lines — replace entirely)

- [ ] **Step 1: Read current CONTRIBUTING.md to identify any user-specific clauses to preserve**

```bash
cat /Users/bbmisa/mbc-policy-brief/CONTRIBUTING.md
```

Note any CLA or maintainer-specific text — preserve verbatim in the rewrite.

- [ ] **Step 2: Rewrite CONTRIBUTING.md**

Replace the entire contents with:

```markdown
# Contributing to the Pipedream Policy Brief

Thanks for taking interest in contributing. This brief is a public-good
project — every accuracy fix, citation update, and design improvement
helps a real policy audience. Both humans and AI coding agents are
welcome contributors.

For AI-agent-specific guidance, see [`AGENTS.md`](AGENTS.md). For
architectural context, see [`ARCHITECTURE.md`](ARCHITECTURE.md).

---

## Dev environment

Requirements:
- Node.js 22+ (LTS)
- npm (or bun, both work)
- A modern browser (the brief assumes evergreen)

Setup:

```bash
git clone https://github.com/0xjitsu/pipedream-policy-brief.git
cd pipedream-policy-brief
npm install
cp .env.example .env.local      # optional — works without keys
npm run dev                     # http://localhost:3000
```

The brief works without any API keys. With keys in `.env.local` you also get:
- Live Brent crude and USD/PHP rates (uses public APIs but adds attribution)
- Daily-tier snapshot reading from Supabase
- AI-generated daily narrative

---

## First contribution paths

Pick whichever matches your interest:

### Content fixes (no build system to learn)

Most data lives in `src/data/*.ts`. To fix a typo, update a reference, or
add a citation:

1. Find the relevant data file (e.g. `src/data/references.ts`,
   `src/data/pillars.ts`, `src/data/scenarios.ts`).
2. Make the edit. Every entry needs `source` AND `sourceUrl`.
3. Use Unicode characters directly: `–`, `—`, `±`, `→`. Never `\uXXXX`.
4. Run `npm run build` to verify TypeScript types.
5. Open a PR with a screenshot of the affected section.

### Adding a new reference

1. Append to `src/data/references.ts` with a unique `id`.
2. Include all required fields: `id`, `category`, `title`, `authors`,
   `source`, `sourceUrl`, `domain`, `date`.
3. Source URL must point to the specific article/page, not a generic
   homepage (`dof.gov.ph/article/2026-04-19/...` not just `dof.gov.ph/`).

### Adding a new section

1. Create `src/data/<topic>.ts` with a typed data export.
2. Create `src/components/sections/<Topic>.tsx` that uses
   `<SectionWrapper>`.
3. Add a Nav entry in `src/components/layout/Nav.tsx` (sections array).
4. Dynamic-import the section in `src/app/page.tsx` with an
   `animate-pulse` skeleton loading state.
5. Tag the section's `tier` on `<SectionWrapper>` (live / daily / weekly
   / static).
6. Run `npm run build` and visually verify in dev.

### Modifying the daily pipeline

See [AGENTS.md → Daily pipeline modifications](AGENTS.md#daily-pipeline-modifications)
for the step-by-step checklist.

---

## Performance guardrails

- Never static-import a chart. Use `dynamic()` with a loading skeleton.
- For fade-on-scroll, use `FadeInOnView` (CSS + IntersectionObserver),
  not framer-motion.
- Run a Lighthouse before/after for perf-sensitive changes and record
  the delta in the PR.
- Mobile-simulated perf <80 is acceptable when desktop is 90+ — see
  CLAUDE.md retrospective for context.

## Accessibility guardrails

- Section headings: `<h2>` from `<SectionWrapper>`. Sub-headings `<h3>`.
- Body text: `text-white-70` minimum. `text-white-50` is for labels only.
- Charts: `role="img"` + descriptive `aria-label`.
- Touch targets: 44px minimum.

---

## PR checklist

- [ ] `npm run build` is clean.
- [ ] If perf-relevant: Lighthouse before/after recorded in PR description.
- [ ] If pipeline-touching: smoke-tested `/api/daily/refresh` locally.
- [ ] If visual: screenshot in PR description (desktop + 375px mobile).
- [ ] `CHANGELOG.md` "[Unreleased]" section updated.
- [ ] No `.env*` files staged.
- [ ] Specific files staged with `git add <path>` (never `git add .`).
- [ ] Commit message present tense imperative, explains the **why**.

## What we won't merge

- Speculative refactors not tied to a specific need.
- Bundling new dependencies without prior discussion (open an issue first).
- Changes that regress Lighthouse perf > 2 points without justification.
- Inaccurate data without a sourced citation.
- Inline secrets, real PII, or proprietary content.

---

## Code of Conduct

By participating in this project you agree to abide by the
[Contributor Covenant](CODE_OF_CONDUCT.md).

## License & CLA

By submitting a pull request, you:
1. License your contribution under the project's
   [AGPL v3](LICENSE) terms.
2. Grant the maintainer (Bernadette Misa, @0xjitsu) perpetual relicensing
   rights so the dual-license model (open source + commercial) remains
   viable.

If your employer holds IP rights to your work, you must obtain their
permission before contributing.

---

## Getting help

- Open a [discussion](https://github.com/0xjitsu/pipedream-policy-brief/discussions)
  for design questions.
- Open an [issue](https://github.com/0xjitsu/pipedream-policy-brief/issues)
  for bugs or specific requests.
- See [`AGENTS.md`](AGENTS.md) if you're an AI agent.
- See [`docs/RUNBOOK.md`](docs/RUNBOOK.md) for operational questions.
```

- [ ] **Step 3: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "Rewrite CONTRIBUTING.md with full dev + PR workflow"
```

---

## Task 12: Write docs/RUNBOOK.md

**Files:** Create `docs/RUNBOOK.md`

- [ ] **Step 1: Write the file**

Create `/Users/bbmisa/mbc-policy-brief/docs/RUNBOOK.md`:

```markdown
# Operational Runbook

Step-by-step playbooks for the daily pipeline and related infrastructure.
For architecture, see [`../ARCHITECTURE.md`](../ARCHITECTURE.md). For
contribution conventions, see [`../CONTRIBUTING.md`](../CONTRIBUTING.md).

---

## Trigger the daily cron manually

### Locally

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
cd /path/to/pipedream-policy-brief
grep -q "^CRON_SECRET=" .env.local || echo "CRON_SECRET=dev-only-secret" >> .env.local
npm run dev &
sleep 6
curl -s -H "Authorization: Bearer dev-only-secret" http://localhost:3000/api/daily/refresh | jq
```

Expected response:
```json
{
  "ok": true,
  "snapshotDate": "YYYY-MM-DD",
  "generatedAt": "...",
  "fields": {
    "pumpPrice": true|false,
    "aseanPrices": <number>,
    "stations": true|false,
    "supplyDays": true,
    "narrative": true
  }
}
```

`supplyDays` and `narrative` should always be `true`. The other fields
depend on whether the upstream scrapers succeeded today.

### Production

1. Open the Vercel dashboard → Project → Settings → Cron Jobs.
2. Find `/api/daily/refresh`.
3. Click "Run Now".

Vercel sets `CRON_SECRET` automatically — no manual auth needed.

---

## Inspect today's snapshot

Via Supabase MCP:

```
mcp__75cba7da-7cd0-4e6f-8856-44fc3cf15307__execute_sql
  project_id: ciuklhiswctbnffqvlhs
  query: |
    select snapshot_date, generated_at,
           jsonb_pretty(pump_price) as pump,
           jsonb_pretty(stations) as stations,
           supply_days,
           narrative->>'headline' as headline
    from daily_snapshot
    order by snapshot_date desc
    limit 1;
```

Via REST API (publishable key, public read):

```bash
curl -s "https://ciuklhiswctbnffqvlhs.supabase.co/rest/v1/daily_snapshot?select=*&order=snapshot_date.desc&limit=1" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" | jq
```

---

## Debug a stale banner

Symptom: `<FreshnessBanner>` shows "Stale" warning (snapshot older than 36h).

1. Check the most recent `generated_at`:
   ```sql
   select snapshot_date, generated_at,
          extract(epoch from now() - generated_at) / 3600 as hours_old
   from daily_snapshot
   order by snapshot_date desc
   limit 3;
   ```
2. If `hours_old > 36`, the cron hasn't run successfully. Check Vercel
   dashboard → Cron Jobs → recent invocations for the failure reason.
3. Common failures and fixes:
   - **All three fetchers timed out**: trigger manually. Sometimes Overpass
     is overloaded at 06:00 UTC; a retry an hour later usually works.
   - **HuggingFace 503**: free tier capacity. The template fallback should
     still produce a snapshot — verify `narrative` is non-null.
   - **Supabase write failure**: check `SUPABASE_URL` and `SUPABASE_ANON_KEY`
     env vars in production are not redacted.
4. After identifying the root cause, trigger manually via the dashboard.

---

## Inspect per-source fetch health

The `fetch_log` table records every fetcher attempt with strategy and
duration. To see what's been failing this week:

```sql
select source, strategy, success, count(*) as n,
       round(avg(duration_ms)::numeric, 0) as avg_ms,
       max(error_message) as sample_error
from fetch_log
where logged_at > now() - interval '7 days'
group by 1, 2, 3
order by 1, 2, 3;
```

Healthy result: `osm/primary` or `osm/mirror` succeeds at least once per
day. `gpp/firecrawl` succeeds most days. `doe/firecrawl` succeeds rarely
(Cloudflare); `doe/google-news-rss` fills the gap.

---

## When a scraper breaks

The brief's UI degrades gracefully — when a fetcher returns `null`, the
metric falls back to the hardcoded value in `src/data/crisis-overview.ts`.
That means a broken scraper is **not a P0 incident**. Fix path:

### DOE pump price

DOE is Cloudflare-protected; we accept Google News RSS as the fallback.
If even Google News stops returning recent diesel-price articles:
- Edit `src/lib/daily-pipeline/fetchPumpPrice.ts` and adjust the
  `GOOGLE_NEWS_RSS` query terms.
- Last-resort manual override: update the static value in
  `src/data/crisis-overview.ts` and label its `tier` as `daily` with the
  current date.

### GPP ASEAN prices

GPP renders the price table as two ordered blocks paired by index.
If the page structure changes and the index-pair fails:
1. Fetch the page manually: `curl https://www.globalpetrolprices.com/diesel_prices/ > /tmp/gpp.html`.
2. Inspect the structure around country names and prices.
3. Update `extractRows` in `src/lib/daily-pipeline/fetchAseanPrices.ts`.

### OSM Overpass

Add a fourth mirror to `OVERPASS_ENDPOINTS` in
`src/lib/daily-pipeline/fetchStationSnapshot.ts`. Public mirror list:
`https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances`.

---

## Restore the pipeline after a Supabase outage

The `daily_snapshot` table uses `snapshot_date` as primary key. Re-running
the cron after an outage is idempotent — it upserts.

1. Confirm Supabase is responsive: `curl https://ciuklhiswctbnffqvlhs.supabase.co/rest/v1/`.
2. Trigger the cron manually (see "Trigger the daily cron manually" above).
3. Verify the new row landed (see "Inspect today's snapshot" above).

---

## Apply a pending Supabase migration

If `mcp__75cba7da-...__apply_migration` fails repeatedly with `net::ERR_FAILED`:

1. Open `https://supabase.com/dashboard/project/ciuklhiswctbnffqvlhs/sql/new`.
2. Paste the SQL from the relevant `supabase/migrations/*.sql` file.
3. Click "Run".
4. Verify via `list_tables` MCP call once it recovers, or via the
   dashboard Table Editor.

---

## Env-var rotation

If `SUPABASE_ANON_KEY` or `HUGGINGFACE_API_KEY` needs rotation:

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
NEW_VAL="..."
# Remove old
vercel env rm SUPABASE_ANON_KEY production
vercel env rm SUPABASE_ANON_KEY preview
vercel env rm SUPABASE_ANON_KEY development
# Add new
printf "%s" "$NEW_VAL" | vercel env add SUPABASE_ANON_KEY production
printf "%s" "$NEW_VAL" | vercel env add SUPABASE_ANON_KEY preview
printf "%s" "$NEW_VAL" | vercel env add SUPABASE_ANON_KEY development
# Trigger a new deploy
vercel --prod
```

Always use `printf "%s"`, never `echo` — `echo` appends a newline that
corrupts the stored value.
```

- [ ] **Step 2: Commit**

```bash
git add docs/RUNBOOK.md
git commit -m "Add docs/RUNBOOK.md with pipeline operational playbooks"
```

---

# Phase C — Methodology data file + website section

## Task 13: Create src/data/methodology.ts

**Files:** Create `src/data/methodology.ts`

- [ ] **Step 1: Write the data file**

Create `/Users/bbmisa/mbc-policy-brief/src/data/methodology.ts`:

```typescript
import type { FreshnessTier } from "./freshness";

export type SourceType = "api" | "rss" | "scrape" | "computed" | "llm";

export interface MethodologySource {
  /** Display name */
  name: string;
  /** Canonical URL or, for computed sources, a brief identifier */
  url: string;
  /** Source category for grouping + icon selection */
  type: SourceType;
  /** Freshness tier this source feeds */
  tier: FreshnessTier;
  /** Human-readable refresh cadence */
  cadence: string;
  /** What this source provides on the brief */
  provides: string;
  /** What happens when this source is unavailable */
  fallback: string;
}

export const METHODOLOGY_SOURCES: MethodologySource[] = [
  {
    name: "Yahoo Finance — Brent Crude (BZ=F)",
    url: "https://finance.yahoo.com/quote/BZ=F/",
    type: "api",
    tier: "live",
    cadence: "polled every 10 min",
    provides: "Brent crude spot price (USD/bbl)",
    fallback: "Show last cached value with stale indicator",
  },
  {
    name: "Frankfurter / ECB",
    url: "https://www.frankfurter.app/",
    type: "api",
    tier: "live",
    cadence: "polled every 10 min",
    provides: "USD/PHP foreign exchange rate",
    fallback: "Show last cached value with stale indicator",
  },
  {
    name: "Google News + Al Jazeera + r/Philippines RSS",
    url: "https://news.google.com/rss/",
    type: "rss",
    tier: "live",
    cadence: "polled every 5 min",
    provides: "Energy and policy news headlines",
    fallback: "Show last 24h of cached items",
  },
  {
    name: "DOE Oil Industry Monitor",
    url: "https://www.doe.gov.ph/oil-monitor",
    type: "scrape",
    tier: "daily",
    cadence: "scraped daily at 06:00 PHT",
    provides: "Prevailing PH diesel retail pump price",
    fallback: "firecrawl JS render, then Google News RSS for recent Philippine diesel-price articles",
  },
  {
    name: "GlobalPetrolPrices.com",
    url: "https://www.globalpetrolprices.com/diesel_prices/",
    type: "scrape",
    tier: "daily",
    cadence: "scraped daily at 06:00 PHT",
    provides: "USD-denominated diesel price across ASEAN for comparison",
    fallback: "firecrawl markdown + index-pair extractor (country block / price block)",
  },
  {
    name: "OpenStreetMap Overpass",
    url: "https://overpass-api.de/",
    type: "api",
    tier: "daily",
    cadence: "queried daily at 06:00 PHT",
    provides: "Total fuel stations in the Philippines (amenity=fuel)",
    fallback: "Cycle through overpass.kumi.systems and overpass.private.coffee",
  },
  {
    name: "Days of Supply (computed)",
    url: "src/lib/daily-pipeline/computeSupplyDays.ts",
    type: "computed",
    tier: "daily",
    cadence: "recomputed daily at 06:00 PHT",
    provides: "Linear extrapolation from the existing weekly trend in supply data",
    fallback: "Use last known weekly data point unchanged",
  },
  {
    name: "HuggingFace Inference (Llama-3-8B-Instruct)",
    url: "https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct",
    type: "llm",
    tier: "daily",
    cadence: "regenerated daily at 06:00 PHT",
    provides: "2–4 sentence daily narrative synthesized from the snapshot",
    fallback: "Deterministic template synthesizer using snapshot numbers verbatim",
  },
];
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/bbmisa/mbc-policy-brief && export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npm run build 2>&1 | tail -5
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/data/methodology.ts
git commit -m "Add src/data/methodology.ts source matrix"
```

---

## Task 14: Create MethodologyAndSources section component

**Files:** Create `src/components/sections/MethodologyAndSources.tsx`

- [ ] **Step 1: Write the component**

Create `/Users/bbmisa/mbc-policy-brief/src/components/sections/MethodologyAndSources.tsx`:

```typescript
"use client";

import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { FRESHNESS_TIERS, type FreshnessTier } from "@/data/freshness";
import { METHODOLOGY_SOURCES, type MethodologySource } from "@/data/methodology";

const TIER_ORDER: FreshnessTier[] = ["live", "daily", "weekly", "static"];

const SOURCE_TYPE_ICON: Record<MethodologySource["type"], string> = {
  api: "🛰",
  rss: "📡",
  scrape: "🕸",
  computed: "🧮",
  llm: "🤖",
};

export function MethodologyAndSources() {
  return (
    <div data-audience="analyst">
      <SectionWrapper
        id="methodology"
        title="Methodology & Sources"
        icon="🔬"
        tier="static"
        subtitle="How every number on this page is sourced, refreshed, and verified."
      >
        {/* 1. Freshness tier legend */}
        <div className="glass p-5 mb-6">
          <h3 className="font-serif text-base font-semibold text-white mb-1">
            Data freshness tiers
          </h3>
          <p className="text-sm text-white-70 mb-4">
            Every metric on this page is tagged with one of four tiers. The
            dot color next to a value reflects how recently it was refreshed.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {TIER_ORDER.map((id) => {
              const tier = FRESHNESS_TIERS[id];
              return (
                <div key={id} className="flex items-start gap-3 p-3 rounded-lg bg-white-05">
                  <span
                    className={`mt-1 shrink-0 w-2.5 h-2.5 rounded-full ${tier.dotClass}`}
                    aria-hidden="true"
                  />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-sm font-semibold ${tier.textClass}`}>
                        {tier.label}
                      </span>
                      <span className="text-[10px] font-mono text-white-60">
                        {tier.cadence}
                      </span>
                    </div>
                    <p className="text-xs text-white-70 mt-1 leading-relaxed">
                      {tier.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Source matrix */}
        <div className="glass p-5 mb-6 overflow-x-auto">
          <h3 className="font-serif text-base font-semibold text-white mb-1">
            Data sources
          </h3>
          <p className="text-sm text-white-70 mb-4">
            Where each tier&apos;s data comes from, how often it refreshes,
            and what happens when a source is unavailable.
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-white-50">
                <th scope="col" className="pb-2 pr-3 font-semibold">Source</th>
                <th scope="col" className="pb-2 pr-3 font-semibold">Tier</th>
                <th scope="col" className="pb-2 pr-3 font-semibold">Cadence</th>
                <th scope="col" className="pb-2 pr-3 font-semibold">Provides</th>
                <th scope="col" className="pb-2 font-semibold">Fallback</th>
              </tr>
            </thead>
            <tbody>
              {METHODOLOGY_SOURCES.map((s) => {
                const tier = FRESHNESS_TIERS[s.tier];
                return (
                  <tr key={s.name} className="border-t border-white-08 align-top">
                    <td className="py-2 pr-3">
                      <span className="mr-1.5" aria-hidden="true">
                        {SOURCE_TYPE_ICON[s.type]}
                      </span>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white-90 hover:text-white underline underline-offset-2 decoration-white-20 hover:decoration-white-50"
                      >
                        {s.name}
                      </a>
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`inline-flex items-center gap-1 ${tier.textClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${tier.dotClass}`} aria-hidden="true" />
                        {tier.label}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-white-70 text-xs">{s.cadence}</td>
                    <td className="py-2 pr-3 text-white-70 text-xs">{s.provides}</td>
                    <td className="py-2 text-white-60 text-xs">{s.fallback}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 3. AI synthesis explainer */}
        <div className="glass p-5 mb-6 border-l-3 border-l-[#38BDF8]">
          <h3 className="font-serif text-base font-semibold text-white mb-2">
            AI narrative synthesis
          </h3>
          <p className="text-sm text-white-70 leading-relaxed mb-3">
            The brief at the top of the page (above Crisis Overview) is
            generated daily by{" "}
            <a
              href="https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 decoration-white-30 hover:text-white"
            >
              Meta&apos;s Llama-3-8B-Instruct
            </a>{" "}
            on HuggingFace&apos;s free Inference API. Input: the day&apos;s
            snapshot (pump price, supply days, station counts, ASEAN ranking)
            plus the six most recent news headlines.
          </p>
          <p className="text-sm text-white-70 leading-relaxed mb-3">
            A validator rejects any narrative containing numbers that aren&apos;t
            in the source snapshot — if hallucination is detected, the
            pipeline falls back to a deterministic template that uses the
            snapshot numbers verbatim. The narrative never fabricates a value.
          </p>
          <p className="text-xs text-white-60">
            To verify: cross-check every numeric claim in the narrative against
            the metric cards in Crisis Overview below.
          </p>
        </div>

        {/* 4. Contribute */}
        <div className="glass p-5">
          <h3 className="font-serif text-base font-semibold text-white mb-2">
            Contribute
          </h3>
          <p className="text-sm text-white-70 leading-relaxed mb-3">
            This brief is open source under AGPL v3. Accuracy fixes, citation
            updates, design improvements, and pipeline robustness are all
            welcome.
          </p>
          <ul className="text-sm text-white-70 space-y-1.5">
            <li>
              <a
                href="https://github.com/0xjitsu/pipedream-policy-brief"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline underline-offset-2"
              >
                GitHub repository →
              </a>
            </li>
            <li>
              <a
                href="https://github.com/0xjitsu/pipedream-policy-brief/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline underline-offset-2"
              >
                Contributing guide (for humans) →
              </a>
            </li>
            <li>
              <a
                href="https://github.com/0xjitsu/pipedream-policy-brief/blob/main/AGENTS.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline underline-offset-2"
              >
                Agent contribution guide (for AI tools) →
              </a>
            </li>
            <li>
              <a
                href="https://github.com/0xjitsu/pipedream-policy-brief/blob/main/docs/RUNBOOK.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline underline-offset-2"
              >
                Operational runbook →
              </a>
            </li>
            <li>
              <a
                href="https://github.com/0xjitsu/pipedream-policy-brief/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline underline-offset-2"
              >
                Open issues →
              </a>
            </li>
          </ul>
        </div>
      </SectionWrapper>
    </div>
  );
}
```

- [ ] **Step 2: Build**

```bash
npm run build 2>&1 | tail -5
```

Expected: clean. If TypeScript complains about `dotClass` or `textClass`,
verify `FreshnessTierMeta` interface in `src/data/freshness.ts` exposes
those properties (it does — see earlier work).

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/MethodologyAndSources.tsx
git commit -m "Add MethodologyAndSources section component"
```

---

## Task 15: Wire MethodologyAndSources into page.tsx and Nav

**Files:**
- Modify `src/app/page.tsx`
- Modify `src/components/layout/Nav.tsx`

- [ ] **Step 1: Add the dynamic import in page.tsx**

Open `src/app/page.tsx`. Near the other `dynamic()` declarations, add:

```typescript
const MethodologyAndSources = dynamic(
  () => import("@/components/sections/MethodologyAndSources").then((m) => ({ default: m.MethodologyAndSources })),
  { loading: () => <div className="min-h-[600px] mx-4 sm:mx-6 lg:mx-8 my-12 animate-pulse bg-white-05 rounded-2xl" /> }
);
```

- [ ] **Step 2: Render between NewsFeed and References**

Find the `<NewsFeed />` element in `page.tsx`. Immediately after it (and any
intervening wrapper divs), before `<References />`, insert:

```tsx
<MethodologyAndSources />
```

The component already wraps itself in `<div data-audience="analyst">`, so
no additional audience wrapper needed.

- [ ] **Step 3: Add Nav entry**

Open `src/components/layout/Nav.tsx`. Find the `sections` array. Between
the `news` entry and the `references` entry, insert:

```typescript
{ id: "methodology", label: "Methodology & Sources", short: "Methodology", icon: "🔬" },
```

- [ ] **Step 4: Build + visual verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: clean. Section count up by one, route includes `methodology` anchor.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/components/layout/Nav.tsx
git commit -m "Render MethodologyAndSources between News and References"
```

---

# Phase D — Dynamic AI agent route handlers

## Task 16: Create /llms.txt route handler

**Files:** Create `src/app/llms.txt/route.ts`

- [ ] **Step 1: Write the route**

Create `/Users/bbmisa/mbc-policy-brief/src/app/llms.txt/route.ts`:

```typescript
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
```

- [ ] **Step 2: Build**

```bash
npm run build 2>&1 | tail -5
```

Expected: clean, `/llms.txt` shows up in the route table.

- [ ] **Step 3: Smoke-test in dev**

```bash
lsof -ti:3008 | xargs kill 2>/dev/null
npx next dev -p 3008 >/tmp/next-dev.log 2>&1 &
sleep 5
curl -s http://localhost:3008/llms.txt | head -30
lsof -ti:3008 | xargs kill 2>/dev/null
```

Expected: plain text starting with `# Pipedream Policy Brief`.

- [ ] **Step 4: Commit**

```bash
git add src/app/llms.txt/route.ts
git commit -m "Add dynamic /llms.txt route handler (replaces static file)"
```

---

## Task 17: Create /llms-full.txt route handler

**Files:** Create `src/app/llms-full.txt/route.ts`

- [ ] **Step 1: Write the route**

Create `/Users/bbmisa/mbc-policy-brief/src/app/llms-full.txt/route.ts`:

```typescript
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
```

- [ ] **Step 2: Build + smoke**

```bash
npm run build 2>&1 | tail -5
lsof -ti:3008 | xargs kill 2>/dev/null
npx next dev -p 3008 >/tmp/next-dev.log 2>&1 &
sleep 5
curl -s http://localhost:3008/llms-full.txt | wc -l
curl -s http://localhost:3008/llms-full.txt | head -10
lsof -ti:3008 | xargs kill 2>/dev/null
```

Expected: line count ≥ 100; first line `# Pipedream Policy Brief — Full Reference`.

- [ ] **Step 3: Commit**

```bash
git add src/app/llms-full.txt/route.ts
git commit -m "Add dynamic /llms-full.txt route handler (replaces static file)"
```

---

## Task 18: Delete the static llms.txt files

**Files:**
- Delete `public/llms.txt`
- Delete `public/llms-full.txt`

- [ ] **Step 1: Delete the files**

```bash
cd /Users/bbmisa/mbc-policy-brief
rm public/llms.txt public/llms-full.txt
```

- [ ] **Step 2: Verify the dynamic routes still serve the same paths**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
lsof -ti:3008 | xargs kill 2>/dev/null
npx next dev -p 3008 >/tmp/next-dev.log 2>&1 &
sleep 5
curl -s -o /dev/null -w "/llms.txt status: %{http_code}\n/llms-full.txt status: %{http_code}\n" http://localhost:3008/llms.txt
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3008/llms-full.txt
lsof -ti:3008 | xargs kill 2>/dev/null
```

Expected: both return 200.

- [ ] **Step 3: Commit**

```bash
git add public/llms.txt public/llms-full.txt
git commit -m "Remove static llms.txt files (replaced by route handlers)"
```

Note: `git add` on deleted files records the deletion.

---

# Phase E — Final verification and push

## Task 19: Final build, Lighthouse, push everything

- [ ] **Step 1: Clean build**

```bash
cd /Users/bbmisa/mbc-policy-brief && export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npm run build 2>&1 | tail -10
```

Expected: clean, route table shows `/llms.txt` and `/llms-full.txt` as
static (○) routes.

- [ ] **Step 2: Lighthouse production check**

```bash
lsof -ti:3099 | xargs kill 2>/dev/null
npx next start -p 3099 >/dev/null 2>&1 &
sleep 4
npx lighthouse http://localhost:3099 --output=json --output-path=./lh-final.json --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo 2>&1 | tail -3
node -e "const r=require('./lh-final.json');for(const[k,v] of Object.entries(r.categories))console.log(k+':',Math.round(v.score*100));"
lsof -ti:3099 | xargs kill 2>/dev/null
rm lh-final.json
```

Expected delta vs pre-Phase-C baseline: performance within ±2 points,
accessibility ≥ 97, best-practices ≥ 96, SEO 100.

If performance regressed by more than 2 points, investigate (likely the
new MethodologyAndSources section). The component is dynamic-imported,
so the regression should be minimal. If perceived as too large, gate the
section's content behind a "Show more" toggle.

- [ ] **Step 3: Add the final entry to CHANGELOG**

Append under `[Unreleased]` (which then becomes the next dated entry on actual release):

```markdown
### Added — Documentation completeness
- CHANGELOG, ARCHITECTURE, AGENTS, SECURITY, CODE_OF_CONDUCT
- Rewrote CONTRIBUTING with full dev workflow + PR checklist
- docs/RUNBOOK with operational playbooks for the daily pipeline
- In-page Methodology & Sources section between News and References
- Dynamic /llms.txt and /llms-full.txt route handlers (replaces static files)
```

- [ ] **Step 4: Commit the CHANGELOG bump**

```bash
git add CHANGELOG.md
git commit -m "Note docs-completeness work in CHANGELOG Unreleased section"
```

- [ ] **Step 5: Push everything**

```bash
git push origin main
```

Expected: clean push, all docs and section work live on GitHub.

- [ ] **Step 6: Verify GitHub renders the new files**

Open in browser:
- https://github.com/0xjitsu/pipedream-policy-brief/blob/main/CHANGELOG.md
- https://github.com/0xjitsu/pipedream-policy-brief/blob/main/ARCHITECTURE.md
- https://github.com/0xjitsu/pipedream-policy-brief/blob/main/AGENTS.md
- https://github.com/0xjitsu/pipedream-policy-brief/blob/main/SECURITY.md
- https://github.com/0xjitsu/pipedream-policy-brief/blob/main/CODE_OF_CONDUCT.md
- https://github.com/0xjitsu/pipedream-policy-brief/blob/main/CONTRIBUTING.md
- https://github.com/0xjitsu/pipedream-policy-brief/blob/main/docs/RUNBOOK.md

GitHub should automatically surface CODE_OF_CONDUCT and SECURITY in the
repo's Insights → Community Standards page (all six community profile
items now satisfied: description, README, code of conduct, contributing,
license, security policy).

- [ ] **Step 7: Verify the live deployment**

After Vercel auto-deploys from the push, check:

```bash
sleep 60
curl -s -o /dev/null -w "%{http_code}\n" https://pipedream-policy-brief.vercel.app/llms.txt
curl -s -o /dev/null -w "%{http_code}\n" https://pipedream-policy-brief.vercel.app/llms-full.txt
```

Expected: both 200.

Open `https://pipedream-policy-brief.vercel.app/#methodology` in a browser
and confirm the new section renders.

---

## Self-Review Checklist

**Spec coverage:**

- Spec Section 1 (repo docs):
  - 1.1 CHANGELOG → Task 6 ✅
  - 1.2 ARCHITECTURE → Task 7 ✅
  - 1.3 AGENTS → Task 8 ✅
  - 1.4 SECURITY → Task 9 ✅
  - 1.5 CODE_OF_CONDUCT → Task 10 ✅
  - 1.6 CONTRIBUTING → Task 11 ✅
  - 1.7 RUNBOOK → Task 12 ✅
- Spec Section 2 (methodology section):
  - 2.1 placement → Task 15 ✅
  - 2.2 component → Task 14 ✅
  - 2.3 content blocks → Task 14 ✅
  - 2.4 data file → Task 13 ✅
- Spec Section 3 (dynamic routes):
  - 3.1 llms.txt → Task 16 ✅
  - 3.2 llms-full.txt → Task 17 ✅
  - 3.3 delete static → Task 18 ✅
  - 3.4 ai-plugin.json unchanged → no task needed ✅
- Spec Section 4 (cleanup):
  - 4.1 push commits → Task 1 ✅
  - 4.2 apply migration → Task 2 ✅
  - 4.3 verify pipeline → Task 3 ✅
  - 4.4 LCP experiment → Task 4 ✅
  - 4.5 retrospective → Task 5 ✅
- Spec verification + risks → Task 19 ✅

**Placeholder scan:** No "TBD", "TODO", "add error handling", "similar to
Task N". All steps have concrete code or commands.

**Type consistency:**
- `MethodologySource` interface used in Tasks 13, 14, 16, 17.
- `MethodologySource["type"]` enum used in Task 14 (`SOURCE_TYPE_ICON`).
- `FRESHNESS_TIERS` import path consistent across Tasks 14, 16, 17.
- `FreshnessTier` type from `@/data/freshness` used in Task 13.

**Parallel-dispatch hints:**
- Tasks 6, 7, 8, 9, 10, 11, 12 are independent doc files — could be
  dispatched in waves. Per subagent-driven rules, one at a time.
- Tasks 16 and 17 are independent route files — could run in parallel
  but share a data dependency on Task 13.

**Failure modes:**
- Task 2 (Supabase MCP) has documented user-mediated fallback.
- Task 4 (LCP experiment) is measure-gated; revert path documented.
- Task 19 Lighthouse regression has a "Show more" mitigation noted.
- Every fetcher in scope already degrades gracefully via existing fallbacks.
