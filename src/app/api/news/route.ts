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
