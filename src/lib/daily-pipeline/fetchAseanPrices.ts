import type { AseanPriceRow } from "@/data/types";

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

/**
 * Extracts diesel prices (USD/L) for ASEAN countries from the GPP world table.
 * GPP serves a static HTML table keyed by country name; we regex the rows.
 */
export async function fetchAseanPrices(): Promise<AseanPriceRow[]> {
  try {
    const res = await fetch(GPP_URL, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];

    const html = await res.text();
    const rows: AseanPriceRow[] = [];

    for (const country of ASEAN) {
      const idx = html.indexOf(`>${country}<`);
      if (idx < 0) continue;
      const window = html.slice(idx, idx + 800);
      const match = window.match(/>(\d\.\d{3})</);
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
  } catch {
    return [];
  }
}
