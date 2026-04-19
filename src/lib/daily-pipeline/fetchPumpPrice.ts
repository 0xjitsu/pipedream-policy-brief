import type { PumpPriceSnapshot } from "@/data/types";
import { firecrawlMarkdown } from "./firecrawl";
import { logFetch } from "./fetchLog";
import Parser from "rss-parser";

const DOE_URL = "https://www.doe.gov.ph/oil-monitor";
const USER_AGENT =
  "pipedream-policy-brief/1.0 (+https://pipedream-policy-brief.vercel.app)";

const GOOGLE_NEWS_RSS =
  "https://news.google.com/rss/search?q=philippines+diesel+price+pump+(philstar.com+OR+inquirer.net)&hl=en-PH&gl=PH&ceid=PH:en";

export async function fetchPumpPrice(): Promise<PumpPriceSnapshot | null> {
  // Strategy 1: direct fetch
  let t = Date.now();
  const direct = await tryDirect();
  if (direct) {
    await logFetch({ source: "doe", strategy: "primary", success: true, durationMs: Date.now() - t });
    return direct;
  }
  await logFetch({
    source: "doe", strategy: "primary", success: false,
    durationMs: Date.now() - t, errorMessage: "no diesel match / blocked",
  });

  // Strategy 2: firecrawl
  t = Date.now();
  const md = await firecrawlMarkdown(DOE_URL);
  const fromFirecrawl = md ? parseDieselFromText(md) : null;
  await logFetch({
    source: "doe", strategy: "firecrawl",
    success: fromFirecrawl !== null,
    durationMs: Date.now() - t,
    errorMessage: fromFirecrawl === null ? "cloudflare challenge / no match" : null,
  });
  if (fromFirecrawl !== null) {
    return { value: fromFirecrawl, delta: "", source: "DOE Oil Industry Monitor (via firecrawl)", sourceUrl: DOE_URL };
  }

  // Strategy 3: Google News RSS
  t = Date.now();
  const fromNews = await tryGoogleNews();
  await logFetch({
    source: "doe", strategy: "firecrawl",
    success: fromNews !== null,
    durationMs: Date.now() - t,
    errorMessage: fromNews === null ? "no price in recent news" : "via google-news-rss",
  });
  return fromNews;
}

async function tryDirect(): Promise<PumpPriceSnapshot | null> {
  try {
    const res = await fetch(DOE_URL, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const value = parseDieselFromText(html);
    if (value === null) return null;
    return { value, delta: "", source: "DOE Oil Industry Monitor", sourceUrl: DOE_URL };
  } catch {
    return null;
  }
}

async function tryGoogleNews(): Promise<PumpPriceSnapshot | null> {
  try {
    const parser = new Parser({ timeout: 10_000 });
    const feed = await parser.parseURL(GOOGLE_NEWS_RSS);

    for (const item of feed.items.slice(0, 5)) {
      const text = [item.title, item.contentSnippet, item.content].filter(Boolean).join(" ");
      if (!text) continue;
      const match =
        text.match(/(?:₱|P|PHP)\s*(\d{2,3}\.\d{2})(?:\s*\/\s*L|per\s*liter)?/i) ||
        text.match(/(\d{2,3}\.\d{2})\s*\/\s*L/i);
      if (!match) continue;
      const value = parseFloat(match[1]);
      if (!Number.isFinite(value) || value < 30 || value > 300) continue;
      return {
        value,
        delta: "",
        source: "Google News (Philippine diesel price)",
        sourceUrl: item.link ?? "https://news.google.com/",
      };
    }
    return null;
  } catch {
    return null;
  }
}

function parseDieselFromText(text: string): number | null {
  const lower = text.toLowerCase();
  const dieselIdx = lower.indexOf("diesel");
  if (dieselIdx < 0) return null;
  const window = text.slice(dieselIdx, dieselIdx + 400);
  const match = window.match(/(\d{2,3}\.\d{2})/);
  if (!match) return null;
  const value = parseFloat(match[1]);
  if (!Number.isFinite(value) || value < 30 || value > 300) return null;
  return value;
}
