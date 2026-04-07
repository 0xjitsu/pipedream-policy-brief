# Audit Quick Wins — Full Sweep Design Spec

**Date:** 2026-04-08
**Scope:** All 15 quick wins from `docs/AUDIT-2026-04-06.md`
**Strategy:** 3 layered waves with parallel agents inside each wave

---

## Architecture Overview

All new components follow existing patterns: data in `src/data/*.ts`, components are pure render, glass-morphism dark theme, `prefers-reduced-motion` compliance, 44px touch targets, `data-audience` attributes where appropriate.

New reusable components: `SectionDivider`, `BackToTop`, `ReadingGuide`, `KeyInsight`, `SectionCTA`, `ShareBar`, `MetricTooltip`, `StationLegend`, `NewsMethodology`.

New data files: `src/data/insights.ts`, `src/data/tooltips.ts`.

---

## Wave 1: Structural Foundation

Zero dependencies. All 4 items run as parallel agents.

### 1a. Visual Section Dividers

**Component:** `src/components/ui/SectionDivider.tsx`

Replace the plain `<div className="border-t border-white-08" />` dividers at the two act boundaries in `page.tsx` with styled gradient dividers.

**Props:**
```ts
interface SectionDividerProps {
  variant: "solution" | "execution";
}
```

**Behavior:**
- `solution` variant: strategic green (`#10B981`) gradient line, label "Problem → Solution"
- `execution` variant: info blue (`#3B82F6`) gradient line, label "Solution → Execution"
- Gradient fades from transparent → accent → transparent (horizontal)
- Label centered above the line, `text-[10px] font-mono uppercase tracking-widest`
- `prose` slot: empty in Wave 1, prose bridges added in Wave 2c
- Visible in all audience modes

**Placement in `page.tsx`:**
- After `PersonaImpact` / before `EconomicScenarios` (Problem → Solution)
- After `LegislativeTracker` / before `ActionTimeline` (Solution → Execution)

### 1b. Back to Top Button

**Component:** `src/components/ui/BackToTop.tsx`

**Behavior:**
- Fixed `bottom-6 right-6`, `z-30`
- Hidden by default, fades in when hero leaves viewport (`IntersectionObserver` on `<header>`)
- Glass-styled circle button, 44px diameter, upward arrow icon (SVG, not emoji)
- `onClick`: `window.scrollTo({ top: 0, behavior: 'smooth' })`
- `prefers-reduced-motion`: `behavior: 'auto'`, no fade transition
- `aria-label="Back to top"`

**Import:** Static import in `page.tsx` (lightweight, no code-split needed).

### 1c. Enhanced Footer

**File:** `src/components/layout/Footer.tsx` (edit existing)

**Additions to existing footer:**
- **Last data refresh:** Display `useMarketData().lastUpdated` timestamp formatted as "Data as of Apr 8, 2026 14:30 PHT"
- **Social share row:** Twitter/X, LinkedIn, Copy Link — same share logic reused in Wave 3a
- **Contact:** `hello@pipedream.ph` mailto link + GitHub Discussions link
- **Team credit:** "Research & data by Pipedream" (replaces bare "Prepared by Pipedream")
- **Existing links preserved:** Source, AGPL-3.0, llms.txt

**Layout:** Two-column on desktop (info left, links right), stacked on mobile. Glass card wrapper instead of bare text.

**Note:** Footer is outside `AudienceMain` — it renders for all modes. The `useMarketData` hook needs to be called inside the `AudienceProvider` boundary. Since `AudienceProvider` now wraps the entire page including Footer, this is fine.

### 1d. Reading Guide Callout

**Component:** `src/components/ui/ReadingGuide.tsx`

**Behavior:**
- Glass card placed between hero `<header>` and CrisisOverview section in `page.tsx`
- Content: "This brief moves from **Problem** (crisis, impact, scenarios) to **Solution** (channels, pillars, legislation) to **Execution** (timeline, infrastructure, tracker)."
- Three quick-jump pills: "For executives → §Pillars" / "For implementors → §Channels" / "For the public → §Impact"
- Pills are `<a href="#pillars">` etc with glass-hover styling
- `data-audience="analyst"` — only visible in analyst mode (exec/public already get filtered views)
- `prefers-reduced-motion`: no entrance animation

---

## Wave 2: Narrative Layer

Depends on Wave 1 (prose bridges build on SectionDivider). Internal parallelization: group 1 (2a, 2d, 2e) runs first, then group 2 (2b, 2c, 2f).

### 2a. Strengthen Hero Headline

**File:** `src/app/page.tsx` (edit hero section)

**Changes:**
- `<h1>`: Replace "Navigating the Energy Emergency" with "The Philippines Has 45 Days of Fuel Left"
- Subtitle: Replace descriptive text with "98% import-dependent. One refinery. No strategic reserve. Here's what must happen before supply runs out."
- Keep "Published March 30, 2026 · Prepared by Pipedream" dateline unchanged

### 2b. Executive Summary / TL;DR Card

**Component:** `src/components/ui/ExecutiveSummary.tsx`

**Placement:** Between ReadingGuide and CrisisOverview in `page.tsx`.

**Content (4 bullets max):**
1. "The Philippines has ~45 days of fuel supply remaining, with no confirmed resupply beyond May 2026."
2. "Inaction risks stagflation: ₱130+/L diesel is already driving 4.2% transport-cost inflation."
3. "Recommended response: PriceLOCQ digital subsidy + Strategic Petroleum Reserve + G2G supply contracts."
4. "Read the brief. Share it with your legislator."

**Data source:** Reads `gaugeValue` from `crisis-overview.ts` metrics for the "45 days" figure. Other content is static editorial.

**Styling:** Glass card, amber left border (3px, `--important` color), slightly larger than standard cards. Visible in all audience modes (`data-audience="analyst executive public"`).

### 2c. Prose Bridges Between Sections

**File:** `src/components/ui/SectionDivider.tsx` (extend from Wave 1)

**Add `prose` prop:**
```ts
interface SectionDividerProps {
  variant: "solution" | "execution";
  prose?: string;
}
```

**Content:**
- `solution` divider prose: "The crisis is quantified. Here's what the evidence says works."
- `execution` divider prose: "Policy without implementation is theater. Here's the operational plan."

**Styling:** Prose text centered below the gradient line, `text-sm text-white-50 italic font-serif`, max-width `32ch` for readability.

### 2d. Key Insight Callouts

**Component:** `src/components/ui/KeyInsight.tsx`

**Props:**
```ts
interface KeyInsightProps {
  text: string;
  source?: string;
  sourceUrl?: string;
}
```

**Styling:** Glass card with amber left border (3px), lightbulb icon (💡 or SVG), `text-sm text-white-70`. Source rendered as small attribution link below text.

**Data file:** `src/data/insights.ts`
```ts
export const INSIGHTS = {
  crisisOverview: {
    text: "At current burn rate, the Philippines crosses the DOE minimum reserve threshold by mid-May 2026.",
    source: "DOE Weekly Supply Monitoring Report",
    // sourceUrl: agent should find the real DOE report URL from references.ts or omit
  },
  economicScenarios: {
    text: "Every $10/bbl increase in crude costs the Philippine economy ₱42B in additional import spending annually.",
    source: "BSP Import Statistics",
    // sourceUrl: agent should find the real BSP URL from references.ts or omit
  },
  distributionChannels: {
    text: "PriceLOCQ reaches 4.2M registered users — more than any government fuel subsidy program in Philippine history.",
    source: "Phoenix Petroleum Investor Briefing Q1 2026",
    // sourceUrl: agent should find the real Phoenix URL from references.ts or omit
  },
};
```

**Placement:** After CrisisOverview, EconomicScenarios, and DistributionChannels sections in `page.tsx`. Each wrapped in appropriate `data-audience` div matching its parent section.

### 2e. Senate Findings Verdict

**File:** `src/data/crisis-overview.ts` (add field)

Add a `senateVerdict` field to the crisis overview data:
```ts
export const senateVerdict = {
  text: "The Senate Committee on Energy concluded: the Philippines is structurally unprepared for a sustained supply disruption.",
  resolution: "Senate Resolution No. 1052",
  // sourceUrl: agent should find real Senate resolution URL from references.ts or omit
};
```

**Component change:** `src/components/sections/CrisisOverview.tsx` — render the verdict as a blockquote-styled element after the metrics grid, before the section closes. Serif font, italic, white-70 text, with resolution number as attribution.

### 2f. Inter-Section CTAs

**Component:** `src/components/ui/SectionCTA.tsx`

**Props:**
```ts
interface SectionCTAProps {
  text: string;
  href: string;
  variant?: "link" | "share";
}
```

**Styling:** Compact glass pill, right-arrow icon for `link` variant, share icon for `share` variant. `text-xs font-medium`, `glass-hover` effect. Centered below section content.

**Placements:**
- End of CrisisOverview: "See what this means for real Filipinos →" → `#impact`
- End of PolicyPillars: "How do we actually implement this? →" → `#timeline`
- End of StationTracker: "Share this brief with a decision-maker →" → triggers share (variant `share`)

**Share variant:** Opens native `navigator.share()` if available, falls back to copy-to-clipboard with toast.

---

## Wave 3: Engagement & Transparency

Zero dependencies on Waves 1 or 2. All 5 items run as parallel agents. Can execute concurrently with Wave 2.

### 3a. Share This Brief Sticky Bar

**Component:** `src/components/ui/ShareBar.tsx`

**Behavior:**
- Fixed `bottom-0 left-0 right-0`, `z-30`
- Slides up when hero leaves viewport (same observer pattern as BackToTop)
- Glass-styled bar with: Twitter/X share, LinkedIn share, Copy Link with "Copied!" toast
- Dismiss button → sets `sessionStorage.setItem('share-bar-dismissed', 'true')`, bar stays hidden for session
- Pre-filled share text: "The Philippines has 45 days of fuel left. This policy brief explains what must happen next."
- `hidden sm:flex` — hidden on mobile to avoid overlap with BackToTop
- `prefers-reduced-motion`: no slide animation, instant show/hide

**Share URLs:**
- Twitter: `https://twitter.com/intent/tweet?text={encoded}&url={encoded}`
- LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url={encoded}`
- Copy: `navigator.clipboard.writeText(url)`

### 3b. Metric Context Tooltips

**Component:** `src/components/ui/MetricTooltip.tsx`

**Props:**
```ts
interface MetricTooltipProps {
  term: string;
  children: React.ReactNode;
}
```

**Data file:** `src/data/tooltips.ts`
```ts
export const TOOLTIPS: Record<string, string> = {
  "days-of-supply": "Estimated days the Philippines can sustain current fuel consumption without new imports arriving.",
  "diesel-price": "Diesel pump price as of April 2026. Pre-crisis baseline was ₱55/L in early 2025.",
  "stations-closed": "Fuel stations that have run dry or suspended operations due to supply chain disruptions.",
  "crude-price": "Brent crude benchmark price. The Philippines imports ~98% of its petroleum requirements.",
  "peso-rate": "Philippine peso to US dollar exchange rate. A weaker peso increases the landed cost of imported fuel.",
};
```

**Implementation:** Uses the HTML `popover` attribute for modern browsers. Trigger: small `?` circle icon (12px) next to the metric. Content: glass-styled popover with `text-xs text-white-70`, max-width `240px`. Keyboard accessible via `popovertarget`.

**Placement:** Added to the 5 key metrics in CrisisOverview's metric cards.

### 3c. Chart Annotations

**Files:** Edit existing chart sections.

**Economic Scenarios chart (`EconomicScenarios.tsx`):**
- Add vertical dashed line annotation at the point where inflation exceeds GDP growth (stagflation crossover)
- Label: "Stagflation threshold" with `text-[10px] font-mono`
- Uses Chart.js annotation plugin (`chartjs-plugin-annotation`) — add as dependency

**Crisis Overview supply gauge:**
- The `SupplyCountdown.tsx` progress bar already has a DOE minimum marker at 15 days
- Add matching annotation to the circular gauge in CrisisOverview if one exists, or add a note reference

**Note:** If `chartjs-plugin-annotation` is not already installed, this item requires adding a dependency. Agent should check first and ask for confirmation per CLAUDE.md rules.

### 3d. Station Tracker Legend

**File:** `src/components/sections/StationTracker.tsx` (edit existing)

**Addition:** Collapsible `<details>` panel below the map.

**Content:**
- Color legend: Operational (green `#10B981`), Low Stock (amber `#F59E0B`), Dry/Closed (red `#EF4444`), Unknown (gray `#6B7280`)
- Each with a small colored circle + definition text
- Data freshness: "Station status sourced from DOE weekly monitoring reports."
- `open` attribute on desktop (`md:` breakpoint), closed on mobile

**Styling:** Glass card, `text-xs`, consistent with existing section aesthetics.

### 3e. News Editorial Methodology Note

**File:** `src/components/sections/NewsFeed.tsx` (edit existing)

**Addition:** `<details>` accordion at the bottom of the NewsFeed section.

**Content:**
- Summary: "How we select stories"
- Body: "This feed aggregates headlines from Al Jazeera, Google News, and Reddit energy communities via RSS. Stories are tagged by severity (red/yellow/green) based on keyword matching. The feed refreshes every 5 minutes. Stories are not editorially curated — this is an automated aggregation for situational awareness."
- Links to each source feed

**Styling:** `text-xs text-white-50`, `details` with glass border, `summary` with cursor-pointer and hover effect.

---

## Execution Plan

### Phase 1: Wave 1 (4 parallel agents)

| Agent | Scope | Files Created/Modified |
|-------|-------|----------------------|
| 1a | SectionDivider | `src/components/ui/SectionDivider.tsx` (new), `src/app/page.tsx` (edit) |
| 1b | BackToTop | `src/components/ui/BackToTop.tsx` (new), `src/app/page.tsx` (edit) |
| 1c | Footer | `src/components/layout/Footer.tsx` (edit) |
| 1d | ReadingGuide | `src/components/ui/ReadingGuide.tsx` (new), `src/app/page.tsx` (edit) |

**Conflict zone:** All 4 agents touch `page.tsx`. Use worktree isolation for each agent, then integrate manually.

**Commit after integration:** One commit for all Wave 1 items.

### Phase 2: Wave 2 Group 1 + Wave 3 (8 items, ~5 concurrent agents)

Wave 2 group 1 (2a, 2d, 2e) and all of Wave 3 (3a–3e) have no dependencies on each other.

| Agent | Scope | Files |
|-------|-------|-------|
| 2a | Hero headline | `src/app/page.tsx` (edit) |
| 2d | KeyInsight | `src/components/ui/KeyInsight.tsx` (new), `src/data/insights.ts` (new), `src/app/page.tsx` (edit) |
| 2e | Senate verdict | `src/data/crisis-overview.ts` (edit), `src/components/sections/CrisisOverview.tsx` (edit) |
| 3a | ShareBar | `src/components/ui/ShareBar.tsx` (new), `src/app/page.tsx` (edit) |
| 3b | Tooltips | `src/components/ui/MetricTooltip.tsx` (new), `src/data/tooltips.ts` (new), `src/components/sections/CrisisOverview.tsx` (edit) |
| 3c | Chart annotations | `src/components/sections/EconomicScenarios.tsx` (edit), possibly new dependency |
| 3d | Station legend | `src/components/sections/StationTracker.tsx` (edit) |
| 3e | News methodology | `src/components/sections/NewsFeed.tsx` (edit) |

**Conflict zone:** Multiple agents touch `page.tsx` and `CrisisOverview.tsx`. Use worktree isolation, integrate manually.

### Phase 3: Wave 2 Group 2 (3 items)

Depends on Wave 1 (dividers) and Wave 2 group 1 (hero).

| Agent | Scope | Files |
|-------|-------|-------|
| 2b | ExecutiveSummary | `src/components/ui/ExecutiveSummary.tsx` (new), `src/app/page.tsx` (edit) |
| 2c | Prose bridges | `src/components/ui/SectionDivider.tsx` (edit) — add prose prop + content |
| 2f | SectionCTAs | `src/components/ui/SectionCTA.tsx` (new), multiple section files (edit) |

**Final commit:** One commit for remaining Wave 2 items.

---

## Quality Gates

- `npm run build` must pass after each wave integration
- All new components: `prefers-reduced-motion` compliance
- All interactive elements: 44px minimum touch targets
- All text: WCAG AA contrast (no `text-white-50` for body text, `text-white-70` minimum)
- All links: dark theme styling per CLAUDE.md (`underline decoration-muted-foreground/40 underline-offset-2`)
- No new dependencies without confirmation (exception: `chartjs-plugin-annotation` for 3c)
