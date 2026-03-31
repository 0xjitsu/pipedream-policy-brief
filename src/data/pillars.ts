import type { PillarData } from "./types";

export const pillars: PillarData[] = [
  {
    id: 1,
    title: "Secure supply now",
    urgency: "critical",
    rationale:
      "Supply beyond May is unconfirmed. PNOC's successful procurement of 150,000 barrels proves government-facilitated supply works. This must be scaled using the ₱20 billion Malampaya fund.",
    recommendations: [
      {
        title: "Scale PNOC procurement and G2G arrangements",
        detail:
          "Pursue Russia waiver (India model), China, and ASEAN G2G deals. Establish supply coordination desk within UPLIFT.",
      },
      {
        title: "Streamline importation processes",
        detail:
          "Single-window clearance across all agencies. Relax fuel specs temporarily. 24-hour customs turnaround for fuel.",
      },
      {
        title: "Validate alternative supply sources within 72 hours",
        detail:
          "DOE must verify Rotterdam/Petronas supply data raised in Senate. Commission independent Argus benchmark verification.",
      },
      {
        title: "Audit power sector fuel exposure and activate alternate capacity",
        detail:
          "Assess power generation supply mix dependency on diesel/oil. Identify available capacity from coal, natural gas, and renewable sources. Fast-track grid dispatch from non-oil generators to reduce diesel demand from the power sector.",
      },
    ],
  },
  {
    id: 2,
    title: "Accelerate fiscal intervention",
    urgency: "urgent",
    rationale:
      "RA 12316 authorizes excise tax suspension but implementation targets April 12–13. The $80/bbl threshold is breached. Every day of delay costs billions.",
    recommendations: [
      {
        title: "DBCC must convene this week; excise suspension by April 1",
        detail:
          "Establish refund mechanism for inventory with already-paid excise. Emergency publication to compress 15-day window.",
      },
      {
        title: "Phased VAT relief tied to price triggers",
        detail:
          "Suspend on diesel when Dubai crude exceeds $100/bbl; reinstate below $80 for 30 days. Remove VAT upon importation per IPPCA.",
      },
      {
        title: "Cap excise/VAT at $50/bbl equivalent",
        detail:
          "Progressive cushion per Petron recommendation: higher prices = more government absorption.",
      },
    ],
  },
  {
    id: 3,
    title: "Price transparency and anti-profiteering",
    urgency: "important",
    rationale:
      "Public trust is eroding — driving legislative proposals like SB 2011 (Aquino) to impose price caps. Mandatory transparency is the better response: it addresses the same public anger without the destructive consequences of re-regulation. Prove that markets are working fairly, and the political pressure for caps dissipates.",
    recommendations: [
      {
        title: "Mandatory cost unbundling at the pump",
        detail:
          "Weekly breakdowns: base cost, freight, insurance, cargo premium, excise, VAT, margin. Addresses Senate concerns constructively.",
      },
      {
        title: "Strengthen DOE enforcement without overreach",
        detail:
          "Accelerate show-cause investigations. Verify tax relief pass-through. Keep Section 14E as credible deterrent only.",
      },
    ],
  },
  {
    id: 4,
    title: "Demand management and sector protection",
    urgency: "info",
    rationale:
      "The oil-deregulated / fare-regulated disconnect must be addressed. Supply-side alone is insufficient — demand destruction for both power and transport sectors is essential to bridge the gap as inflation rises.",
    recommendations: [
      {
        title: "Implement demand destruction across power and transport",
        detail:
          "Power sector: activate interruptible load programs (ILP), enforce brownout schedules for non-essential facilities, accelerate renewable energy dispatch. Transport: expand WFH mandates, consolidate government fleet operations, promote ride-sharing and route optimization via digital fleet platforms.",
      },
      {
        title: "Structured transport demand reduction",
        detail:
          "Mandate WFH for government. Reduce non-essential hours. Promote digital fleet management for route optimization and fuel hedging via platforms like PriceLOCQ for Business.",
      },
      {
        title: "Fix the transport subsidy disconnect",
        detail:
          "Streamline ₱5,000 disbursement. Consider automatic fare triggers tied to fuel price movements.",
      },
      {
        title: "Protect employment",
        detail:
          "Unemployment at 5.8%. Temporary wage subsidies for fuel-intensive sectors. Activate business continuity plans.",
      },
    ],
  },
  {
    id: 5,
    title: "Build structural resilience",
    urgency: "strategic",
    rationale:
      "98% Middle East dependence, one refinery, no strategic reserve. Whether this crisis lasts months or years, structural lessons must be acted on now.",
    recommendations: [
      {
        title: "Strategic Petroleum Reserve",
        detail:
          "90-day stockpile at Mariveles, Bataan (₱54B at $60/bbl). PPP with PNOC as anchor.",
      },
      {
        title: "Accelerate energy diversification",
        detail:
          "Fast-track 40% RE by 2030. Grid modernization via BOT. Dual-fuel power plants. South China Sea development.",
      },
      {
        title: "Diversify supply permanently",
        detail:
          "Standing agreements with Russia, US, Nigeria, Angola, Latin America. ASEAN mutual supply assurance.",
      },
    ],
  },
];
