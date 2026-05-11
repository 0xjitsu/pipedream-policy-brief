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
