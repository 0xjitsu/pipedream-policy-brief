import type { ChannelData, RadarMetric } from "./types";

export const radarMetrics: RadarMetric[] = [
  { axis: "Speed to deploy", wholesale: 5, targeted: 3, ayuda: 2 },
  { axis: "Fiscal efficiency", wholesale: 2, targeted: 5, ayuda: 1 },
  { axis: "Auditability", wholesale: 2, targeted: 5, ayuda: 3 },
  { axis: "Coverage breadth", wholesale: 5, targeted: 4, ayuda: 3 },
  { axis: "Fraud resistance", wholesale: 2, targeted: 5, ayuda: 3 },
  { axis: "Political visibility", wholesale: 3, targeted: 4, ayuda: 5 },
];

export const fiscalCosts = [
  { channel: "Channel 1 — Wholesale", min: 2, max: 4, unit: "billion/month", color: "#F59E0B" },
  { channel: "Channel 2 — Targeted", min: 0.5, max: 1.5, unit: "billion/month", color: "#10B981" },
  { channel: "Channel 3 — Ayuda", min: 6.5, max: 6.5, unit: "billion/round", color: "#8B5CF6" },
];

export const channels: ChannelData[] = [
  {
    id: 1,
    name: "Wholesale Distribution",
    tag: "Fallback",
    tagColor: "important",
    how: "PNOC procures fuel at scale via G2G → sells to oil companies at subsidized price → companies distribute through existing retail at reduced pump prices → government absorbs differential",
    advantages: [
      "Fastest to deploy (uses existing supply chains)",
      "Broad coverage (all consumers benefit)",
      "Minimal admin overhead",
    ],
    risks: [
      "Untargeted (subsidy goes to everyone including wealthy)",
      "Fiscally expensive at scale",
      "Hard to verify margin pass-through by middlemen",
      "Unsustainable if subsidy is below replacement cost",
    ],
    fiscalEstimate: "₱2–4B/month at ₱5/L subsidy on national diesel consumption",
    readiness: "High",
    whenToDeploy: "Fallback for non-whitelisted commercial consumers, or if Channel 2 enrollment is too slow",
  },
  {
    id: 2,
    name: "Targeted Distribution with Subsidy",
    tag: "Priority",
    tagColor: "strategic",
    how: [
      "Government agencies (DOTR, DA, DSWD) compile verified beneficiary whitelists by sector",
      "Beneficiaries enrolled on a digital distribution platform with identity verification",
      "Fuel allocation codes/vouchers issued per beneficiary, parameterized by: sector, volume limit, fuel type, validity period, designated stations",
      "Beneficiaries redeem fuel at participating stations by presenting codes; station verifies against platform",
      "Government reimburses stations for the subsidy differential",
      "Real-time tracking provides audit trail and prevents double-claiming",
    ],
    advantages: [
      "Fiscally efficient (subsidy reaches only those who need it)",
      "Auditable digital trail prevents fraud",
      "Volume caps control fiscal exposure",
      "Sector-specific calibration possible (different subsidies for PUV vs farmers vs fisherfolk)",
      "442+ digitally-equipped stations already operational across 16 regions",
      "Preserves market pricing for non-subsidized consumers",
    ],
    risks: [
      "Requires whitelist compilation speed from agencies",
      "Enrollment friction for beneficiaries",
      "Informal sector coverage gaps",
      "Station participation must be geographically broad",
    ],
    fiscalEstimate: "₱500M–1.5B/month — most efficient channel",
    readiness: "Medium-High (digital infrastructure exists; whitelists are the bottleneck)",
    roadmap: [
      { week: "Week 1", task: "DOTR/DA/DSWD compile and validate beneficiary whitelists by sector" },
      { week: "Week 1–2", task: "Digital platform configured — enrollment, code generation, station verification, tracking" },
      { week: "Week 2", task: "MOA signed with participating station networks; station personnel trained" },
      { week: "Week 2–3", task: "Pilot launch in NCR + 2–3 high-impact provinces" },
      { week: "Week 3–4", task: "National rollout across all 16 regions" },
      { week: "Ongoing", task: "Weekly settlement to stations; monthly UPLIFT reporting; whitelist updates" },
    ],
    platformRequirements: [
      "Beneficiary database with sector tagging",
      "Parameterized code generation (driver, vehicle, fuel type, volume, validity, stations)",
      "Station-side verification (SMS-based for feature phone compatibility)",
      "Real-time redemption tracking and deduction from fuel balance",
      "Settlement/reimbursement module for government → station payments",
      "Reporting dashboard for UPLIFT committee visibility",
    ],
  },
  {
    id: 3,
    name: "Outright Liter Distribution via Ayuda",
    tag: "Contingency",
    tagColor: "purple",
    how: "Government procures fuel via PNOC → allocates to LGUs/distribution centers → beneficiaries receive either (a) physical fuel at community tanker points, or (b) digital one-time fuel codes for a fixed liter volume at no cost",
    advantages: [
      "Maximum direct relief (free fuel)",
      "Politically visible",
      "Leverages DSWD ayuda infrastructure",
    ],
    risks: [
      "Logistically complex for physical distribution (tankers, security, crowds)",
      "High leakage/corruption risk in physical mode",
      "Extremely expensive if scaled",
      "One-time relief only",
    ],
    fiscalEstimate: "₱6.5B per round (10L × 5M households × ₱130/L government cost)",
    readiness: "Medium",
    whenToDeploy: "Humanitarian relief if crisis exceeds 60 days, or for communities without station access. Digital fuel codes (option b) are strongly preferred over physical tanker distribution.",
  },
];

export const sequencingRecommendation =
  "Deploy Channel 2 as primary within 2–3 weeks. Hold Channel 1 (wholesale) as immediate fallback for commercial consumers not on the whitelist. Prepare Channel 3 (ayuda) for humanitarian-scale deployment if the crisis extends beyond 60 days. All three channels leverage existing digital fuel distribution infrastructure with 442+ stations across 16 regions.";
