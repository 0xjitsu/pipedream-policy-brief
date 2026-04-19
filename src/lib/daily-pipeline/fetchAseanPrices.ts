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

function extractRows(text: string): AseanPriceRow[] {
  const rows: AseanPriceRow[] = [];
  for (const country of ASEAN) {
    const idx = text.indexOf(country);
    if (idx < 0) continue;
    const window = text.slice(idx, idx + 800);
    const match = window.match(/(\d\.\d{3})/);
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
