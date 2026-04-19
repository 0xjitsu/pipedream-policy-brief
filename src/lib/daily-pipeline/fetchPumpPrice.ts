import type { PumpPriceSnapshot } from "@/data/types";
import { firecrawlMarkdown } from "./firecrawl";
import { logFetch } from "./fetchLog";

const DOE_URL = "https://www.doe.gov.ph/oil-monitor";
const USER_AGENT =
  "pipedream-policy-brief/1.0 (+https://pipedream-policy-brief.vercel.app)";

/**
 * Parses the latest diesel pump price. Plain fetch first; falls through
 * to firecrawl (JS-rendered page) when the HTML doesn't contain the value.
 */
export async function fetchPumpPrice(): Promise<PumpPriceSnapshot | null> {
  const t0 = Date.now();
  const direct = await tryDirect();
  if (direct) {
    await logFetch({
      source: "doe",
      strategy: "primary",
      success: true,
      durationMs: Date.now() - t0,
    });
    return direct;
  }
  await logFetch({
    source: "doe",
    strategy: "primary",
    success: false,
    durationMs: Date.now() - t0,
    errorMessage: "no diesel match in HTML",
  });

  const t1 = Date.now();
  const md = await firecrawlMarkdown(DOE_URL);
  if (!md) {
    await logFetch({
      source: "doe",
      strategy: "firecrawl",
      success: false,
      durationMs: Date.now() - t1,
      errorMessage: "firecrawl returned null",
    });
    return null;
  }
  const value = parseDieselFromText(md);
  await logFetch({
    source: "doe",
    strategy: "firecrawl",
    success: value !== null,
    durationMs: Date.now() - t1,
    errorMessage: value === null ? "no diesel match in markdown" : null,
  });
  if (value === null) return null;
  return {
    value,
    delta: "",
    source: "DOE Oil Industry Monitor (via firecrawl)",
    sourceUrl: DOE_URL,
  };
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
    return {
      value,
      delta: "",
      source: "DOE Oil Industry Monitor",
      sourceUrl: DOE_URL,
    };
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
