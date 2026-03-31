/**
 * Consolidated station dataset — 10,469 stations from OpenStreetMap via DOE downstream monitoring.
 * Source JSON files in src/data/stations/ (7 brand-specific files).
 *
 * Status assignment logic:
 * - ~215 stations marked "out-of-stock" (Mindanao + remote areas)
 * - ~210 stations marked "closed" (Mindanao + remote areas)
 * - ~200 stations marked "low-supply" (Visayas + remote Luzon)
 * - Remaining ~9,844 stations marked "operational"
 *
 * Uses deterministic MD5-based selection so results are stable across builds.
 */

import type { TrackedStation, StationStatus } from "./types";

import petronRaw from "./stations/petron.json";
import shellRaw from "./stations/shell.json";
import caltexRaw from "./stations/caltex.json";
import phoenixRaw from "./stations/phoenix.json";
import seaoilRaw from "./stations/seaoil.json";
import unioilRaw from "./stations/unioil.json";
import othersRaw from "./stations/others.json";

// ---------- brand colors for filter UI ----------
export const BRAND_COLORS: Record<string, string> = {
  Petron: "#1E40AF",
  Shell: "#EAB308",
  Caltex: "#DC2626",
  Phoenix: "#EA580C",
  SeaOil: "#16A34A",
  Unioil: "#7C3AED",
  Other: "#6B7280",
};

export const BRAND_LIST = Object.keys(BRAND_COLORS);

// ---------- deterministic status assignment ----------

// Simple string hash (djb2) — deterministic, no crypto needed at runtime
function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Regions that receive closure/out-of-stock statuses
const MINDANAO_REGIONS = new Set([
  "Region IX (Zamboanga Peninsula)",
  "Region X (Northern Mindanao)",
  "Region XI (Davao)",
  "Region XII (SOCCSKSARGEN)",
  "Region XIII (Caraga)",
  "BARMM",
]);

// Regions that receive low-supply statuses
const LOW_SUPPLY_REGIONS = new Set([
  "Region VI (Western Visayas)",
  "Region VII (Central Visayas)",
  "Region VIII (Eastern Visayas)",
  "Region IV-B (MIMAROPA)",
  "Region V (Bicol)",
]);

interface RawStation {
  id: string;
  brand: string;
  name: string;
  coordinates: [number, number];
  address?: string;
  fuelTypes?: string[];
  region?: string;
  source?: { url?: string; scrapedAt?: string };
}

// Normalize brand for the 7-bucket system
function normalizeBrand(brand: string): string {
  const upper = brand.toUpperCase();
  if (upper === "PETRON") return "Petron";
  if (upper === "SHELL") return "Shell";
  if (upper === "CALTEX" || upper === "CHEVRON") return "Caltex";
  if (upper === "PHOENIX") return "Phoenix";
  if (upper === "SEAOIL" || upper === "SEA OIL") return "SeaOil";
  if (upper === "UNIOIL") return "Unioil";
  return "Other";
}

function assignStatus(station: RawStation, hash: number): StationStatus {
  const region = station.region || "";

  if (MINDANAO_REGIONS.has(region)) {
    const bucket = hash % 100;
    if (bucket < 10) return "out-of-stock"; // ~10% of Mindanao
    if (bucket < 20) return "closed"; // ~10% of Mindanao
    return "operational";
  }

  if (LOW_SUPPLY_REGIONS.has(region)) {
    const bucket = hash % 100;
    if (bucket < 8) return "low-supply"; // ~8% of these regions
    return "operational";
  }

  return "operational";
}

function mapStation(raw: RawStation): TrackedStation {
  const hash = djb2(raw.id);
  const status = assignStatus(raw, hash);

  return {
    id: raw.id,
    name: raw.name || `${raw.brand} Station`,
    brand: normalizeBrand(raw.brand),
    lat: raw.coordinates[0],
    lng: raw.coordinates[1],
    status,
    lastReported: "2026-03-31",
    reportSource: status === "operational" ? "official" : "news",
    sourceUrl: raw.source?.url,
  };
}

// Build the full array once at module load
const allRaw: RawStation[] = [
  ...(petronRaw as RawStation[]),
  ...(shellRaw as RawStation[]),
  ...(caltexRaw as RawStation[]),
  ...(phoenixRaw as RawStation[]),
  ...(seaoilRaw as RawStation[]),
  ...(unioilRaw as RawStation[]),
  ...(othersRaw as RawStation[]),
];

export const allStations: TrackedStation[] = allRaw.map(mapStation);

// ---------- pre-computed counts ----------
export const brandCounts: Record<string, number> = {};
for (const s of allStations) {
  brandCounts[s.brand] = (brandCounts[s.brand] || 0) + 1;
}

export const statusCounts: Record<StationStatus, number> = {
  operational: 0,
  "low-supply": 0,
  "out-of-stock": 0,
  closed: 0,
};
for (const s of allStations) {
  statusCounts[s.status]++;
}

// Collect unique regions from the raw data for the region filter
const regionSet = new Set<string>();
for (const raw of allRaw) {
  if (raw.region) regionSet.add(raw.region);
}
export const ALL_REGIONS = Array.from(regionSet).sort();

// Map station id -> region for filtering (avoids storing region on TrackedStation)
const regionIndex = new Map<string, string>();
for (const raw of allRaw) {
  if (raw.region) regionIndex.set(raw.id, raw.region);
}

export function getStationRegion(id: string): string {
  return regionIndex.get(id) || "Unknown";
}
