import type { ScenarioData } from "./types";

export const scenarios: ScenarioData[] = [
  {
    price: "$80–85/bbl",
    label: "Base case",
    gdp: "~4.5%",
    inflation: "Sub-4%",
    severity: 1,
    color: "#10B981",
  },
  {
    price: "$100/bbl",
    label: "Sustained",
    gdp: "~3.7%",
    inflation: "Above 4%",
    severity: 2,
    color: "#F59E0B",
  },
  {
    price: "$130/bbl",
    label: "Sustained",
    gdp: "Below 3.4%",
    inflation: "6–8%",
    severity: 3,
    color: "#F97316",
  },
  {
    price: "$150/bbl",
    label: "Wood Mackenzie",
    gdp: "Recession risk",
    inflation: "8%+",
    severity: 4,
    color: "#EF4444",
  },
  {
    price: "$200/bbl",
    label: "Worst case",
    gdp: "GDP 2.5–4%",
    inflation: "8.6%+ (NEDA)",
    severity: 5,
    color: "#991B1B",
  },
];

export const scenarioContext =
  "Oil price scenarios range from a manageable base case ($80–85/bbl) to catastrophic worst case ($200/bbl). At current levels (~$115/bbl), the Philippines is already past the crossover point where inflation exceeds GDP growth — the definition of stagflation risk. Each scenario demands a different policy response intensity.";
