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
    sourceUrl: "https://legacy.doe.gov.ph/downstream-oil/lfro-with-valid-coc-lfo",
  },
  {
    label: "Diesel Pump Price",
    value: "₱130+/L",
    delta: "+136%",
    deltaLabel: "from ₱55 pre-crisis",
    sourceUrl: "https://legacy.doe.gov.ph/downstream-oil/lfro-with-valid-coc-lfo",
  },
  {
    label: "Stations Closed",
    value: "425",
    delta: "2.93%",
    deltaLabel: "of 14,485 total",
    sourceUrl: "https://legacy.doe.gov.ph/downstream-oil/lfro-with-valid-coc-lfo",
  },
  {
    label: "Crude Oil",
    value: "$115+/bbl",
    delta: "+59%",
    deltaLabel: "from $72 pre-war",
    sourceUrl: "https://www.reuters.com/business/energy/",
  },
  {
    label: "Peso Rate",
    value: "₱60+/$1",
    delta: "Weakening",
    deltaLabel: "currency pressure",
    sourceUrl: "https://www.bsp.gov.ph/SitePages/Statistics/ExchangeRate.aspx",
  },
];

/** Compute a fractional x-axis index for "today" so the vertical marker
 *  lands precisely between weekly data points. Falls back to the last
 *  actual-data index if the current date is outside the label range. */
function computeTodayIndex(labels: string[]): { index: number; label: string } {
  const now = new Date();
  const year = now.getFullYear();

  // Parse "Mon DD" labels into Date objects (all in the current year)
  const dates = labels.map((l) => new Date(`${l}, ${year}`));

  // Format today's date as "Mon DD" (e.g. "Mar 31")
  const todayLabel = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  // If today is before the first label, clamp to 0
  if (now <= dates[0]) return { index: 0, label: todayLabel };

  // If today is after the last label, clamp to last index
  if (now >= dates[dates.length - 1])
    return { index: dates.length - 1, label: todayLabel };

  // Find the two labels that bracket today and interpolate
  for (let i = 0; i < dates.length - 1; i++) {
    if (now >= dates[i] && now <= dates[i + 1]) {
      const span = dates[i + 1].getTime() - dates[i].getTime();
      const elapsed = now.getTime() - dates[i].getTime();
      return { index: i + elapsed / span, label: todayLabel };
    }
  }

  return { index: 0, label: todayLabel };
}

const _supplyLabels = [
  "Feb 28", "Mar 7", "Mar 14", "Mar 20", "Mar 27",
  "Apr 3", "Apr 10", "Apr 17", "Apr 24", "May 1",
];

const _today = computeTodayIndex(_supplyLabels);

export const supplyDepletion = {
  labels: _supplyLabels,
  actual: [57, 53, 49, 45, 42, null, null, null, null, null],
  projected: [null, null, null, null, 42, 38, 34, 30, 26, 22],
  minimum: 15,
  todayIndex: _today.index,
  todayLabel: `Today (${_today.label})`,
};

export const gdpInflation = {
  labels: ["$72\n(pre-war)", "$80–85", "$100", "$115\n(now)", "$130", "$150", "$200"],
  gdp: [5.2, 4.5, 3.7, 3.5, 3.4, 2.8, 2.5],
  inflation: [2.8, 3.5, 4.2, 5.0, 6.5, 8.0, 8.6],
  crossoverIndex: 3,
};

// Oil price thresholds matching gdpInflation.labels x-axis
export const OIL_PRICE_THRESHOLDS = [72, 82.5, 100, 115, 130, 150, 200];

/** Compute fractional x-axis index for a given oil price */
export function computeOilPriceIndex(currentPrice: number): number {
  const t = OIL_PRICE_THRESHOLDS;
  if (currentPrice <= t[0]) return 0;
  if (currentPrice >= t[t.length - 1]) return t.length - 1;
  for (let i = 0; i < t.length - 1; i++) {
    if (currentPrice >= t[i] && currentPrice <= t[i + 1]) {
      return i + (currentPrice - t[i]) / (t[i + 1] - t[i]);
    }
  }
  return 3; // fallback
}

export const aseanComparison = {
  countries: ["Philippines", "Singapore", "Thailand", "Malaysia", "Vietnam"],
  diesel: [130, 153, 65, 52, 58],
  gasoline: [100, 133, 60, 48, 55],
};

export const senateFindings: SenateFindings[] = [
  { text: "Supply beyond April is unconfirmed", source: "Chevron, PIP, IPPCA", sourceUrl: "https://www.philstar.com/business/2026/03/27/2517009/philippines-fuel-supply-guaranteed-only-until-may-oil-firms-say", critical: true },
  { text: "Cargo premiums surged 120%+; product premiums at $40 (was <$1)", source: "Shell, Chevron", sourceUrl: "https://tribune.net.ph/2026/03/27/pbbm-big-3-clash-over-oil-inventory", critical: true },
  { text: "Alternative supply at lower prices may exist (needs DOE verification)", source: "Sen. Marcoleta", sourceUrl: "https://www.gmanetwork.com/news/topstories/nation/981531/doe-faces-criticism-from-marcoleta-over-lax-fuel-price-monitoring/story/", critical: true },
  { text: "Excise tax suspension implementation too slow (earliest April 12–13)", source: "DOF", sourceUrl: "https://newsinfo.inquirer.net/2202073/dof-price-cuts-due-to-fuel-tax-law-felt-by-mid-april", critical: true },
  { text: "PNOC secured initial supply: 150KB arrived, 300KB more in April", source: "PNOC", sourceUrl: "https://www.bworldonline.com/the-nation/2026/03/29/739486/philippines-to-take-delivery-of-1-04m-barrels-of-diesel-to-boost-fuel-supply/", critical: false },
  { text: "Regional refineries declaring force majeure and export bans", source: "Shell, Petron", sourceUrl: "https://tribune.net.ph/2026/03/27/pbbm-big-3-clash-over-oil-inventory", critical: true },
  { text: "Replacement cost methodology drives current pump prices", source: "Petron, Chevron", sourceUrl: "https://www.philstar.com/headlines/2026/03/28/2517316/senators-hold-abusive-oil-companies-accountable", critical: true },
  { text: "DOE issued show-cause orders for suspected profiteering", source: "DOE", sourceUrl: "https://doe.gov.ph/articles/group/liquid-fuels?category=Oil+Monitor&display_type=Card", critical: false },
];
