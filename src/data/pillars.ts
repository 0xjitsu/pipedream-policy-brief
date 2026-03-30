import type { PillarData } from "./types";

export const pillars: PillarData[] = [
  {
    id: 1,
    title: "Secure supply now",
    urgency: "critical",
    recommendations: [
      "Scale PNOC procurement + G2G deals: Russia waiver (India model), China, ASEAN bilateral",
      "Single-window import clearance across all agencies; relax fuel specs temporarily per IPPCA",
      "Validate Rotterdam/Petronas alternative supply data within 72 hours (Sen. Marcoleta's Senate data)",
    ],
  },
  {
    id: 2,
    title: "Accelerate fiscal intervention",
    urgency: "urgent",
    recommendations: [
      "DBCC convene this week; excise suspension by April 1 (not April 12–13)",
      "Phased VAT relief on diesel with price triggers: suspend when Dubai crude >$100/bbl, reinstate <$80 for 30 days",
      "Cap excise+VAT collection at $50/bbl Dubai crude equivalent (per Petron recommendation)",
    ],
  },
  {
    id: 3,
    title: "Price transparency and anti-profiteering",
    urgency: "important",
    recommendations: [
      "Mandatory weekly cost unbundling at pump: base cost, freight, insurance, cargo premium, excise, VAT, margin",
      "Accelerate DOE show-cause investigations; keep Section 14E as credible deterrent only",
    ],
  },
  {
    id: 4,
    title: "Demand management + sector protection",
    urgency: "info",
    recommendations: [
      "Mandate expanded WFH for government; reduce non-essential operating hours",
      "Fix transport subsidy disconnect: oil deregulated but fares regulated = operators losing money",
      "Employment protection: unemployment at 5.8% from 3.8%; temporary wage subsidies for fuel-intensive sectors",
    ],
  },
  {
    id: 5,
    title: "Structural resilience",
    urgency: "strategic",
    recommendations: [
      "Strategic Petroleum Reserve: 90-day stockpile at Mariveles, Bataan (₱54B at $60/bbl); PPP with PNOC",
      "Fast-track 40% RE by 2030; grid BOT scheme; dual-fuel power plants",
      "Permanent supply diversification: standing agreements with Russia, US, Nigeria, Angola, ASEAN mutual assurance",
    ],
  },
];
