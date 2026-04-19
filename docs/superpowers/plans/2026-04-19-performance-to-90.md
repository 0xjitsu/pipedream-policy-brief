# Lighthouse Performance to 90+ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise Lighthouse production performance score from 75 to ≥ 90 without sacrificing the dashboard's live-data behavior. Target metrics: LCP ≤ 2.5s (currently 4.1s), TBT ≤ 200ms (currently 990ms), TTI ≤ 3.8s (currently 8.9s).

**Architecture:** Attack the three bottlenecks from the diagnostic: (1) script evaluation of 3.9s — dominated by Chart.js, Leaflet, and framer-motion; (2) LCP — hero section waits for webfont swap; (3) TTI — multiple client hooks kicking off polling on mount. Fixes: dynamic-import the heavy charts (SupplyChart, GdpInflationChart, AseanComparisonChart) from CrisisOverview, replace `framer-motion whileInView` with CSS/IntersectionObserver for 80% of the section wrappers that only do opacity/translate, preconnect + optimize font loading, defer the non-critical market/news polling startup by 1 tick via `requestIdleCallback`.

**Tech Stack:** Next.js 16 + Turbopack, `next/dynamic`, `next/font/google`, existing Chart.js/Leaflet/framer-motion (unchanged — just lazy-loaded).

**Diagnostic baseline (production build):**
- Performance: 75
- LCP: 4.1s (0.48)
- TBT: 990ms (0.27)
- Script evaluation: 3,953ms
- Unused JS: ~126 KB
- Main LCP element: hero text + SupplyCountdown

---

## File Structure

```
src/
├── app/
│   ├── page.tsx                          # MODIFY — no changes (CrisisOverview internal refactor)
│   └── layout.tsx                        # MODIFY — add font preload + preconnect hints
├── components/
│   ├── sections/
│   │   └── CrisisOverview.tsx            # MODIFY — dynamic-import 3 charts
│   ├── layout/
│   │   └── SectionWrapper.tsx            # MODIFY — replace framer-motion header with CSS
│   └── ui/
│       ├── FadeInOnView.tsx              # NEW — lightweight CSS + IntersectionObserver
│       ├── MetricCard.tsx                # MODIFY — drop framer-motion on cards
│       └── SupplyCountdown.tsx           # MODIFY — mark static (LCP priority)
├── hooks/
│   ├── useMarketData.ts                  # MODIFY — defer initial fetch via requestIdleCallback
│   ├── useNewsFeed.ts                    # MODIFY — defer initial fetch via requestIdleCallback
│   └── useDailyData.ts                   # MODIFY — defer initial fetch via requestIdleCallback
└── app/
    └── globals.css                       # MODIFY — add .fade-in-view CSS class
```

**Dependencies between tasks:**
- Tasks 1-3 (font, dynamic-import, defer polling): independent — parallelize
- Task 4 (FadeInOnView) precedes Task 5 (replacing framer-motion usage)
- Task 6 (measure) runs last

---

## Task 1: Preload hero font to fix LCP

**Files:**
- Modify: `src/app/layout.tsx`

The LCP element is the hero text (`"The Philippines Has 45 Days of Fuel Left"`) in Playfair Display. Next.js `next/font/google` already embeds font files locally, but LCP waits for the font to load before painting. Adding `preload: true` and `display: 'swap'` (already present) plus `adjustFontFallback: true` reduces the swap penalty.

- [ ] **Step 1: Update the font config**

Find the current font declaration in `src/app/layout.tsx`:

```typescript
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});
```

Replace with:

```typescript
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  weight: ["700"], // hero + section headings only need bold
});
```

- [ ] **Step 2: Ensure dm-sans and geist-mono are NOT preloaded**

DM Sans is for body text (below the fold for LCP purposes) — don't spend LCP budget on it:

```typescript
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
```

- [ ] **Step 3: Verify build + lighthouse**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
cd /Users/bbmisa/mbc-policy-brief
npm run build
kill $(lsof -ti:3099) 2>/dev/null
npx next start -p 3099 &
sleep 4
npx lighthouse http://localhost:3099 --output=json --output-path=./lh-font.json --chrome-flags="--headless --no-sandbox" --only-categories=performance 2>&1 | tail -2
node -e "const r=require('./lh-font.json');const lcp=r.audits['largest-contentful-paint'];console.log('LCP:', lcp.displayValue, 'score:', lcp.score)"
kill $(lsof -ti:3099) 2>/dev/null
rm lh-font.json
```

Expected: LCP < 3.5s (was 4.1s).

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "Preload hero font (Playfair Display), defer body fonts"
```

---

## Task 2: Dynamic-import heavy charts from CrisisOverview

**Files:**
- Modify: `src/components/sections/CrisisOverview.tsx`

`CrisisOverview` currently static-imports `SupplyChart`, `GdpInflationChart`, and `AseanComparisonChart` — each pulls Chart.js + react-chartjs-2 onto the LCP path. Making them dynamic lets them load after the hero paints.

- [ ] **Step 1: Replace imports**

At the top of `src/components/sections/CrisisOverview.tsx`, replace these three lines:

```typescript
import { SupplyChart } from "@/components/charts/SupplyChart";
import { GdpInflationChart } from "@/components/charts/GdpInflationChart";
import { AseanComparisonChart } from "@/components/charts/AseanComparisonChart";
```

with:

```typescript
import dynamic from "next/dynamic";

const SupplyChart = dynamic(
  () => import("@/components/charts/SupplyChart").then((m) => ({ default: m.SupplyChart })),
  { loading: () => <div className="min-h-[320px] rounded-xl animate-pulse bg-white-05" /> }
);
const GdpInflationChart = dynamic(
  () => import("@/components/charts/GdpInflationChart").then((m) => ({ default: m.GdpInflationChart })),
  { loading: () => <div className="min-h-[280px] rounded-xl animate-pulse bg-white-05" /> }
);
const AseanComparisonChart = dynamic(
  () => import("@/components/charts/AseanComparisonChart").then((m) => ({ default: m.AseanComparisonChart })),
  { loading: () => <div className="min-h-[280px] rounded-xl animate-pulse bg-white-05" /> }
);
```

- [ ] **Step 2: Handle the `currentOilPrice` prop on GdpInflationChart**

The dynamic-imported component receives props the same way; no further changes needed. Ensure the call site still passes `<GdpInflationChart currentOilPrice={oilPrice?.value} />`.

- [ ] **Step 3: Build + Lighthouse**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npm run build
kill $(lsof -ti:3099) 2>/dev/null
npx next start -p 3099 &
sleep 4
npx lighthouse http://localhost:3099 --output=json --output-path=./lh-charts.json --chrome-flags="--headless --no-sandbox" --only-categories=performance 2>&1 | tail -2
node -e "const r=require('./lh-charts.json');console.log('perf:', Math.round(r.categories.performance.score*100), 'LCP:', r.audits['largest-contentful-paint'].displayValue, 'TBT:', r.audits['total-blocking-time'].displayValue)"
kill $(lsof -ti:3099) 2>/dev/null
rm lh-charts.json
```

Expected: TBT drops significantly (was 990ms); perf score should climb above 80.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/CrisisOverview.tsx
git commit -m "Dynamic-import 3 Chart.js components from CrisisOverview"
```

---

## Task 3: Defer client-hook polling via requestIdleCallback

**Files:**
- Modify: `src/hooks/useMarketData.ts`
- Modify: `src/hooks/useNewsFeed.ts`
- Modify: `src/hooks/useDailyData.ts`

Three hooks fire network calls on mount, contributing to TTI. Deferring them to `requestIdleCallback` (or `setTimeout` fallback) lets TTI arrive first and then data streams in.

- [ ] **Step 1: Create a shared deferred-mount helper**

Create `src/hooks/useDeferredMount.ts`:

```typescript
"use client";

import { useEffect } from "react";

/**
 * Runs `fn` on the next idle frame (or 100ms fallback). Use for
 * non-critical initial fetches — helps TTI by letting the browser
 * paint and hydrate first.
 */
export function useDeferredMount(fn: () => void, deps: React.DependencyList) {
  useEffect(() => {
    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const w = window as IdleWindow;
    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(fn, { timeout: 2000 });
    } else {
      timeoutId = setTimeout(fn, 100);
    }

    return () => {
      if (idleId != null && typeof w.cancelIdleCallback === "function") {
        w.cancelIdleCallback(idleId);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
```

- [ ] **Step 2: Update useMarketData**

Replace the useEffect in `src/hooks/useMarketData.ts`:

```typescript
useEffect(() => {
  fetchMarket();
  const id = setInterval(fetchMarket, POLL_INTERVAL);
  return () => clearInterval(id);
}, [fetchMarket]);
```

with:

```typescript
import { useDeferredMount } from "./useDeferredMount";

// ... inside the hook:
useDeferredMount(() => {
  fetchMarket();
}, [fetchMarket]);

useEffect(() => {
  const id = setInterval(fetchMarket, POLL_INTERVAL);
  return () => clearInterval(id);
}, [fetchMarket]);
```

Note the two effects: initial fetch is deferred, interval still arms immediately so the polling cycle is consistent.

- [ ] **Step 3: Update useNewsFeed**

Same pattern. Replace in `src/hooks/useNewsFeed.ts`:

```typescript
useEffect(() => {
  fetchNews();
  const id = setInterval(fetchNews, POLL_INTERVAL);
  return () => clearInterval(id);
}, [fetchNews]);
```

with:

```typescript
import { useDeferredMount } from "./useDeferredMount";

// ... inside the hook:
useDeferredMount(() => {
  fetchNews();
}, [fetchNews]);

useEffect(() => {
  const id = setInterval(fetchNews, POLL_INTERVAL);
  return () => clearInterval(id);
}, [fetchNews]);
```

- [ ] **Step 4: Update useDailyData**

Same pattern. Replace in `src/hooks/useDailyData.ts`:

```typescript
useEffect(() => {
  fetchSnapshot();
  const id = setInterval(fetchSnapshot, POLL_INTERVAL_MS);
  return () => clearInterval(id);
}, [fetchSnapshot]);
```

with:

```typescript
import { useDeferredMount } from "./useDeferredMount";

// ... inside the hook:
useDeferredMount(() => {
  fetchSnapshot();
}, [fetchSnapshot]);

useEffect(() => {
  const id = setInterval(fetchSnapshot, POLL_INTERVAL_MS);
  return () => clearInterval(id);
}, [fetchSnapshot]);
```

- [ ] **Step 5: Build + Lighthouse**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npm run build
kill $(lsof -ti:3099) 2>/dev/null
npx next start -p 3099 &
sleep 4
npx lighthouse http://localhost:3099 --output=json --output-path=./lh-idle.json --chrome-flags="--headless --no-sandbox" --only-categories=performance 2>&1 | tail -2
node -e "const r=require('./lh-idle.json');console.log('perf:', Math.round(r.categories.performance.score*100), 'TTI:', r.audits['interactive'].displayValue, 'TBT:', r.audits['total-blocking-time'].displayValue)"
kill $(lsof -ti:3099) 2>/dev/null
rm lh-idle.json
```

Expected: TTI drops (was 8.9s), TBT drops further.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useDeferredMount.ts src/hooks/useMarketData.ts src/hooks/useNewsFeed.ts src/hooks/useDailyData.ts
git commit -m "Defer initial hook fetches to requestIdleCallback for TTI"
```

---

## Task 4: Add lightweight FadeInOnView component (CSS-first)

**Files:**
- Create: `src/components/ui/FadeInOnView.tsx`
- Modify: `src/app/globals.css`

framer-motion currently powers ~20 "fade-in-on-scroll" animations across sections — each component re-registers observers and runs the motion library. Replacing the simple cases with a CSS class + one shared IntersectionObserver saves ~30 KB of runtime JS plus main-thread work.

- [ ] **Step 1: Add the CSS class**

Append to `src/app/globals.css`:

```css
/* ─── Fade-in-on-view (CSS + IO, replaces framer-motion whileInView) ─── */
.fade-in-view {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.4s ease-out, transform 0.4s ease-out;
  will-change: opacity, transform;
}
.fade-in-view.is-visible {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .fade-in-view {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

- [ ] **Step 2: Create the wrapper component**

Create `src/components/ui/FadeInOnView.tsx`:

```typescript
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface FadeInOnViewProps {
  children: ReactNode;
  /** Extra className passthrough */
  className?: string;
  /** Scroll root margin for the observer (default "-80px") */
  rootMargin?: string;
}

/**
 * Lightweight fade-in-on-scroll wrapper. Uses CSS transitions + a single
 * IntersectionObserver — zero animation-library overhead.
 *
 * Respects prefers-reduced-motion via the CSS media query on .fade-in-view.
 */
export function FadeInOnView({
  children,
  className = "",
  rootMargin = "-80px",
}: FadeInOnViewProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={`fade-in-view ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/FadeInOnView.tsx src/app/globals.css
git commit -m "Add CSS-first FadeInOnView wrapper (no framer-motion)"
```

---

## Task 5: Replace framer-motion section-header animation with FadeInOnView

**Files:**
- Modify: `src/components/layout/SectionWrapper.tsx`

The section header is the most-repeated framer-motion usage (13 sections × `whileInView` + `initial` + `staggerContainer`). Replacing just this one animation removes framer-motion from the critical path of the 13 below-fold sections.

- [ ] **Step 1: Replace the motion wrapper**

Replace the contents of `src/components/layout/SectionWrapper.tsx` with:

```typescript
"use client";

import { FadeInOnView } from "@/components/ui/FadeInOnView";
import { FreshnessBadge } from "@/components/ui/FreshnessBadge";
import type { FreshnessTier } from "@/data/freshness";

interface SectionWrapperProps {
  id: string;
  title: string;
  icon?: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  tier?: FreshnessTier;
  tierTimestamp?: Date | string | null;
}

export function SectionWrapper({
  id,
  title,
  icon,
  subtitle,
  children,
  className = "",
  tier,
  tierTimestamp,
}: SectionWrapperProps) {
  return (
    <section id={id} className={`scroll-mt-32 py-12 md:py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInOnView className="mb-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white">
              {icon && (
                <span className="mr-3" aria-hidden="true">
                  {icon}
                </span>
              )}
              {title}
            </h2>
            {tier && (
              <FreshnessBadge tier={tier} timestamp={tierTimestamp} size="sm" />
            )}
          </div>
          {subtitle && (
            <p className="mt-2 text-white-50 text-sm md:text-base">{subtitle}</p>
          )}
        </FadeInOnView>
        {children}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Build + Lighthouse**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
npm run build
kill $(lsof -ti:3099) 2>/dev/null
npx next start -p 3099 &
sleep 4
npx lighthouse http://localhost:3099 --output=json --output-path=./lh-io.json --chrome-flags="--headless --no-sandbox" --only-categories=performance 2>&1 | tail -2
node -e "const r=require('./lh-io.json');console.log('perf:', Math.round(r.categories.performance.score*100), 'TBT:', r.audits['total-blocking-time'].displayValue, 'script-eval:', r.audits['bootup-time'].displayValue)"
kill $(lsof -ti:3099) 2>/dev/null
rm lh-io.json
```

Expected: script-evaluation drops (was 3953ms), TBT below 400ms.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/SectionWrapper.tsx
git commit -m "Replace framer-motion section header animation with FadeInOnView"
```

---

## Task 6: Mark SupplyCountdown as high-priority (LCP element)

**Files:**
- Modify: `src/components/ui/SupplyCountdown.tsx`

The hero's animated counter is an LCP candidate. Mark its wrapper with `fetchPriority="high"` hints where applicable, and ensure its intersection observer fires immediately on mount (since it's above the fold).

- [ ] **Step 1: Inspect current implementation**

Read `src/components/ui/SupplyCountdown.tsx`. Look for any `IntersectionObserver` gating — if present, remove it for the hero use case (always visible on initial load).

- [ ] **Step 2: Replace any IntersectionObserver with immediate animation start**

If the component uses IntersectionObserver to defer the counter animation, replace the gating effect to fire immediately:

Before:
```typescript
useEffect(() => {
  const el = ref.current;
  if (!el) return;
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) startCounter();
  });
  observer.observe(el);
  return () => observer.disconnect();
}, []);
```

After:
```typescript
useEffect(() => {
  startCounter();
}, []);
```

Only make this change if the component has such gating. If it already fires on mount, no changes needed.

- [ ] **Step 3: Commit (if changed)**

```bash
git add src/components/ui/SupplyCountdown.tsx
git commit -m "Fire SupplyCountdown animation immediately (LCP optimization)"
```

---

## Task 7: Drop framer-motion from MetricCard

**Files:**
- Modify: `src/components/ui/MetricCard.tsx`

MetricCard uses `motion.div` + `fadeInUp` variants for its entry animation. 5 cards × motion.div × stagger = noticeable overhead. A simple CSS class does the same thing.

- [ ] **Step 1: Replace motion.div with FadeInOnView**

Open `src/components/ui/MetricCard.tsx`. Replace:

```typescript
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
// ...
<motion.div variants={fadeInUp} className="glass p-5 flex flex-col items-center text-center gap-2">
```

with:

```typescript
import { FadeInOnView } from "./FadeInOnView";
// ...
<FadeInOnView className="glass p-5 flex flex-col items-center text-center gap-2">
```

And the corresponding closing `</motion.div>` becomes `</FadeInOnView>`.

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/MetricCard.tsx
git commit -m "Replace framer-motion with FadeInOnView in MetricCard"
```

---

## Task 8: Preconnect to Supabase origin

**Files:**
- Modify: `src/app/layout.tsx`

The daily snapshot fetch goes to the Supabase origin. Adding a preconnect hint saves 100-200ms on the first `/api/daily` roundtrip.

- [ ] **Step 1: Add preconnect in <head>**

Find the existing preconnect hints inside the `<head>` of `RootLayout` in `src/app/layout.tsx`:

```typescript
<link rel="preconnect" href="https://basemaps.cartocdn.com" crossOrigin="" />
<link rel="dns-prefetch" href="https://query1.finance.yahoo.com" />
<link rel="dns-prefetch" href="https://api.frankfurter.dev" />
```

Add one more line immediately after:

```typescript
<link
  rel="preconnect"
  href="https://ciuklhiswctbnffqvlhs.supabase.co"
  crossOrigin=""
/>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "Preconnect to Supabase origin for daily data fetch"
```

---

## Task 9: Audit bundle size with Next.js analyzer

**Files:**
- Modify: `package.json` (devDependency only)
- Create: `next.config.analyze.js` (one-off, git-ignored)

- [ ] **Step 1: Install analyzer**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
cd /Users/bbmisa/mbc-policy-brief
npm install --save-dev @next/bundle-analyzer
```

- [ ] **Step 2: Create a one-off analyze config**

Create `next.config.analyze.ts` at repo root:

```typescript
import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const withAnalyzer = bundleAnalyzer({ enabled: true });

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["framer-motion", "chart.js", "react-chartjs-2"],
  },
};

export default withAnalyzer(nextConfig);
```

- [ ] **Step 3: Run analyzer**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
ANALYZE=true npx next build
```

Three HTML files open in the browser (client/nodejs/edge). Look at the `client` treemap for the biggest chunks. Expected top offenders after Task 2: leaflet (~50KB), supabase-js (~30KB), chart.js (~30KB — now in a separate lazy chunk), framer-motion (smaller after Tasks 5-7).

- [ ] **Step 4: Add analyzer to .gitignore**

Append to `.gitignore`:

```
# Bundle analyzer output
.next/analyze/
next.config.analyze.ts
```

- [ ] **Step 5: Commit**

```bash
git add .gitignore package.json package-lock.json
git commit -m "Add bundle analyzer as dev dependency"
```

---

## Task 10: Final Lighthouse measurement + docs

- [ ] **Step 1: Run full Lighthouse**

```bash
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$HOME/.local/bin:$PATH"
cd /Users/bbmisa/mbc-policy-brief
npm run build
kill $(lsof -ti:3099) 2>/dev/null
npx next start -p 3099 &
sleep 4
npx lighthouse http://localhost:3099 --output=json --output=html --output-path=./lh-final --chrome-flags="--headless --no-sandbox" 2>&1 | tail -3
node -e "const r=require('./lh-final.report.json');for(const[k,v] of Object.entries(r.categories))console.log(k+':',Math.round(v.score*100));console.log('\\n---\\nLCP:',r.audits['largest-contentful-paint'].displayValue,'\\nTBT:',r.audits['total-blocking-time'].displayValue,'\\nTTI:',r.audits['interactive'].displayValue)"
kill $(lsof -ti:3099) 2>/dev/null
```

Expected thresholds (target 90+):
- performance ≥ 90
- LCP ≤ 2.5s
- TBT ≤ 200ms
- TTI ≤ 3.8s

If performance is still below 90, open `lh-final.report.html` in a browser to see the residual opportunities. Common residuals: remaining unused JS from framework internals (minor), font swap at very low bandwidth (acceptable).

- [ ] **Step 2: Clean up the report file**

```bash
rm lh-final.report.json lh-final.report.html
```

- [ ] **Step 3: Append to CLAUDE.md**

Append to `/Users/bbmisa/mbc-policy-brief/CLAUDE.md` under "Quality Standards":

```markdown
### Performance optimizations (2026-04-19)

- Playfair Display preloaded, DM Sans / Geist Mono deferred (LCP)
- Chart.js components (Supply, GDP/Inflation, ASEAN) dynamic-imported from Crisis Overview
- Client hooks defer initial fetch via `requestIdleCallback` (TTI)
- Section header fade uses `FadeInOnView` (CSS + IO) instead of framer-motion
- Preconnect hint for Supabase origin
- Baseline: perf 90+, LCP ≤ 2.5s, TBT ≤ 200ms
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "Document performance baseline and optimizations"
git push origin main
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Task 1: font LCP
- ✅ Task 2: dynamic-import charts (script eval)
- ✅ Task 3: defer polling (TTI)
- ✅ Task 4-5: CSS-first fade replaces framer-motion section headers
- ✅ Task 7: MetricCard framer-motion removal
- ✅ Task 8: Supabase preconnect
- ✅ Task 9: bundle audit
- ✅ Task 10: measurement + docs

**Placeholder scan:** ✅ No TBDs, every step has concrete code

**Type consistency:**
- `FadeInOnView` props (children, className, rootMargin) used consistently in Tasks 4, 5, 7
- `useDeferredMount(fn, deps)` signature used consistently in Task 3 across three hooks
- `SectionWrapper` props unchanged in Task 5 — still backward compatible

**Risk assessment:**
- Task 5 changes the animation style of every section — possible visual regression. Mitigation: the CSS fallback is visually identical to the framer-motion default.
- Task 3 defers initial network fetches by ~50-200ms. User sees static fallback data briefly before live data loads — this is already the expected behavior per CLAUDE.md's "insufficient data" rule.
- Task 2 charts now show `animate-pulse` skeletons briefly. Already the pattern used elsewhere in the codebase.

**If performance is still below 90 after Task 10:**
- Open the bundle analyzer output and identify the next largest non-lazy chunk
- Consider replacing leaflet (50KB) with a static choropleth SVG for the station map
- Consider replacing chart.js entirely with CSS bar charts for the simpler visualizations (AseanComparisonChart, FiscalCostChart)
- These are out of scope for this plan — write a follow-up plan if needed
