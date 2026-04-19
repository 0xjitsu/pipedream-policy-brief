import type { PumpPriceSnapshot } from "@/data/types";

const DOE_URL = "https://www.doe.gov.ph/oil-monitor";
const USER_AGENT =
  "pipedream-policy-brief/1.0 (+https://pipedream-policy-brief.vercel.app)";

/**
 * Parses the latest diesel pump price from the DOE Oil Industry Monitor page.
 * Returns null on any error — upstream page structure changes shouldn't blow
 * up the whole pipeline.
 */
export async function fetchPumpPrice(): Promise<PumpPriceSnapshot | null> {
  try {
    const res = await fetch(DOE_URL, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;

    const html = await res.text();
    const lower = html.toLowerCase();

    // Find the diesel row (DOE publishes <td>Diesel</td><td>128.50</td>...)
    const dieselIdx = lower.indexOf("diesel");
    if (dieselIdx < 0) return null;

    const window = html.slice(dieselIdx, dieselIdx + 400);
    const priceMatch = window.match(/(\d{2,3}\.\d{2})/);
    if (!priceMatch) return null;

    const value = parseFloat(priceMatch[1]);
    if (!Number.isFinite(value) || value < 30 || value > 300) return null;

    return {
      value,
      delta: "", // filled by orchestrator (needs previous snapshot)
      source: "DOE Oil Industry Monitor",
      sourceUrl: DOE_URL,
    };
  } catch {
    return null;
  }
}
