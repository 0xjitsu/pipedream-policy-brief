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
 * GPP's page structure:
 *   1. Country navigation (names only, no prices)
 *   2. "Diesel prices per liter" heading
 *   3. Two tables — one in USD, one in local-currency equivalents
 *
 * We skip the nav by starting the scan after the first "Diesel prices" heading
 * marker. Within that section, country names appear adjacent to numeric values
 * in "N.NNN" format (USD per liter with 3 decimals).
 */
function extractRows(text: string): AseanPriceRow[] {
  const anchors = [
    "Diesel prices, liter",
    "Diesel prices per liter",
    "USD per liter",
    "diesel prices around the world",
    "Diesel prices",
  ];
  let tableStart = -1;
  for (const anchor of anchors) {
    const idx = text.toLowerCase().indexOf(anchor.toLowerCase());
    if (idx >= 0) {
      tableStart = idx;
      break;
    }
  }
  if (tableStart < 0) return [];

  const tableText = text.slice(tableStart);

  const rows: AseanPriceRow[] = [];
  for (const country of ASEAN) {
    const rel = tableText.indexOf(country);
    if (rel < 0) continue;
    const window = tableText.slice(rel, rel + 200);
    const afterName = window.slice(country.length);
    const match = afterName.match(/(\d\.\d{3})/);
    if (!match) continue;
    const price = parseFloat(match[1]);
    if (!Number.isFinite(price) || price <= 0 || price > 10) continue;
    rows.push({ country, price, rank: 0 });
  }

  rows.sort((a, b) => a.price - b.price);
  rows.forEach((r, i) => {
    r.rank = i + 1;
  });
  return rows;
}
