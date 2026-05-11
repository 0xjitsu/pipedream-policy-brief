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
