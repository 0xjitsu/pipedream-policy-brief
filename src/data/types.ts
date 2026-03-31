export type Urgency = "critical" | "urgent" | "important" | "info" | "strategic";

export interface MetricCardData {
  label: string;
  value: string;
  delta?: string;
  deltaLabel?: string;
  type?: "gauge" | "number";
  gaugeMax?: number;
  gaugeValue?: number;
  gaugeColor?: string;
}

export interface SenateFindings {
  text: string;
  source: string;
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
  items: { action: string; agency: string }[];
}

export interface RegionStation {
  region: string;
  count: number;
  island: "luzon" | "visayas" | "mindanao";
}

export interface FuelAvailability {
  name: string;
  available: number;
  total: number;
}

export interface IslandGroup {
  name: string;
  stations: number;
  percentage: string;
  regions: string;
}
