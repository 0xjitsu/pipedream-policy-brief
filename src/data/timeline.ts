import type { TimelineItem } from "./types";

export const timeline: TimelineItem[] = [
  {
    period: "This Week",
    urgency: "critical",
    items: [
      { action: "Convene DBCC, approve excise tax suspension", agency: "DOF/DBCC", sourceUrl: "https://newsinfo.inquirer.net/2202073/dof-price-cuts-due-to-fuel-tax-law-felt-by-mid-april" },
      { action: "Validate alternative supply data (Rotterdam, Petronas)", agency: "DOE", sourceUrl: "https://doe.gov.ph/articles/group/reports-information-resources?category=Downstream+Oil+and+Natural+Gas&display_type=Card" },
      { action: "Finalize beneficiary whitelists for Channel 2", agency: "DOTR/DA/DSWD", sourceUrl: "https://dotr.gov.ph/" },
      { action: "Convene UPLIFT committee", agency: "Office of the President", sourceUrl: "https://www.officialgazette.gov.ph/" },
    ],
  },
  {
    period: "By April 1",
    urgency: "urgent",
    items: [
      { action: "Excise tax suspension takes effect", agency: "DOF/BIR", sourceUrl: "https://www.bir.gov.ph/" },
    ],
  },
  {
    period: "By April 7",
    urgency: "urgent",
    items: [
      { action: "Single-window import clearance operational", agency: "DOE/BOC", sourceUrl: "https://customs.gov.ph/" },
    ],
  },
  {
    period: "Week 2–3",
    urgency: "urgent",
    items: [
      { action: "Channel 2 pilot launch: NCR + priority provinces", agency: "DOE/PNOC", sourceUrl: "https://www.bworldonline.com/the-nation/2026/03/29/739486/philippines-to-take-delivery-of-1-04m-barrels-of-diesel-to-boost-fuel-supply/" },
    ],
  },
  {
    period: "By April 15",
    urgency: "important",
    items: [
      { action: "First G2G supply agreements signed", agency: "DFA/DOE", sourceUrl: "https://www.dfa.gov.ph/" },
    ],
  },
  {
    period: "By April 30",
    urgency: "important",
    items: [
      { action: "Channel 2 national rollout", agency: "DOE", sourceUrl: "https://legacy.doe.gov.ph/downstream-oil/lfro-with-valid-coc-lfo" },
      { action: "Mandatory cost unbundling at all stations", agency: "DOE", sourceUrl: "https://doe.gov.ph/articles/group/liquid-fuels?category=Oil+Monitor&display_type=Card" },
    ],
  },
  {
    period: "By May 15",
    urgency: "info",
    items: [
      { action: "Transport subsidy disbursement streamlined", agency: "DOTR/LTFRB", sourceUrl: "https://ltfrb.gov.ph/" },
    ],
  },
  {
    period: "Q2 2026",
    urgency: "strategic",
    items: [
      { action: "SPR feasibility study completed", agency: "DOE/PNOC", sourceUrl: "https://www.enerdata.net/publications/daily-energy-news/philippines-sets-usd330m-emergency-fund-secure-fuel-supply.html" },
      { action: "Channel 1 and 3 contingency plans finalized", agency: "DOE", sourceUrl: "https://doe.gov.ph/articles/group/reports-information-resources?category=Downstream+Oil+and+Natural+Gas&display_type=Card" },
    ],
  },
];
