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
    tag: "Prepared",
    tagColor: "important",
    summary:
      "Government procures fuel at scale via PNOC and sells to oil companies/distributors at a discounted or subsidized price, who then pass savings through to pump prices.",
    how: [
      "PNOC procures discounted crude/product via G2G arrangements (Russia waiver, ASEAN bilateral deals)",
      "Fuel is sold to participating oil companies at below-market replacement cost",
      "Oil companies distribute through existing retail networks at reduced pump prices",
      "Government absorbs the price differential between procurement cost and sale price to distributors",
    ],
    advantages: [
      "Fastest to deploy — uses existing supply chains and retail infrastructure",
      "Minimal administrative overhead; no beneficiary lists needed",
      "Broad coverage — all consumers benefit at the pump",
      "Oil companies maintain operational control and accountability",
    ],
    risks: [
      "Untargeted — subsidy goes to all consumers including those who can afford market prices",
      "Fiscally expensive if sustained (subsidy scales with total national consumption)",
      "Hard to verify pass-through — risk of margin absorption by middlemen",
      "If subsidy is below replacement cost, it becomes unsustainable and oil companies may reduce operations; if too small, additional targeted sector subsidies may be needed — reinforcing Channel 2's parameterized approach as the superior mechanism",
    ],
    prerequisites: [
      "PNOC procurement contracts finalized (150KB already delivered, 300KB in April pipeline)",
      "Wholesale pricing agreement with participating oil companies",
      "DOE monitoring framework for pass-through verification",
    ],
    fiscalEstimate: "₱2–4B/month at ₱5/L subsidy on national diesel consumption",
    readiness: "High",
    whenToDeploy: "Deploy as fallback if Channel 2 proves too slow, or as supplement for non-whitelisted commercial consumers",
  },
  {
    id: 2,
    name: "Targeted Distribution with Subsidy",
    tag: "Priority",
    tagColor: "strategic",
    summary:
      "Builds on PriceLOCQ for Business (PLB), an existing digital fuel distribution platform already operational at 450+ stations nationwide. Government compiles verified beneficiary whitelists by sector; PLB handles parameterized fuel code generation, station-side verification, real-time tracking, and settlement. The platform is immediately extensible to other fuel brands through API integration, creating a consolidated national distribution system.",
    how: [
      "Government agencies (DOTR, DA, DSWD) compile verified beneficiary whitelists by sector — beneficiaries enrolled on PLB platform with identity verification",
      "PLB generates parameterized fuel codes per beneficiary: driver name, plate number, fuel type, volume limit, validity period, and designated stations",
      "Drivers present fuel codes at any PLB-equipped station — verified in real time against the platform, no physical cards needed",
      "Fuel redeemed is deducted from pre-purchased balance at a locked price, protecting against further price increases during the subsidy period",
      "For beneficiaries without station access: direct fuel vouchers via GCash or PayMaya, redeemable at participating stations — maximizing reach with zero physical infrastructure build",
      "Government reimburses stations for the subsidy differential via PLB's existing settlement module (weekly cycle)",
      "UPLIFT committee receives real-time dashboard visibility on all redemptions, balances, and fiscal exposure across all sectors and regions",
    ],
    advantages: [
      "Platform already operational at 450+ stations — no build time, only configuration for government whitelist integration",
      "Fiscally efficient — subsidy reaches only verified beneficiaries who need it most",
      "Auditable and transparent — digital trail on every redemption prevents leakage and fraud",
      "Fuel price hedging capability — government can lock purchase prices, protecting against further increases",
      "Scalable volume controls — per-beneficiary limits manage total fiscal exposure",
      "Sector-specific calibration — different subsidy levels for PUV drivers vs. farmers vs. fisherfolk",
      "Extensible to other fuel brands beyond Seaoil — Shell, Petron, Caltex, and independent operators can be onboarded through API integration",
      "Preserves market pricing for non-subsidized consumers, maintaining oil company viability",
      "Compatible with existing fintech wallets (GCash 93M users, PayMaya 60M users) — no app installation needed for SMS voucher redemption",
    ],
    risks: [
      "Requires whitelist compilation speed from government agencies — this is the primary bottleneck, not the platform",
      "Enrollment friction — beneficiaries must register, though SMS-based verification reduces barriers",
      "Coverage gaps — informal sector workers may not be on any government list",
      "Multi-brand station onboarding requires MOAs with additional oil companies beyond Seaoil",
      "Subsidy calibration risk — if set below replacement cost, it becomes unsustainable; if too small, additional sector-specific subsidies may be needed",
    ],
    prerequisites: [
      "Verified beneficiary whitelists from DOTR, DA, DSWD, and LGUs",
      "MOA with Seaoil (PLB operator) for government subsidy integration",
      "Onboarding discussions with Shell, Petron, Caltex for multi-brand station coverage",
      "Government settlement process aligned with PLB's existing weekly reimbursement cycle",
      "Hotline/support channel for beneficiary issues",
    ],
    fiscalEstimate: "₱500M–1.5B/month — most efficient channel",
    readiness: "High — platform operational at 450+ stations; government whitelist integration is the only remaining step",
    whenToDeploy: "Immediate priority. Target: operational within 2–3 weeks of whitelist finalization",
    roadmap: [
      { week: "Week 1", task: "DOTR/DA/DSWD compile whitelists; PLB configured for government beneficiary enrollment" },
      { week: "Week 1", task: "MOA signed with Seaoil; onboarding discussions with Shell/Petron/Caltex for multi-brand coverage" },
      { week: "Week 2", task: "Pilot launch in NCR + 2–3 high-impact provinces on existing PLB infrastructure" },
      { week: "Week 2–3", task: "Multi-brand station onboarding; national rollout begins" },
      { week: "Week 3–4", task: "Full national coverage across 16 regions; consolidated multi-provider dashboard operational" },
      { week: "Ongoing", task: "Weekly settlement to stations; monthly UPLIFT reporting; whitelist updates" },
    ],
    platformRequirements: [
      "Beneficiary database with sector tagging (government-provided whitelists)",
      "Parameterized fuel code generation (driver, plate, fuel type, volume, validity, stations) — operational",
      "Station-side verification via SMS codes (feature phone compatible) — operational",
      "Real-time redemption tracking and balance deduction — operational",
      "Settlement/reimbursement module for government → station payments — operational",
      "Fleet management portal with single-price budgeting — operational",
      "UPLIFT committee reporting dashboard — to be configured",
    ],
    provenPlatform: {
      name: "PriceLOCQ for Business (PLB)",
      operator: "Seaoil Philippines",
      url: "https://new.pricelocq.com/",
      stationCount: "450+",
      capabilities: [
        "Fuel code parameterization (driver, plate, fuel type, volume, validity, stations)",
        "Real-time redemption tracking and balance deduction",
        "Fleet management portal with single-price budgeting",
        "Credit card acceptance with zero additional fees",
        "SMS-based station verification (feature phone compatible)",
        "Settlement and reimbursement module",
      ],
      scalabilityNote:
        "Platform architecture supports multi-brand extension — stations from Shell, Petron, Caltex, and independent operators can be onboarded through API integration, creating a consolidated national distribution system.",
    },
  },
  {
    id: 3,
    name: "Outright Liter Distribution via Ayuda",
    tag: "Prepared",
    tagColor: "purple",
    summary:
      "Government directly distributes physical fuel allocations (actual liters) to beneficiaries, either through designated distribution points or pre-loaded digital fuel vouchers for a fixed volume at no cost to the recipient.",
    how: [
      "Government procures fuel via PNOC and allocates volumes to LGUs or distribution centers",
      "Beneficiaries identified via DSWD databases, barangay-level lists, or existing ayuda registries",
      "Distribution options: (a) physical fuel at community tanker points, or (b) digital one-time fuel codes for a fixed liter volume redeemable at stations",
      "For option (b), codes are one-time use, time-limited, and tied to beneficiary identity",
    ],
    advantages: [
      "Maximum impact per beneficiary — free fuel is the most direct relief",
      "Politically visible — tangible government action that constituents can see and feel",
      "Can leverage existing DSWD ayuda infrastructure and beneficiary databases",
      "Digital fuel codes (option b) prevent hoarding and enable controlled distribution",
    ],
    risks: [
      "Logistically complex — physical distribution requires tankers, security, crowd management",
      "High leakage risk in physical distribution — siphoning, resale, corruption at distribution points",
      "Extremely expensive if scaled nationally; only sustainable for limited volumes per beneficiary",
      "Physical distribution creates queues and safety risks; requires PNP/military coordination",
      "Does not address ongoing operational costs for businesses — one-time relief only",
    ],
    prerequisites: [
      "DSWD beneficiary database or LGU-level registration",
      "For physical distribution: fuel tanker logistics, distribution site selection, security coordination with PNP",
      "For digital codes: platform for one-time-use, volume-limited, identity-tied fuel codes at participating stations",
      "LGU coordination for last-mile distribution management",
    ],
    fiscalEstimate: "₱6.5B per round (10L × 5M households × ₱130/L government cost)",
    readiness: "Medium",
    whenToDeploy: "Deploy for acute humanitarian relief if crisis extends beyond 60 days, or for communities with no station access. Digital fuel codes (option b) strongly preferred over physical tanker distribution.",
  },
];

export const sequencingRecommendation =
  "Deploy Channel 2 as primary within 2–3 weeks using PriceLOCQ for Business (PLB) infrastructure already operational at 450+ stations, supplemented by GCash/PayMaya fuel vouchers for digital-first delivery. Extend PLB to additional fuel brands through API integration for national multi-provider coverage. Revenue from maintained excise taxes funds the subsidy — making the fiscal model self-sustaining. Hold Channel 1 (wholesale) as immediate fallback for commercial consumers not on the whitelist. Prepare Channel 3 (ayuda) for humanitarian-scale deployment if the crisis extends beyond 60 days.";

export const channelContext = {
  problem:
    "With diesel prices surging past ₱130/L (+136% from pre-crisis levels), millions of Filipino workers, farmers, and fisherfolk who depend on affordable fuel face an immediate livelihood crisis. Public utility vehicle (PUV) operators, agricultural producers, and fishing communities are being priced out of essential economic activity.",
  scale: [
    { label: "PUV Drivers", count: "~180,000", source: "DOTR", sourceUrl: "https://dotr.gov.ph/" },
    { label: "Farmers", count: "~5.5M", source: "DA", sourceUrl: "https://www.da.gov.ph/" },
    { label: "Fisherfolk", count: "~1.9M", source: "BFAR", sourceUrl: "https://www.bfar.da.gov.ph/" },
    { label: "Affected Households", count: "~12M", source: "DSWD", sourceUrl: "https://www.dswd.gov.ph/" },
  ],
  question:
    "The central policy question is not whether to intervene, but how. Three distribution mechanisms exist, each with fundamentally different trade-offs in speed, fiscal cost, targeting accuracy, and corruption risk.",
  sources: {
    senateHearing: {
      label: "Senate Energy Committee Hearing (Mar 2026)",
      url: "https://senate.gov.ph/press_release/2026/",
    },
    doe: {
      label: "DOE Weekly Supply Monitoring",
      url: "https://www.doe.gov.ph/downstream-oil",
    },
    dof: {
      label: "Department of Finance",
      url: "https://www.dof.gov.ph/",
    },
    uplift: {
      label: "UPLIFT Committee Report",
      url: "https://www.officialgazette.gov.ph/",
    },
  },
};
