import type { AntiRecData } from "./types";

export const antiRecContext =
  "Several proposals have been raised in Senate hearings and public discourse. MBC has evaluated each and determined they would cause more harm than the problem they aim to solve. These are not theoretical concerns — each carries specific, quantifiable risks to fiscal stability, investment climate, and fuel supply continuity.";

export const antiRecommendations: AntiRecData[] = [
  {
    id: 1,
    title: "Full re-regulation of the oil industry",
    reason:
      "Requires ₱17B in government subsidies at $50/bbl per Petron Senate testimony. Deters private investment, triggers supply withdrawals.",
  },
  {
    id: 2,
    title: "Price caps without corresponding subsidies (SB 2011)",
    reason:
      "Sen. Aquino's SB 2011 proposes classifying gasoline and diesel as basic necessities under RA 7581 (Price Act), enabling 30-day price freezes during emergencies. While well-intentioned, price caps without a fiscal backstop cause the exact shortages we're trying to prevent — oil companies cannot absorb losses without business stoppage. The bill also conflicts with RA 8479 (Oil Deregulation Law), creating legal uncertainty that deters private supply investment at precisely the wrong moment.",
  },
  {
    id: 3,
    title: "Government takeover under Section 14E",
    reason:
      "Legally available but should remain a deterrent only. Oil companies are cooperating. Activating 14E signals willingness to override property rights — lasting FDI damage.",
  },
  {
    id: 4,
    title: "Simultaneous removal of both excise tax and VAT",
    reason:
      'Economic planning secretary warned of "triple whammy": budget deficit + reduced spending + GDP contraction. Fiscal interventions must be sequenced and reversible.',
  },
];
