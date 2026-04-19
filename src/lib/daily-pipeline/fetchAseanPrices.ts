import type { AseanPriceRow } from "@/data/types";
import { firecrawlMarkdown } from "./firecrawl";
import { logFetch } from "./fetchLog";

const GPP_URL = "https://www.globalpetrolprices.com/diesel_prices/";
const USER_AGENT = "pipedream-policy-brief/1.0";

const ASEAN = [
  "Philippines",
  "Singapore",
  "Malaysia",
  "Thailand",
  "Indonesia",
  "Vietnam",
  "Cambodia",
  "Myanmar",
  "Laos",
  "Brunei",
] as const;

export async function fetchAseanPrices(): Promise<AseanPriceRow[]> {
  const t0 = Date.now();
  const direct = await tryDirect();
  if (direct.length >= 5) {
    await logFetch({
      source: "gpp",
      strategy: "primary",
      success: true,
      durationMs: Date.now() - t0,
    });
    return direct;
  }
  await logFetch({
    source: "gpp",
    strategy: "primary",
    success: false,
    durationMs: Date.now() - t0,
    errorMessage: `only ${direct.length} rows`,
  });

  const t1 = Date.now();
  const md = await firecrawlMarkdown(GPP_URL);
  if (!md) {
    await logFetch({
      source: "gpp",
      strategy: "firecrawl",
      success: false,
      durationMs: Date.now() - t1,
      errorMessage: "firecrawl returned null",
    });
    return direct;
  }
  const fromMd = extractRows(md);
  await logFetch({
    source: "gpp",
    strategy: "firecrawl",
    success: fromMd.length >= 5,
    durationMs: Date.now() - t1,
    errorMessage: fromMd.length < 5 ? `only ${fromMd.length} rows in md` : null,
  });
  return fromMd.length > direct.length ? fromMd : direct;
}

async function tryDirect(): Promise<AseanPriceRow[]> {
  try {
    const res = await fetch(GPP_URL, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    return extractRows(html);
  } catch {
    return [];
  }
}

/**
 * GPP's page structure (as of April 2026):
 *   1. A block of country links in rank order (cheapest first)
 *   2. Lower in the page, a separate block of numeric prices in the same order
 *
 * The two blocks pair by index: countries[i] <-> prices[i]. We extract each
 * list independently, then pair and filter to ASEAN.
 *
 * Accepts either raw HTML (with `<a href="/Country/diesel_prices/">Name</a>`
 * anchors) or firecrawl markdown (with `[Name](/Country/diesel_prices/)` links).
 */
function extractRows(text: string): AseanPriceRow[] {
  // 1. Extract ordered country names. Works on both HTML and markdown
  //    because both reference `/Country/diesel_prices/` links.
  const countryLinkPattern = /\/([A-Za-z_\-]+)\/diesel_prices\//g;
  const countryOrder: string[] = [];
  const seen = new Set<string>();
  let cm: RegExpExecArray | null;
  while ((cm = countryLinkPattern.exec(text)) !== null) {
    const name = cm[1].replace(/_/g, " ").replace(/-/g, " ").trim();
    // Normalize capitalization: first occurrence wins
    if (!seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      countryOrder.push(name);
    }
  }
  if (countryOrder.length < 20) return [];

  // 2. Extract ordered numeric prices (N.NNN format). The first block of
  //    N.NNN values matching the country list length is the USD price list.
  //    We collect every N.NNN token from the tail of the document — the
  //    price list is always after the country link list.
  const firstCountryEnd =
    countryLinkPattern.lastIndex > 0
      ? text.indexOf(countryOrder[countryOrder.length - 1]) + countryOrder[countryOrder.length - 1].length
      : 0;
  const tail = text.slice(Math.max(firstCountryEnd, 0));
  const priceMatches = Array.from(tail.matchAll(/(?<![.\d])(\d\.\d{3})(?!\d)/g));
  const prices = priceMatches.map((m) => parseFloat(m[1])).filter((n) => Number.isFinite(n) && n > 0 && n < 10);

  // We need at least as many prices as countries. If fewer, the page
  // structure has changed — return nothing and let the caller handle it.
  if (prices.length < countryOrder.length) return [];

  // 3. Pair by index, filter to ASEAN
  const aseanLower = new Set(ASEAN.map((c) => c.toLowerCase()));
  const rows: AseanPriceRow[] = [];
  for (let i = 0; i < countryOrder.length; i++) {
    const name = countryOrder[i];
    if (!aseanLower.has(name.toLowerCase())) continue;
    const price = prices[i];
    if (!Number.isFinite(price) || price <= 0 || price > 10) continue;
    // Canonicalize casing back to the ASEAN constant
    const canonical = ASEAN.find((c) => c.toLowerCase() === name.toLowerCase()) ?? name;
    rows.push({ country: canonical, price, rank: 0 });
  }

  rows.sort((a, b) => a.price - b.price);
  rows.forEach((r, i) => {
    r.rank = i + 1;
  });
  return rows;
}
