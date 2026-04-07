# Audit Quick Wins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all 15 quick wins from the April 6 audit to transform the policy brief from a reference document into a persuasive brief with narrative flow, CTAs, and engagement.

**Architecture:** 3 layered waves with parallel agents. Wave 1 (structural foundation) ships first. Wave 2 (narrative) + Wave 3 (engagement) run concurrently after Wave 1 lands. Agents that touch shared files (page.tsx, CrisisOverview.tsx) use worktree isolation; integration happens manually after each wave.

**Tech Stack:** Next.js 16, Tailwind CSS v4, Framer Motion 12, Chart.js 4.5 + chartjs-plugin-annotation 3.1

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `src/components/ui/SectionDivider.tsx` | Gradient act-boundary dividers with prose slot |
| `src/components/ui/BackToTop.tsx` | Floating scroll-to-top button |
| `src/components/ui/ReadingGuide.tsx` | Brief structure callout with quick-jump pills |
| `src/components/ui/ExecutiveSummary.tsx` | TL;DR card with 4 key bullets |
| `src/components/ui/KeyInsight.tsx` | Amber-bordered "so what?" callout |
| `src/components/ui/SectionCTA.tsx` | Inter-section navigation/share pill |
| `src/components/ui/ShareBar.tsx` | Fixed bottom share bar with dismiss |
| `src/components/ui/MetricTooltip.tsx` | Popover tooltip for metric context |
| `src/data/insights.ts` | Key insight text + source attribution |
| `src/data/tooltips.ts` | Metric explainer strings |

### Modified Files

| File | Changes |
|------|---------|
| `src/app/page.tsx` | Add imports, dividers, reading guide, exec summary, key insights, share bar, back-to-top, hero text, section CTAs |
| `src/components/layout/Footer.tsx` | Expand to glass card with share row, contact, last-updated |
| `src/components/sections/CrisisOverview.tsx` | Add senate verdict blockquote, metric tooltips, section CTA |
| `src/components/sections/EconomicScenarios.tsx` | Add stagflation crossover annotation to scenario cards |
| `src/components/sections/PolicyPillars.tsx` | Add section CTA at bottom |
| `src/components/sections/StationTracker.tsx` | Add operational legend `<details>`, section CTA |
| `src/components/sections/NewsFeed.tsx` | Add methodology `<details>` accordion |
| `src/data/crisis-overview.ts` | Add `senateVerdict` export |

---

## Wave 1: Structural Foundation

**Execution:** 4 parallel agents. Each creates its component independently. Integration into `page.tsx` happens as a manual step after all 4 complete.

---

### Task 1: SectionDivider Component

**Files:**
- Create: `src/components/ui/SectionDivider.tsx`

- [ ] **Step 1: Create the SectionDivider component**

```tsx
// src/components/ui/SectionDivider.tsx
const VARIANTS = {
  solution: { color: "#10B981", label: "Problem → Solution" },
  execution: { color: "#3B82F6", label: "Solution → Execution" },
} as const;

interface SectionDividerProps {
  variant: "solution" | "execution";
  prose?: string;
}

export function SectionDivider({ variant, prose }: SectionDividerProps) {
  const { color, label } = VARIANTS[variant];

  return (
    <div className="py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white-30 mb-3">
          {label}
        </p>
        <div
          className="h-px mx-auto max-w-md"
          style={{
            background: `linear-gradient(to right, transparent, ${color}, transparent)`,
          }}
        />
        {prose && (
          <p className="mt-4 text-sm text-white-50 italic font-serif max-w-[32ch] mx-auto leading-relaxed">
            {prose}
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully (component not yet imported anywhere)

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/SectionDivider.tsx
git commit -m "Add SectionDivider component for 3-act narrative structure"
```

---

### Task 2: BackToTop Component

**Files:**
- Create: `src/components/ui/BackToTop.tsx`

- [ ] **Step 1: Create the BackToTop component**

```tsx
// src/components/ui/BackToTop.tsx
"use client";

import { useState, useEffect } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("header");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-30 w-11 h-11 rounded-full glass flex items-center justify-center text-white-70 hover:text-white hover:bg-white-10 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 12V4M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/BackToTop.tsx
git commit -m "Add BackToTop floating button with IntersectionObserver"
```

---

### Task 3: Enhanced Footer

**Files:**
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Rewrite Footer with expanded content**

Replace the entire Footer component. The Footer is inside `AudienceProvider` so it can use `useMarketData()`.

```tsx
// src/components/layout/Footer.tsx
"use client";

import { useState } from "react";
import { useMarketData } from "@/hooks/useMarketData";

const SITE_URL = "https://pipedream-policy-brief.vercel.app";
const SHARE_TEXT = "The Philippines has 45 days of fuel left. This policy brief explains what must happen next.";

export function Footer() {
  const { lastUpdated } = useMarketData();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SITE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SITE_URL)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`;

  return (
    <footer className="border-t border-white-08 py-10 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Left — info */}
            <div className="space-y-2">
              <p className="text-sm text-white-70 font-medium">Research & data by Pipedream</p>
              <p className="text-xs text-white-30">Published March 30, 2026</p>
              {lastUpdated && (
                <p className="text-xs text-white-30">
                  Data as of{" "}
                  {lastUpdated.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{" "}
                  {lastUpdated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} PHT
                </p>
              )}
              <div className="flex items-center gap-3 pt-1">
                <a
                  href="mailto:hello@pipedream.ph"
                  className="text-xs text-white-40 hover:text-white-70 underline underline-offset-2 decoration-white-20 transition-colors"
                >
                  hello@pipedream.ph
                </a>
                <span className="text-white-10">·</span>
                <a
                  href="https://github.com/0xjitsu/pipedream-policy-brief/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white-40 hover:text-white-70 underline underline-offset-2 decoration-white-20 transition-colors"
                >
                  Discussions
                </a>
              </div>
            </div>

            {/* Right — links + share */}
            <div className="space-y-3 md:text-right">
              {/* Share row */}
              <div className="flex items-center gap-2 md:justify-end">
                <span className="text-[10px] uppercase tracking-wider text-white-30 mr-1">Share</span>
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Twitter/X"
                  className="w-8 h-8 rounded-md bg-white-05 border border-white-08 flex items-center justify-center text-white-40 hover:text-white hover:bg-white-10 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on LinkedIn"
                  className="w-8 h-8 rounded-md bg-white-05 border border-white-08 flex items-center justify-center text-white-40 hover:text-white hover:bg-white-10 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
                <button
                  onClick={handleCopy}
                  aria-label="Copy link"
                  className="w-8 h-8 rounded-md bg-white-05 border border-white-08 flex items-center justify-center text-white-40 hover:text-white hover:bg-white-10 transition-colors"
                >
                  {copied ? (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8l3 3 7-7" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-2M8 12V8m0 0l-2.5 2.5M8 8l2.5 2.5M14 7V3a1 1 0 00-1-1h-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                </button>
              </div>

              {/* Existing links */}
              <div className="flex items-center gap-3 text-xs text-white-30 md:justify-end">
                <a
                  href="https://github.com/0xjitsu/pipedream-policy-brief"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white-50 transition-colors"
                >
                  Source
                </a>
                <span className="text-white-10">·</span>
                <span>AGPL-3.0</span>
                <span className="text-white-10">·</span>
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white-50 transition-colors"
                >
                  llms.txt
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "Expand footer with share row, contact, and live data timestamp"
```

---

### Task 4: ReadingGuide Component

**Files:**
- Create: `src/components/ui/ReadingGuide.tsx`

- [ ] **Step 1: Create the ReadingGuide component**

```tsx
// src/components/ui/ReadingGuide.tsx
const ROUTES = [
  { label: "For executives", target: "#pillars", icon: "👔" },
  { label: "For implementors", target: "#channels", icon: "🔧" },
  { label: "For the public", target: "#impact", icon: "🏠" },
];

export function ReadingGuide() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="glass p-5 text-center">
        <p className="text-sm text-white-70 leading-relaxed">
          This brief moves from{" "}
          <span className="font-semibold text-white">Problem</span> (crisis, impact, scenarios) to{" "}
          <span className="font-semibold text-white">Solution</span> (channels, pillars, legislation) to{" "}
          <span className="font-semibold text-white">Execution</span> (timeline, infrastructure, tracker).
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {ROUTES.map((r) => (
            <a
              key={r.target}
              href={r.target}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white-70 rounded-lg bg-white-05 border border-white-08 hover:bg-white-10 hover:text-white transition-colors min-h-[36px]"
            >
              <span aria-hidden="true">{r.icon}</span>
              {r.label} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ReadingGuide.tsx
git commit -m "Add ReadingGuide callout with audience quick-jump pills"
```

---

### Task 5: Wave 1 Integration into page.tsx

**Files:**
- Modify: `src/app/page.tsx`

This task integrates all 4 Wave 1 components into the page. Run this AFTER Tasks 1–4 are complete.

- [ ] **Step 1: Add imports to page.tsx**

Add these imports after the existing static imports (after line 9 `import { AudienceMain }`):

```tsx
import { BackToTop } from "@/components/ui/BackToTop";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { ReadingGuide } from "@/components/ui/ReadingGuide";
```

- [ ] **Step 2: Add BackToTop before closing `</AudienceProvider>`**

Insert `<BackToTop />` right before `<Footer />` (line 178):

```tsx
      <BackToTop />
      <Footer />
    </AudienceProvider>
```

- [ ] **Step 3: Add ReadingGuide after hero header, before AudienceMain**

Insert between `</header>` (line 90) and `<AudienceMain>` (line 92):

```tsx
      </header>

      <div data-audience="analyst">
        <ReadingGuide />
      </div>

      <AudienceMain>
```

Note: The `data-audience="analyst"` wrapper needs to be inside `<AudienceMain>` to work. Move it there instead — place it as the first child of `<AudienceMain>`, before the JSON-LD script:

```tsx
      <AudienceMain>
          <div data-audience="analyst">
            <ReadingGuide />
          </div>

          <script type="application/ld+json" ...
```

- [ ] **Step 4: Replace act-boundary dividers with SectionDivider**

Replace the plain divider between PersonaImpact and EconomicScenarios (the `{/* === SOLUTION BLOCK === */}` comment area, around lines 128-134):

Before:
```tsx
          <div className="border-t border-white-08" />
          <div data-audience="analyst executive">
            <EconomicScenarios />
          </div>

          {/* === SOLUTION BLOCK === */}
          <div className="border-t border-white-08" />
```

After:
```tsx
          <SectionDivider variant="solution" />
          <div data-audience="analyst executive">
            <EconomicScenarios />
          </div>

          {/* === SOLUTION BLOCK === */}
          <div className="border-t border-white-08" />
```

Replace the divider between LegislativeTracker and ActionTimeline (around lines 148-152):

Before:
```tsx
          {/* === EXECUTION BLOCK === */}
          <div className="border-t border-white-08" />
          <div data-audience="analyst executive">
            <ActionTimeline />
          </div>
```

After:
```tsx
          {/* === EXECUTION BLOCK === */}
          <SectionDivider variant="execution" />
          <div data-audience="analyst executive">
            <ActionTimeline />
          </div>
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: Compiles successfully with all Wave 1 components integrated

- [ ] **Step 6: Commit Wave 1 integration**

```bash
git add src/app/page.tsx
git commit -m "Integrate Wave 1: section dividers, back-to-top, reading guide into page layout"
```

---

## Wave 2: Narrative Layer + Wave 3: Engagement (run concurrently)

**Execution:** After Wave 1 lands, launch these as parallel agents. Group by file conflict:

- **No-conflict agents (can run in any worktree):** Tasks 6, 8, 9, 10, 12, 13, 14
- **page.tsx-touching agents (need worktree isolation):** Tasks 7, 11, 15
- **CrisisOverview-touching agents (need worktree isolation):** Tasks 9, 10 (but 9 adds blockquote, 10 adds tooltips — different areas)

---

### Task 6: Hero Headline Update

**Files:**
- Modify: `src/app/page.tsx` (hero section, lines 74-89)

- [ ] **Step 1: Update hero text**

Replace the hero `<h1>` and subtitle. Find:

```tsx
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Navigating the Energy Emergency
          </h1>
          <p className="mt-4 text-base md:text-lg text-white-70 max-w-2xl mx-auto">
            Supply security, market stability, and targeted relief for the Philippine fuel crisis
          </p>
```

Replace with:

```tsx
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            The Philippines Has 45 Days of Fuel Left
          </h1>
          <p className="mt-4 text-base md:text-lg text-white-70 max-w-2xl mx-auto">
            98% import-dependent. One refinery. No strategic reserve. Here's what must happen before supply runs out.
          </p>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "Strengthen hero headline with urgency-first framing"
```

---

### Task 7: KeyInsight Component + Data

**Files:**
- Create: `src/components/ui/KeyInsight.tsx`
- Create: `src/data/insights.ts`

- [ ] **Step 1: Create insights data file**

Read `src/data/references.ts` first to find real source URLs for each insight. Use the closest matching reference URL.

```ts
// src/data/insights.ts
export interface InsightData {
  text: string;
  source: string;
  sourceUrl?: string;
}

export const INSIGHTS: Record<string, InsightData> = {
  crisisOverview: {
    text: "At current burn rate, the Philippines crosses the DOE minimum reserve threshold by mid-May 2026.",
    source: "DOE Weekly Supply Monitoring Report",
    sourceUrl: "https://legacy.doe.gov.ph/downstream-oil/lfro-with-valid-coc-lfo",
  },
  economicScenarios: {
    text: "Every $10/bbl increase in crude costs the Philippine economy ₱42B in additional import spending annually.",
    source: "BSP Monetary Policy Report",
    sourceUrl: "https://www.bsp.gov.ph/SitePages/Statistics/ExchangeRate.aspx",
  },
  distributionChannels: {
    text: "PriceLOCQ reaches 4.2M registered users — more than any government fuel subsidy program in Philippine history.",
    source: "Phoenix Petroleum Investor Relations",
  },
};
```

- [ ] **Step 2: Create the KeyInsight component**

```tsx
// src/components/ui/KeyInsight.tsx
import type { InsightData } from "@/data/insights";

export function KeyInsight({ text, source, sourceUrl }: InsightData) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="glass border-l-3 border-l-important p-4 flex items-start gap-3">
        <span className="text-lg shrink-0 mt-0.5" aria-hidden="true">💡</span>
        <div>
          <p className="text-sm text-white-70 leading-relaxed">{text}</p>
          {source && (
            <p className="mt-2 text-[10px] text-white-30">
              Source:{" "}
              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 decoration-white-20 hover:text-white-50 transition-colors"
                >
                  {source}
                </a>
              ) : (
                source
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Compiles successfully

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/KeyInsight.tsx src/data/insights.ts
git commit -m "Add KeyInsight callout component and insights data"
```

---

### Task 8: Senate Findings Verdict

**Files:**
- Modify: `src/data/crisis-overview.ts`
- Modify: `src/components/sections/CrisisOverview.tsx`

- [ ] **Step 1: Add senateVerdict export to data file**

Add at the end of `src/data/crisis-overview.ts` (after the `senateFindings` array):

```ts
export const senateVerdict = {
  text: "The Senate Committee on Energy concluded: the Philippines is structurally unprepared for a sustained supply disruption.",
  resolution: "Senate Resolution No. 1052",
  sourceUrl: "https://www.philstar.com/business/2026/03/27/2517009/philippines-fuel-supply-guaranteed-only-until-may-oil-firms-say",
};
```

- [ ] **Step 2: Add verdict blockquote to CrisisOverview component**

In `src/components/sections/CrisisOverview.tsx`, add the import:

```tsx
import { metrics, senateFindings, senateVerdict } from "@/data/crisis-overview";
```

Then add the verdict blockquote after the Senate Hearing Key Findings section (after line 111 `</motion.div>`, before `</SectionWrapper>`):

```tsx
      {/* Senate verdict */}
      <motion.blockquote
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-8 glass border-l-3 border-l-critical p-5"
      >
        <p className="text-base font-serif italic text-white-70 leading-relaxed">
          "{senateVerdict.text}"
        </p>
        <footer className="mt-3 text-xs text-white-30">
          —{" "}
          <a
            href={senateVerdict.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 decoration-white-20 hover:text-white-50 transition-colors"
          >
            {senateVerdict.resolution}
          </a>
        </footer>
      </motion.blockquote>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Compiles successfully

- [ ] **Step 4: Commit**

```bash
git add src/data/crisis-overview.ts src/components/sections/CrisisOverview.tsx
git commit -m "Add Senate verdict blockquote to CrisisOverview section"
```

---

### Task 9: MetricTooltip Component + Data

**Files:**
- Create: `src/components/ui/MetricTooltip.tsx`
- Create: `src/data/tooltips.ts`
- Modify: `src/components/sections/CrisisOverview.tsx` (wrap metric labels)

- [ ] **Step 1: Create tooltips data file**

```ts
// src/data/tooltips.ts
export const TOOLTIPS: Record<string, string> = {
  "Days of Supply": "Estimated days the Philippines can sustain current fuel consumption without new imports arriving.",
  "Diesel Pump Price": "Diesel pump price as of April 2026. Pre-crisis baseline was ₱55/L in early 2025.",
  "Stations Closed": "Fuel stations that have run dry or suspended operations due to supply chain disruptions.",
  "Crude Oil": "Brent crude benchmark price. The Philippines imports ~98% of its petroleum requirements.",
  "Peso Rate": "Philippine peso to US dollar exchange rate. A weaker peso increases the landed cost of imported fuel.",
};
```

- [ ] **Step 2: Create the MetricTooltip component**

```tsx
// src/components/ui/MetricTooltip.tsx
"use client";

import { useId } from "react";
import { TOOLTIPS } from "@/data/tooltips";

interface MetricTooltipProps {
  term: string;
  children: React.ReactNode;
}

export function MetricTooltip({ term, children }: MetricTooltipProps) {
  const id = useId();
  const explanation = TOOLTIPS[term];
  if (!explanation) return <>{children}</>;

  const popoverId = `tooltip-${id}`;

  return (
    <span className="inline-flex items-center gap-1">
      {children}
      <button
        popoverTarget={popoverId}
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white-10 text-white-30 text-[8px] font-bold hover:bg-white-20 hover:text-white-50 transition-colors cursor-help"
        aria-label={`More info about ${term}`}
      >
        ?
      </button>
      <div
        id={popoverId}
        popover="auto"
        className="glass p-3 max-w-[240px] text-xs text-white-70 leading-relaxed rounded-lg"
      >
        {explanation}
      </div>
    </span>
  );
}
```

- [ ] **Step 3: Integrate tooltips into MetricCard labels**

Read `src/components/ui/MetricCard.tsx` to find where labels are rendered, then wrap each label with `<MetricTooltip term={data.label}>`. The exact edit depends on MetricCard's structure — the agent should read the file and wrap the label text.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Compiles successfully

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/MetricTooltip.tsx src/data/tooltips.ts src/components/ui/MetricCard.tsx
git commit -m "Add metric context tooltips using HTML popover API"
```

---

### Task 10: Chart Annotations (Stagflation Crossover)

**Files:**
- Modify: `src/components/sections/EconomicScenarios.tsx`

**Note:** `chartjs-plugin-annotation` is already installed (v3.1.0). However, the EconomicScenarios section currently uses scenario cards, NOT a Chart.js chart. The GDP/inflation chart is in CrisisOverview via `GdpInflationChart`. The agent should:

1. Read `src/components/charts/GdpInflationChart.tsx` to understand its current Chart.js config
2. Add the annotation plugin import and a vertical dashed line at `crossoverIndex` (already exported from `crisis-overview.ts` as `gdpInflation.crossoverIndex = 3`)
3. The annotation should be: vertical dashed red line at x=3 with label "Stagflation threshold"

- [ ] **Step 1: Read GdpInflationChart.tsx**

Read the file to understand the existing chart options structure.

- [ ] **Step 2: Add annotation to GdpInflationChart**

Import the annotation plugin and register it:

```tsx
import annotationPlugin from "chartjs-plugin-annotation";
import { Chart as ChartJS } from "chart.js";
ChartJS.register(annotationPlugin);
```

Then add to the chart options:

```tsx
plugins: {
  annotation: {
    annotations: {
      stagflationLine: {
        type: "line" as const,
        xMin: gdpInflation.crossoverIndex,
        xMax: gdpInflation.crossoverIndex,
        borderColor: "rgba(239, 68, 68, 0.5)",
        borderWidth: 1,
        borderDash: [4, 4],
        label: {
          display: true,
          content: "Stagflation threshold",
          position: "start" as const,
          font: { size: 9, family: "monospace" },
          color: "rgba(239, 68, 68, 0.7)",
          backgroundColor: "transparent",
        },
      },
    },
  },
},
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Compiles successfully

- [ ] **Step 4: Commit**

```bash
git add src/components/charts/GdpInflationChart.tsx
git commit -m "Add stagflation crossover annotation to GDP/inflation chart"
```

---

### Task 11: ShareBar Component

**Files:**
- Create: `src/components/ui/ShareBar.tsx`

- [ ] **Step 1: Create the ShareBar component**

```tsx
// src/components/ui/ShareBar.tsx
"use client";

import { useState, useEffect } from "react";

const SITE_URL = "https://pipedream-policy-brief.vercel.app";
const SHARE_TEXT = "The Philippines has 45 days of fuel left. This policy brief explains what must happen next.";

export function ShareBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("share-bar-dismissed") === "true") {
      setDismissed(true);
      return;
    }

    const hero = document.querySelector("header");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("share-bar-dismissed", "true");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SITE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SITE_URL)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 hidden sm:block transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="glass border-t border-white-10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-xs text-white-50">Share this brief with decision-makers</p>
          <div className="flex items-center gap-2">
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Twitter/X"
              className="px-3 py-1.5 text-xs rounded-md bg-white-05 border border-white-08 text-white-50 hover:text-white hover:bg-white-10 transition-colors min-h-[36px] inline-flex items-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              Post
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on LinkedIn"
              className="px-3 py-1.5 text-xs rounded-md bg-white-05 border border-white-08 text-white-50 hover:text-white hover:bg-white-10 transition-colors min-h-[36px] inline-flex items-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              Share
            </a>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs rounded-md bg-white-05 border border-white-08 text-white-50 hover:text-white hover:bg-white-10 transition-colors min-h-[36px] inline-flex items-center gap-1.5"
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss share bar"
              className="ml-2 text-white-30 hover:text-white-50 transition-colors p-1"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ShareBar.tsx
git commit -m "Add sticky share bar with Twitter, LinkedIn, copy link, and dismiss"
```

---

### Task 12: Station Tracker Legend

**Files:**
- Modify: `src/components/sections/StationTracker.tsx`

- [ ] **Step 1: Add legend details panel**

Add inside the `StationTracker` component, after the map section and before `</SectionWrapper>`. Read the full file to find the exact insertion point.

```tsx
      {/* Operational definitions legend */}
      <details className="mt-6 glass p-4" open>
        <summary className="text-xs font-medium text-white-70 cursor-pointer hover:text-white transition-colors select-none">
          Status Definitions & Data Sources
        </summary>
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { color: "#10B981", label: "Operational", desc: "Station is open and has fuel in stock" },
              { color: "#F59E0B", label: "Low Stock", desc: "Station is open but running low on one or more fuel types" },
              { color: "#EF4444", label: "Dry / Closed", desc: "Station has run dry or suspended operations" },
              { color: "#6B7280", label: "Unknown", desc: "Status not confirmed in latest DOE report" },
            ].map((s) => (
              <div key={s.label} className="flex items-start gap-2">
                <span
                  className="mt-1 w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <div>
                  <p className="text-xs font-medium text-white-70">{s.label}</p>
                  <p className="text-[10px] text-white-30 leading-snug">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white-30 pt-2 border-t border-white-08">
            Station status sourced from DOE weekly monitoring reports. Location data from OpenStreetMap contributors via Overpass API.
          </p>
        </div>
      </details>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/StationTracker.tsx
git commit -m "Add operational status legend to station tracker"
```

---

### Task 13: News Editorial Methodology

**Files:**
- Modify: `src/components/sections/NewsFeed.tsx`

- [ ] **Step 1: Add methodology accordion**

Add inside the `NewsFeed` component, after the timeline div (after line 170 `</div>`) and before `</SectionWrapper>`:

```tsx
      {/* Editorial methodology */}
      <details className="mt-6 glass p-4">
        <summary className="text-xs font-medium text-white-70 cursor-pointer hover:text-white transition-colors select-none">
          How we select stories
        </summary>
        <div className="mt-3 space-y-2 text-xs text-white-50 leading-relaxed">
          <p>
            This feed aggregates headlines from Al Jazeera, Google News, and Reddit energy communities via RSS.
            Stories are tagged by severity (red/yellow/green) based on keyword matching against a curated list
            of crisis-related terms. The feed refreshes every 5 minutes.
          </p>
          <p className="text-white-30">
            Stories are not editorially curated — this is an automated aggregation for situational awareness.
          </p>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white-08">
            <a href="https://www.aljazeera.com/xml/rss/all.xml" target="_blank" rel="noopener noreferrer" className="text-[10px] text-white-30 underline underline-offset-2 decoration-white-10 hover:text-white-50 transition-colors">Al Jazeera RSS</a>
            <a href="https://news.google.com/rss/search?q=philippines+fuel+oil+crisis" target="_blank" rel="noopener noreferrer" className="text-[10px] text-white-30 underline underline-offset-2 decoration-white-10 hover:text-white-50 transition-colors">Google News RSS</a>
            <a href="https://www.reddit.com/r/Philippines/.rss" target="_blank" rel="noopener noreferrer" className="text-[10px] text-white-30 underline underline-offset-2 decoration-white-10 hover:text-white-50 transition-colors">r/Philippines RSS</a>
          </div>
        </div>
      </details>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/NewsFeed.tsx
git commit -m "Add editorial methodology transparency note to news feed"
```

---

### Task 14: ExecutiveSummary Component

**Files:**
- Create: `src/components/ui/ExecutiveSummary.tsx`

**Depends on:** Wave 1 (ReadingGuide placement) — this goes between ReadingGuide and CrisisOverview.

- [ ] **Step 1: Create the ExecutiveSummary component**

```tsx
// src/components/ui/ExecutiveSummary.tsx
const BULLETS = [
  "The Philippines has ~45 days of fuel supply remaining, with no confirmed resupply beyond May 2026.",
  "Inaction risks stagflation: ₱130+/L diesel is already driving 4.2% transport-cost inflation.",
  "Recommended response: PriceLOCQ digital subsidy + Strategic Petroleum Reserve + G2G supply contracts.",
  "Read the brief. Share it with your legislator.",
];

export function ExecutiveSummary() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="glass border-l-3 border-l-important p-5 md:p-6">
        <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-important mb-3">
          TL;DR
        </h2>
        <ul className="space-y-2">
          {BULLETS.map((b, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-important font-mono text-xs mt-0.5 shrink-0">{i + 1}.</span>
              <p className={`text-sm leading-relaxed ${i === BULLETS.length - 1 ? "text-white font-semibold" : "text-white-70"}`}>
                {b}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ExecutiveSummary.tsx
git commit -m "Add ExecutiveSummary TL;DR card component"
```

---

### Task 15: SectionCTA Component

**Files:**
- Create: `src/components/ui/SectionCTA.tsx`

- [ ] **Step 1: Create the SectionCTA component**

```tsx
// src/components/ui/SectionCTA.tsx
"use client";

interface SectionCTAProps {
  text: string;
  href: string;
  variant?: "link" | "share";
}

const SITE_URL = "https://pipedream-policy-brief.vercel.app";

export function SectionCTA({ text, href, variant = "link" }: SectionCTAProps) {
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Pipedream Policy Brief",
        text: "The Philippines has 45 days of fuel left.",
        url: SITE_URL,
      }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(SITE_URL);
    }
  };

  if (variant === "share") {
    return (
      <div className="flex justify-center mt-6">
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white-70 rounded-full glass glass-hover hover:text-white transition-colors min-h-[40px]"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 6.5L8 3.5l3 3M8 3.5V11M3 13h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {text}
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-6">
      <a
        href={href}
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white-70 rounded-full glass glass-hover hover:text-white transition-colors min-h-[40px]"
      >
        {text}
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/SectionCTA.tsx
git commit -m "Add SectionCTA component for inter-section navigation and sharing"
```

---

### Task 16: Prose Bridges (SectionDivider Update)

**Files:**
- Modify: `src/components/ui/SectionDivider.tsx` (already supports `prose` prop from Task 1)
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update SectionDivider usage in page.tsx with prose content**

Find the two `<SectionDivider>` instances added in Task 5 and add prose:

```tsx
<SectionDivider variant="solution" prose="The crisis is quantified. Here's what the evidence says works." />
```

```tsx
<SectionDivider variant="execution" prose="Policy without implementation is theater. Here's the operational plan." />
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "Add prose bridges to section dividers for narrative flow"
```

---

### Task 17: Final Integration (Wave 2+3 into page.tsx)

**Files:**
- Modify: `src/app/page.tsx`

This task integrates all remaining components that need page-level imports and placement. Run AFTER Tasks 6–16 complete.

- [ ] **Step 1: Add remaining imports to page.tsx**

Add after existing imports:

```tsx
import { ExecutiveSummary } from "@/components/ui/ExecutiveSummary";
import { KeyInsight } from "@/components/ui/KeyInsight";
import { INSIGHTS } from "@/data/insights";
import { SectionCTA } from "@/components/ui/SectionCTA";
import { ShareBar } from "@/components/ui/ShareBar";
```

- [ ] **Step 2: Add ExecutiveSummary after ReadingGuide**

Inside `<AudienceMain>`, after the ReadingGuide div:

```tsx
          <div data-audience="analyst executive public">
            <ExecutiveSummary />
          </div>
```

- [ ] **Step 3: Add KeyInsight callouts after their respective sections**

After CrisisOverview:
```tsx
          <div data-audience="analyst executive public">
            <CrisisOverview />
          </div>
          <div data-audience="analyst executive public">
            <KeyInsight {...INSIGHTS.crisisOverview} />
          </div>
```

After EconomicScenarios:
```tsx
          <div data-audience="analyst executive">
            <EconomicScenarios />
          </div>
          <div data-audience="analyst executive">
            <KeyInsight {...INSIGHTS.economicScenarios} />
          </div>
```

After DistributionChannels:
```tsx
          <div data-audience="analyst executive">
            <DistributionChannels />
          </div>
          <div data-audience="analyst executive">
            <KeyInsight {...INSIGHTS.distributionChannels} />
          </div>
```

- [ ] **Step 4: Add SectionCTA placements**

Import `SectionCTA` in `CrisisOverview.tsx`, `PolicyPillars.tsx`, and `StationTracker.tsx`. Add at the bottom of each component (before `</SectionWrapper>`):

CrisisOverview.tsx — add before `</SectionWrapper>`:
```tsx
      <SectionCTA text="See what this means for real Filipinos →" href="#impact" />
```

PolicyPillars.tsx — add before `</SectionWrapper>`:
```tsx
      <SectionCTA text="How do we actually implement this? →" href="#timeline" />
```

StationTracker.tsx — add before `</SectionWrapper>`:
```tsx
      <SectionCTA text="Share this brief with a decision-maker" href="#" variant="share" />
```

- [ ] **Step 5: Add ShareBar to page.tsx**

Insert `<ShareBar />` right before `<BackToTop />`:

```tsx
      <ShareBar />
      <BackToTop />
      <Footer />
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: Compiles successfully with all 15 items integrated

- [ ] **Step 7: Commit final integration**

```bash
git add src/app/page.tsx src/components/sections/CrisisOverview.tsx src/components/sections/PolicyPillars.tsx src/components/sections/StationTracker.tsx
git commit -m "Integrate all 15 audit quick wins: narrative, CTAs, engagement, and transparency"
```

---

## Execution Summary

| Phase | Tasks | Parallel Agents | Dependencies |
|-------|-------|----------------|--------------|
| Wave 1 | Tasks 1–4 (components) | 4 parallel | None |
| Wave 1 integration | Task 5 | 1 (sequential) | Tasks 1–4 |
| Wave 2+3 | Tasks 6–15 (components) | Up to 5 concurrent | Task 5 |
| Final integration | Tasks 16–17 | 1 (sequential) | Tasks 6–15 |

**Quality gates after each integration task:**
- `npm run build` passes
- Preview at 1440px desktop + 375px mobile
- All new text uses `text-white-70` minimum (never `text-white-50` for body)
- All buttons have `min-h-[44px]` or equivalent touch target
- `prefers-reduced-motion` respected (no entrance animations)
