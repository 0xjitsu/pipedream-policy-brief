import type { StationCounts } from "@/data/types";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const OVERPASS_QUERY = `
[out:json][timeout:45];
area["ISO3166-1"="PH"][admin_level=2]->.ph;
node["amenity"="fuel"](area.ph);
out count;
`;

/**
 * Queries OSM Overpass for the count of fuel stations in the Philippines.
 * Status breakdown (operational/lowStock/closed) is estimated from
 * proportions in the existing static fallback data since OSM doesn't carry
 * live fuel-availability tags. Phase 3 can upgrade with Waze alert signals.
 */
export async function fetchStationSnapshot(): Promise<StationCounts | null> {
  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "pipedream-policy-brief/1.0",
      },
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const countElement = data?.elements?.find(
      (e: { type: string }) => e.type === "count",
    );
    const total = parseInt(countElement?.tags?.total ?? "0", 10);
    if (!Number.isFinite(total) || total < 1000 || total > 50_000) return null;

    // Current-crisis proportions from fallback data: 93.7% operational,
    // 3.4% low stock, 2.9% closed. Updated when Waze layer lands.
    const operational = Math.round(total * 0.937);
    const lowStock = Math.round(total * 0.034);
    const closed = total - operational - lowStock;

    return {
      operational,
      lowStock,
      closed,
      total,
      asOf: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
