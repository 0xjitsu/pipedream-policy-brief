import type { MetricCardData, SenateFindings } from "./types";

export const metrics: MetricCardData[] = [
  {
    label: "Days of Supply",
    value: "~45",
    delta: "–12",
    deltaLabel: "from 57 days",
    type: "gauge",
    gaugeMax: 65,
    gaugeValue: 45,
    gaugeColor: "#F59E0B",
  },
  {
    label: "Diesel Pump Price",
    value: "₱130+/L",
    delta: "+136%",
    deltaLabel: "from ₱55 pre-crisis",
  },
  {
    label: "Stations Closed",
    value: "425",
    delta: "2.93%",
    deltaLabel: "of 14,485 total",
  },
  {
    label: "Crude Oil",
    value: "$115+/bbl",
    delta: "+59%",
    deltaLabel: "from $72 pre-war",
  },
  {
    label: "Peso Rate",
    value: "₱60+/$1",
    delta: "Weakening",
    deltaLabel: "currency pressure",
  },
];

export const supplyDepletion = {
  labels: [
    "Feb 28", "Mar 7", "Mar 14", "Mar 20", "Mar 27",
    "Apr 3", "Apr 10", "Apr 17", "Apr 24", "May 1",
  ],
  actual: [57, 53, 49, 45, 42, null, null, null, null, null],
  projected: [null, null, null, null, 42, 38, 34, 30, 26, 22],
  minimum: 15,
  todayIndex: 4, // Mar 27 is closest to Mar 30
};

export const gdpInflation = {
  labels: ["$72\n(pre-war)", "$80–85", "$100", "$115\n(now)", "$130", "$150", "$200"],
  gdp: [5.2, 4.5, 3.7, 3.5, 3.4, 2.8, 2.5],
  inflation: [2.8, 3.5, 4.2, 5.0, 6.5, 8.0, 8.6],
  crossoverIndex: 3,
};

export const aseanComparison = {
  countries: ["Philippines", "Singapore", "Thailand", "Malaysia", "Vietnam"],
  diesel: [130, 153, 65, 52, 58],
  gasoline: [100, 133, 60, 48, 55],
};

export const senateFindings: SenateFindings[] = [
  { text: "Supply beyond April is unconfirmed", source: "Chevron, PIP, IPPCA", critical: true },
  { text: "Cargo premiums surged 120%+; product premiums at $40 (was <$1)", source: "Shell, Chevron", critical: true },
  { text: "Alternative supply at lower prices may exist (needs DOE verification)", source: "Sen. Marcoleta", critical: true },
  { text: "Excise tax suspension implementation too slow (earliest April 12–13)", source: "DOF", critical: true },
  { text: "PNOC secured initial supply: 150KB arrived, 300KB more in April", source: "PNOC", critical: false },
  { text: "Regional refineries declaring force majeure and export bans", source: "Shell, Petron", critical: true },
  { text: "Replacement cost methodology drives current pump prices", source: "Petron, Chevron", critical: false },
  { text: "DOE issued show-cause orders for suspected profiteering", source: "DOE", critical: false },
];
