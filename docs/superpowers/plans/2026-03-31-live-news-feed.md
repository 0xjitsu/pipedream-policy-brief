# Live News Feed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated "Live News" section to the MBC policy brief that pulls real-time energy crisis headlines from RSS feeds and Reddit, with severity-based filtering and source type badges — mirroring the EventTimeline from the oil-intel dashboard but adapted to the MBC glass morphism design system.

**Architecture:** Server-side API route (`/api/news`) fetches 4 RSS feeds + 2 Reddit searches, filters for PH energy keywords, estimates severity, deduplicates, and returns top 40 events. Client-side `useNewsFeed` hook polls every 5 minutes with static fallback. New `NewsFeed` section renders a filterable vertical timeline with severity + source type filters, glass cards, and Framer Motion animations.

**Tech Stack:** Next.js 16 Route Handler (server-side RSS parsing), `rss-parser` (npm), client-side polling hook, Framer Motion animations, existing MBC design tokens.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/app/api/news/route.ts` | Create | API route: fetch RSS + Reddit, filter, classify, dedupe, return JSON |
| `src/data/news-events.ts` | Create | Static fallback events (never-empty guarantee) |
| `src/data/types.ts` | Modify | Add `NewsEvent`, `NewsSeverity`, `NewsSourceType` types |
| `src/hooks/useNewsFeed.ts` | Create | Client-side polling hook (5-min interval, static fallback) |
| `src/components/sections/NewsFeed.tsx` | Create | Main section component with filters + timeline UI |
| `src/components/layout/Nav.tsx` | Modify | Add "Live News" to nav sections array |
| `src/app/page.tsx` | Modify | Import and render `NewsFeed` section |

---

### Task 1: Add TypeScript Types

**Files:**
- Modify: `src/data/types.ts`

- [ ] **Step 1: Add news event types to types.ts**

Add these types after the existing `TimelineItem` interface:

```typescript
export type NewsSeverity = "red" | "yellow" | "green";
export type NewsSourceType = "news" | "government" | "social" | "market";

export interface NewsEvent {
  date: string;
  headline: string;
  severity: NewsSeverity;
  source: string;
  sourceUrl: string;
  sourceType: NewsSourceType;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean compile, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/data/types.ts
git commit -m "feat: add NewsEvent types for live news feed"
```

---

### Task 2: Create Static Fallback Events

**Files:**
- Create: `src/data/news-events.ts`

- [ ] **Step 1: Write fallback events file**

These are curated events that display when RSS feeds fail. They must be recent and representative of the crisis narrative. Use real dates from late March 2026.

```typescript
import type { NewsEvent } from "./types";

export const fallbackNewsEvents: NewsEvent[] = [
  {
    date: "Mar 30, 2026",
    headline: "Dubai crude hits $112/bbl as Hormuz transit delays persist",
    severity: "red",
    source: "Reuters",
    sourceUrl: "https://www.reuters.com",
    sourceType: "news",
  },
  {
    date: "Mar 29, 2026",
    headline: "DOE orders 15-day fuel inventory reporting for all downstream players",
    severity: "yellow",
    source: "DOE Philippines",
    sourceUrl: "https://www.doe.gov.ph",
    sourceType: "government",
  },
  {
    date: "Mar 28, 2026",
    headline: "Senate hearing: Senators push for emergency fuel subsidy for transport sector",
    severity: "yellow",
    source: "PhilStar",
    sourceUrl: "https://www.philstar.com",
    sourceType: "news",
  },
  {
    date: "Mar 27, 2026",
    headline: "Petron, Shell announce ₱2.50/L gasoline price hike effective Tuesday",
    severity: "red",
    source: "Inquirer",
    sourceUrl: "https://www.inquirer.net",
    sourceType: "market",
  },
  {
    date: "Mar 26, 2026",
    headline: "DBCC convenes emergency session on fuel excise tax suspension",
    severity: "yellow",
    source: "DOF Philippines",
    sourceUrl: "https://www.dof.gov.ph",
    sourceType: "government",
  },
  {
    date: "Mar 25, 2026",
    headline: "OPEC+ holds production steady despite calls for emergency output increase",
    severity: "red",
    source: "Al Jazeera",
    sourceUrl: "https://www.aljazeera.com",
    sourceType: "news",
  },
  {
    date: "Mar 24, 2026",
    headline: "PriceLOCQ-equipped stations reach 450+ nationwide, ready for subsidy deployment",
    severity: "green",
    source: "Seaoil Philippines",
    sourceUrl: "https://www.seaoil.com.ph",
    sourceType: "market",
  },
  {
    date: "Mar 23, 2026",
    headline: "Transport groups threaten nationwide strike if fuel prices rise another ₱5/L",
    severity: "red",
    source: "r/Philippines",
    sourceUrl: "https://www.reddit.com/r/Philippines",
    sourceType: "social",
  },
  {
    date: "Mar 22, 2026",
    headline: "Bangko Sentral flags fuel-driven inflation risk, holds rates steady",
    severity: "yellow",
    source: "BSP",
    sourceUrl: "https://www.bsp.gov.ph",
    sourceType: "government",
  },
  {
    date: "Mar 20, 2026",
    headline: "DFA explores G2G fuel supply deals with Brunei, Malaysia",
    severity: "green",
    source: "DFA Philippines",
    sourceUrl: "https://www.dfa.gov.ph",
    sourceType: "government",
  },
];
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean compile.

- [ ] **Step 3: Commit**

```bash
git add src/data/news-events.ts
git commit -m "feat: add static fallback events for live news feed"
```

---

### Task 3: Create the API Route

**Files:**
- Create: `src/app/api/news/route.ts`

- [ ] **Step 1: Install rss-parser**

```bash
bun add rss-parser
```

- [ ] **Step 2: Write the API route**

This is adapted from `/Users/bbmisa/oil_energy_map/src/app/api/events/route.ts` with these changes:
- Tailored keyword filter for PH energy crisis
- MBC's `NewsEvent` type instead of `TimelineEvent`
- `headline` field instead of `event`
- Same RSS sources + Reddit search pattern

```typescript
import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { fallbackNewsEvents } from "@/data/news-events";
import type { NewsEvent, NewsSeverity, NewsSourceType } from "@/data/types";

const parser = new Parser({ timeout: 5000 });

const ENERGY_KEYWORDS =
  /oil|fuel|gasoline|diesel|petrol|crude|energy|hormuz|refinery|opec|lng|petroleum|excise|subsidy|pump price/i;

const RSS_FEEDS: { url: string; source: string; sourceType: NewsSourceType }[] = [
  {
    url: "https://www.philstar.com/rss/business",
    source: "PhilStar",
    sourceType: "news",
  },
  {
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    source: "Al Jazeera",
    sourceType: "news",
  },
  {
    url: "https://news.google.com/rss/search?q=Philippines+oil+energy+fuel&hl=en-PH&gl=PH&ceid=PH:en",
    source: "Google News",
    sourceType: "news",
  },
  {
    url: "https://news.google.com/rss/search?q=OPEC+crude+oil+supply+Hormuz&hl=en&gl=US&ceid=US:en",
    source: "Google News",
    sourceType: "news",
  },
];

const REDDIT_SEARCHES = [
  { subreddit: "Philippines", query: "oil gas fuel price subsidy", source: "r/Philippines" },
  { subreddit: "energy", query: "crude oil OPEC supply Hormuz", source: "r/energy" },
];

interface RedditPost {
  data: { title: string; created_utc: number; permalink: string; score: number };
}

async function fetchRedditPosts(
  subreddit: string,
  query: string,
  source: string,
): Promise<NewsEvent[]> {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=new&restrict_sr=on&limit=5&t=week`;
    const res = await fetch(url, {
      headers: { "User-Agent": "mbc-policy-brief/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.data?.children ?? [])
      .filter((post: RedditPost) => ENERGY_KEYWORDS.test(post.data.title))
      .map(
        (post: RedditPost): NewsEvent => ({
          date: formatDate(new Date(post.data.created_utc * 1000).toISOString()),
          headline: post.data.title.slice(0, 140),
          severity: estimateSeverity(post.data.title),
          source,
          sourceUrl: `https://reddit.com${post.data.permalink}`,
          sourceType: "social",
        }),
      );
  } catch {
    return [];
  }
}

function estimateSeverity(title: string): NewsSeverity {
  const critical = /record|crisis|surge|spike|war|conflict|shortage|emergency|strike|hike|sanction/i;
  const positive = /resume|recover|stabiliz|drop|ease|relief|deal|agreement|ready/i;
  if (critical.test(title)) return "red";
  if (positive.test(title)) return "green";
  return "yellow";
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr)
    return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export async function GET() {
  try {
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        return parsed.items
          .filter(
            (item) => ENERGY_KEYWORDS.test(item.title || "") || ENERGY_KEYWORDS.test(item.contentSnippet || ""),
          )
          .slice(0, 5)
          .map(
            (item): NewsEvent => ({
              date: formatDate(item.pubDate),
              headline: (item.title || "").slice(0, 140),
              severity: estimateSeverity(item.title || ""),
              source: feed.source,
              sourceUrl: item.link || "",
              sourceType: feed.sourceType,
            }),
          );
      } catch {
        return [];
      }
    });

    const redditPromises = REDDIT_SEARCHES.map((r) => fetchRedditPosts(r.subreddit, r.query, r.source));

    const [feedResults, redditResults] = await Promise.all([
      Promise.all(feedPromises),
      Promise.all(redditPromises),
    ]);

    const rssEvents = [...feedResults.flat(), ...redditResults.flat()];

    // Merge with fallback, deduplicate
    const seen = new Set<string>();
    const merged: NewsEvent[] = [];
    for (const event of [...rssEvents, ...fallbackNewsEvents]) {
      const key = `${event.source}:${event.date}:${event.headline.slice(0, 40)}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(event);
      }
    }

    merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(merged.slice(0, 40), {
      headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=1800" },
    });
  } catch {
    return NextResponse.json(fallbackNewsEvents);
  }
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Clean compile. The page should now be SSR (dynamic, not static) because of the API route.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/news/route.ts package.json bun.lock
git commit -m "feat: add /api/news route for live RSS + Reddit energy news"
```

---

### Task 4: Create the Polling Hook

**Files:**
- Create: `src/hooks/useNewsFeed.ts`

- [ ] **Step 1: Write the hook**

Adapted from `/Users/bbmisa/oil_energy_map/src/hooks/useEvents.ts`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { fallbackNewsEvents } from "@/data/news-events";
import type { NewsEvent } from "@/data/types";

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useNewsFeed() {
  const [events, setEvents] = useState<NewsEvent[]>(fallbackNewsEvents);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchNews = useCallback(() => {
    fetch("/api/news")
      .then((r) => (r.ok ? r.json() : fallbackNewsEvents))
      .then((data: NewsEvent[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setEvents(data);
          setIsLive(true);
          setLastUpdated(new Date());
        }
      })
      .catch(() => {
        // Keep static fallback — section never breaks
      });
  }, []);

  useEffect(() => {
    fetchNews();
    const id = setInterval(fetchNews, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchNews]);

  return { events, isLive, lastUpdated };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean compile.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useNewsFeed.ts
git commit -m "feat: add useNewsFeed hook with 5-min polling"
```

---

### Task 5: Create the NewsFeed Section Component

**Files:**
- Create: `src/components/sections/NewsFeed.tsx`

This is the biggest task. The component includes:
- Severity filter pills (All / Critical / Watch / Positive)
- Source type filter pills (All / News / Gov / Social / Market)
- Live indicator (green pulsing dot when live, grey when static)
- Vertical timeline with color-coded severity dots, source badges, linked headlines
- Glass card styling matching the MBC design system
- Framer Motion `fadeInUp` entrance animations

- [ ] **Step 1: Write the component**

```typescript
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { useNewsFeed } from "@/hooks/useNewsFeed";
import { staggerContainer, fadeInUp } from "@/lib/motion";
import type { NewsSeverity, NewsSourceType } from "@/data/types";

const SEVERITY_COLORS: Record<NewsSeverity, string> = {
  red: "bg-[#EF4444]",
  yellow: "bg-[#F59E0B]",
  green: "bg-[#10B981]",
};

const SEVERITY_GLOW: Record<NewsSeverity, string> = {
  red: "shadow-[0_0_8px_rgba(239,68,68,0.5)]",
  yellow: "shadow-[0_0_8px_rgba(245,158,11,0.4)]",
  green: "shadow-[0_0_8px_rgba(16,185,129,0.4)]",
};

const SOURCE_COLORS: Record<NewsSourceType, string> = {
  news: "text-blue-400",
  government: "text-emerald-400",
  social: "text-purple-400",
  market: "text-yellow-400",
};

const SOURCE_BG: Record<NewsSourceType, string> = {
  news: "bg-blue-400/10 border-blue-400/20",
  government: "bg-emerald-400/10 border-emerald-400/20",
  social: "bg-purple-400/10 border-purple-400/20",
  market: "bg-yellow-400/10 border-yellow-400/20",
};

type SeverityFilter = "all" | NewsSeverity;
type SourceFilter = "all" | NewsSourceType;

const SEVERITY_FILTERS: { key: SeverityFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "red", label: "Critical" },
  { key: "yellow", label: "Watch" },
  { key: "green", label: "Positive" },
];

const SOURCE_FILTERS: { key: SourceFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "news", label: "News" },
  { key: "government", label: "Gov" },
  { key: "social", label: "Social" },
  { key: "market", label: "Market" },
];

export function NewsFeed() {
  const { events, isLive, lastUpdated } = useNewsFeed();
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const filtered = events.filter((e) => {
    if (severityFilter !== "all" && e.severity !== severityFilter) return false;
    if (sourceFilter !== "all" && e.sourceType !== sourceFilter) return false;
    return true;
  });

  return (
    <SectionWrapper
      id="news"
      title="Live News Feed"
      subtitle="Real-time energy crisis headlines from Philippine and global sources"
    >
      {/* Status + Filters */}
      <div className="mb-6 space-y-3">
        {/* Live status */}
        <div className="flex items-center gap-2 text-xs text-white-50">
          <div className={`w-2 h-2 rounded-full ${isLive ? "bg-[#10B981] animate-pulse" : "bg-white-20"}`} />
          <span>{isLive ? "Live" : "Static"}</span>
          {lastUpdated && (
            <span className="text-white-30">
              · Updated {lastUpdated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>
          )}
          <span className="text-white-30">· {filtered.length} events</span>
        </div>

        {/* Severity filters */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-white-30 font-semibold self-center mr-1">Severity</span>
          {SEVERITY_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setSeverityFilter(f.key)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors border ${
                severityFilter === f.key
                  ? "bg-white-10 border-white-20 text-white"
                  : "border-transparent text-white-50 hover:bg-white-05 hover:text-white-70"
              }`}
            >
              {f.key !== "all" && (
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${SEVERITY_COLORS[f.key as NewsSeverity]} mr-1.5`} />
              )}
              {f.label}
            </button>
          ))}
        </div>

        {/* Source type filters */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-white-30 font-semibold self-center mr-1">Source</span>
          {SOURCE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setSourceFilter(f.key)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors border ${
                sourceFilter === f.key
                  ? "bg-white-10 border-white-20 text-white"
                  : "border-transparent text-white-50 hover:bg-white-05 hover:text-white-70"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative"
      >
        {/* Vertical line */}
        <div className="absolute left-[15px] md:left-[19px] top-0 bottom-0 w-0.5 bg-white-08" />

        <div className="space-y-3">
          {filtered.map((event, i) => (
            <motion.div key={`${event.source}-${event.date}-${i}`} variants={fadeInUp} className="relative pl-10 md:pl-12">
              {/* Severity dot */}
              <div
                className={`absolute left-[8px] md:left-[12px] top-3 w-3 h-3 rounded-full ${SEVERITY_COLORS[event.severity]} ${SEVERITY_GLOW[event.severity]}`}
              />

              <div className="glass p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <a
                      href={event.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white-70 hover:text-white transition-colors leading-relaxed block"
                    >
                      {event.headline}
                    </a>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="font-mono text-[10px] text-white-30">{event.date}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${SOURCE_BG[event.sourceType]} ${SOURCE_COLORS[event.sourceType]}`}>
                      {event.source}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <p className="text-sm text-white-30 text-center py-8">No events match the selected filters.</p>
          )}
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean compile.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/NewsFeed.tsx
git commit -m "feat: add NewsFeed section with severity/source filters and live indicator"
```

---

### Task 6: Wire into Navigation and Page

**Files:**
- Modify: `src/components/layout/Nav.tsx` (add to sections array)
- Modify: `src/app/page.tsx` (import and render)

- [ ] **Step 1: Add "Live News" to Nav sections array**

In `Nav.tsx`, add after the "Infrastructure" entry:

```typescript
const sections = [
  { id: "crisis", label: "Crisis Overview" },
  { id: "scenarios", label: "Scenarios" },
  { id: "channels", label: "Distribution Channels" },
  { id: "pillars", label: "Policy Pillars" },
  { id: "anti-recs", label: "Not Recommended" },
  { id: "timeline", label: "Action Timeline" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "news", label: "Live News" },
];
```

- [ ] **Step 2: Import and render NewsFeed in page.tsx**

Add import at top:
```typescript
import { NewsFeed } from "@/components/sections/NewsFeed";
```

Add after the Infrastructure section (before Footer):
```tsx
<div className="border-t border-white-08" />
<NewsFeed />
```

- [ ] **Step 3: Remove `"use client"` from page.tsx**

The page currently has `"use client"` at line 1. With the new API route, the page needs to support both server and client components. However, since `NewsFeed` is already a client component and `page.tsx` doesn't use any client hooks directly, evaluate whether `"use client"` is still needed. If all sections are client components with their own `"use client"` directives, the page can remain as-is.

**Decision:** Keep `"use client"` in page.tsx since all sections use Framer Motion (`whileInView`) which requires client rendering. No change needed.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Clean compile. Note: the page will now be dynamic (not static) because NewsFeed calls `/api/news` at runtime.

- [ ] **Step 5: Test locally**

Run: `npm run dev`
Navigate to `http://localhost:3000#news`
Expected: NewsFeed section renders with fallback events initially, then live events after first fetch.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/Nav.tsx src/app/page.tsx
git commit -m "feat: wire NewsFeed section into nav and page layout"
```

---

### Task 7: Push and Deploy

- [ ] **Step 1: Push all commits**

```bash
git push origin main
```

This triggers Vercel auto-deploy via the Git integration.

- [ ] **Step 2: Verify deployment**

```bash
npx vercel ls --scope xjitsu | head -3
```
Expected: New deployment in `READY` state.

- [ ] **Step 3: Verify live site**

Visit `https://mbc-policy-brief.vercel.app/#news` and confirm:
- Live News section appears at the bottom
- Nav shows "Live News" tab
- Green pulsing dot shows "Live" status
- Filter buttons work (Severity + Source)
- Headlines link to source URLs

---

## Summary

| What | Implementation |
|------|---------------|
| Data sources | 4 RSS feeds (PhilStar, Al Jazeera, Google News x2) + 2 Reddit searches |
| Keyword filter | PH energy crisis terms (oil, fuel, gasoline, excise, subsidy, etc.) |
| Severity classification | Regex-based: critical (crisis, surge, strike), positive (relief, deal), watch (default) |
| Polling interval | 5 minutes client-side |
| Cache strategy | `s-maxage=900, stale-while-revalidate=1800` (15min fresh, 30min stale) |
| Fallback | 10 curated static events — section never goes empty |
| Filters | Severity (All/Critical/Watch/Positive) + Source (All/News/Gov/Social/Market) |
| Daily auto-deploy | Already configured (Task from prior plan) — rebuilds at 08:00 PHT daily |
