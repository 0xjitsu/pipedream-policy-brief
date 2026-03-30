import type { TimelineItem } from "./types";

export const timeline: TimelineItem[] = [
  {
    period: "This Week",
    urgency: "critical",
    items: [
      { action: "Convene DBCC, approve excise tax suspension", agency: "DOF/DBCC" },
      { action: "Validate alternative supply data (Rotterdam, Petronas)", agency: "DOE" },
      { action: "Finalize beneficiary whitelists for Channel 2", agency: "DOTR/DA/DSWD" },
      { action: "Convene UPLIFT committee", agency: "Office of the President" },
    ],
  },
  {
    period: "By April 1",
    urgency: "urgent",
    items: [
      { action: "Excise tax suspension takes effect", agency: "DOF/BIR" },
    ],
  },
  {
    period: "By April 7",
    urgency: "urgent",
    items: [
      { action: "Single-window import clearance operational", agency: "DOE/BOC" },
    ],
  },
  {
    period: "Week 2–3",
    urgency: "urgent",
    items: [
      { action: "Channel 2 pilot launch: NCR + priority provinces", agency: "DOE/PNOC" },
    ],
  },
  {
    period: "By April 15",
    urgency: "important",
    items: [
      { action: "First G2G supply agreements signed", agency: "DFA/DOE" },
    ],
  },
  {
    period: "By April 30",
    urgency: "important",
    items: [
      { action: "Channel 2 national rollout", agency: "DOE" },
      { action: "Mandatory cost unbundling at all stations", agency: "DOE" },
    ],
  },
  {
    period: "By May 15",
    urgency: "info",
    items: [
      { action: "Transport subsidy disbursement streamlined", agency: "DOTR/LTFRB" },
    ],
  },
  {
    period: "Q2 2026",
    urgency: "strategic",
    items: [
      { action: "SPR feasibility study completed", agency: "DOE/PNOC" },
      { action: "Channel 1 and 3 contingency plans finalized", agency: "DOE" },
    ],
  },
];
