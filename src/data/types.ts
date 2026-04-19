import type { FreshnessTier } from "./freshness";

export type Urgency = "critical" | "urgent" | "important" | "info" | "strategic";

// ─── Daily snapshot shape (persisted in Supabase daily_snapshot table) ───

export interface PumpPriceSnapshot {
  value: number;         // PHP per liter
  delta: string;         // e.g. "+2.3% WoW" — filled by orchestrator
  source: string;
  sourceUrl: string;
}

export interface AseanPriceRow {
  country: string;
  price: number;         // USD per liter
  rank: number;          // 1 = cheapest in ASEAN
}

export interface StationCounts {
  operational: number;
  lowStock: number;
  closed: number;
  total: number;
  asOf: string;          // ISO timestamp
}

export interface SupplyDaysComputation {
  value: number;
  delta: number;         // change vs previous day, signed
  basis: string;         // human-readable explanation of the calc
}

export interface DailyNarrativeSignal {
  metric: "crude" | "peso" | "pump" | "supply";
  direction: "up" | "down" | "stable";
}

export interface DailyNarrativePayload {
  headline: string;
  body: string;
  signals: DailyNarrativeSignal[];
}

export interface DailySnapshot {
  snapshotDate: string;         // "YYYY-MM-DD"
  generatedAt: string;          // ISO timestamp
  pumpPrice: PumpPriceSnapshot | null;
  aseanPrices: AseanPriceRow[];
  stations: StationCounts | null;
  supplyDays: SupplyDaysComputation | null;
  narrative: DailyNarrativePayload | null;
}

export interface MetricCardData {
  label: string;
  value: string;
  delta?: string;
  deltaLabel?: string;
  type?: "gauge" | "number";
  gaugeMax?: number;
  gaugeValue?: number;
  gaugeColor?: string;
  sourceUrl?: string;
  /** @deprecated prefer `tier: "live"` */
  isLive?: boolean;
  /** Data freshness tier — determines the badge rendered on the card */
  tier?: FreshnessTier;
  /** Timestamp of the last update for this metric */
  tierTimestamp?: Date;
}

export interface SenateFindings {
  text: string;
  source: string;
  sourceUrl: string;
  critical: boolean;
}

export interface ProvenPlatform {
  name: string;
  operator: string;
  url: string;
  stationCount: string;
  capabilities: string[];
  scalabilityNote: string;
}

export interface ChannelData {
  id: number;
  name: string;
  tag: string;
  tagColor: string;
  summary: string;
  how: string | string[];
  advantages: string[];
  risks: string[];
  fiscalEstimate: string;
  readiness: string;
  prerequisites?: string[];
  whenToDeploy?: string;
  roadmap?: { week: string; task: string }[];
  platformRequirements?: string[];
  provenPlatform?: ProvenPlatform;
}

export interface RadarMetric {
  axis: string;
  wholesale: number;
  targeted: number;
  ayuda: number;
}

export interface PillarRecommendation {
  title: string;
  detail: string;
  sourceUrl?: string;
}

export interface PillarData {
  id: number;
  title: string;
  urgency: Urgency;
  rationale: string;
  recommendations: PillarRecommendation[];
}

export interface AntiRecData {
  id: number;
  title: string;
  reason: string;
  sourceUrl?: string;
}

export interface ScenarioData {
  price: string;
  label: string;
  gdp: string;
  inflation: string;
  severity: number;
  color: string;
}

export interface TimelineItem {
  period: string;
  urgency: Urgency;
  items: { action: string; agency: string; sourceUrl?: string }[];
}

export type NewsSeverity = "red" | "yellow" | "green";
export type NewsSourceType = "news" | "government" | "social" | "market";

export interface NewsEvent {
  date: string;
  headline: string;
  severity: NewsSeverity;
  source: string;
  sourceUrl: string;
  sourceType: NewsSourceType;
}

export interface RegionStation {
  region: string;
  count: number;
  island: "luzon" | "visayas" | "mindanao";
}

export interface FuelAvailability {
  name: string;
  brandName: string;
  available: number;
  total: number;
}

export interface IslandGroup {
  name: string;
  stations: number;
  percentage: string;
  regions: string;
}

export type StationStatus = "operational" | "low-supply" | "out-of-stock" | "closed";

export interface TrackedStation {
  id: string;
  name: string;
  brand: string;
  lat: number;
  lng: number;
  status: StationStatus;
  lastReported: string;
  reportSource: "news" | "citizen" | "official";
  sourceUrl?: string;
  details?: string;
}

export interface LegislationItem {
  id: string;
  title: string;
  author: string;
  status: string;
  statusColor: string;
  category: string;
  categoryIcon: string;
  position: "supported" | "opposed" | "conditional";
  description: string;
  sourceUrl: string;
  lastUpdated: string;
}
