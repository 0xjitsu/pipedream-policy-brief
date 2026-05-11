import type { FreshnessTier } from "./freshness";

export type SourceType = "api" | "rss" | "scrape" | "computed" | "llm";

export interface MethodologySource {
  /** Display name */
  name: string;
  /** Canonical URL or, for computed sources, a brief identifier */
  url: string;
  /** Source category for grouping + icon selection */
  type: SourceType;
  /** Freshness tier this source feeds */
  tier: FreshnessTier;
  /** Human-readable refresh cadence */
  cadence: string;
  /** What this source provides on the brief */
  provides: string;
  /** What happens when this source is unavailable */
  fallback: string;
}

export const METHODOLOGY_SOURCES: MethodologySource[] = [
  {
    name: "Yahoo Finance — Brent Crude (BZ=F)",
    url: "https://finance.yahoo.com/quote/BZ=F/",
    type: "api",
    tier: "live",
    cadence: "polled every 10 min",
    provides: "Brent crude spot price (USD/bbl)",
    fallback: "Show last cached value with stale indicator",
  },
  {
    name: "Frankfurter / ECB",
    url: "https://www.frankfurter.app/",
    type: "api",
    tier: "live",
    cadence: "polled every 10 min",
    provides: "USD/PHP foreign exchange rate",
    fallback: "Show last cached value with stale indicator",
  },
  {
    name: "Google News + Al Jazeera + r/Philippines RSS",
    url: "https://news.google.com/rss/",
    type: "rss",
    tier: "live",
    cadence: "polled every 5 min",
    provides: "Energy and policy news headlines",
    fallback: "Show last 24h of cached items",
  },
  {
    name: "DOE Oil Industry Monitor",
    url: "https://www.doe.gov.ph/oil-monitor",
    type: "scrape",
    tier: "daily",
    cadence: "scraped daily at 06:00 PHT",
    provides: "Prevailing PH diesel retail pump price",
    fallback: "firecrawl JS render, then Google News RSS for recent Philippine diesel-price articles",
  },
  {
    name: "GlobalPetrolPrices.com",
    url: "https://www.globalpetrolprices.com/diesel_prices/",
    type: "scrape",
    tier: "daily",
    cadence: "scraped daily at 06:00 PHT",
    provides: "USD-denominated diesel price across ASEAN for comparison",
    fallback: "firecrawl markdown + index-pair extractor (country block / price block)",
  },
  {
    name: "OpenStreetMap Overpass",
    url: "https://overpass-api.de/",
    type: "api",
    tier: "daily",
    cadence: "queried daily at 06:00 PHT",
    provides: "Total fuel stations in the Philippines (amenity=fuel)",
    fallback: "Cycle through overpass.kumi.systems and overpass.private.coffee",
  },
  {
    name: "Days of Supply (computed)",
    url: "src/lib/daily-pipeline/computeSupplyDays.ts",
    type: "computed",
    tier: "daily",
    cadence: "recomputed daily at 06:00 PHT",
    provides: "Linear extrapolation from the existing weekly trend in supply data",
    fallback: "Use last known weekly data point unchanged",
  },
  {
    name: "HuggingFace Inference (Llama-3-8B-Instruct)",
    url: "https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct",
    type: "llm",
    tier: "daily",
    cadence: "regenerated daily at 06:00 PHT",
    provides: "2–4 sentence daily narrative synthesized from the snapshot",
    fallback: "Deterministic template synthesizer using snapshot numbers verbatim",
  },
];
