import type { RegionStation, FuelAvailability, IslandGroup } from "./types";

export const stationsByRegion: RegionStation[] = [
  { region: "CALABARZON", count: 68, island: "luzon" },
  { region: "Western Visayas", count: 63, island: "visayas" },
  { region: "NCR", count: 50, island: "luzon" },
  { region: "Central Luzon", count: 39, island: "luzon" },
  { region: "Northern Mindanao", count: 35, island: "mindanao" },
  { region: "Davao", count: 31, island: "mindanao" },
  { region: "Central Visayas", count: 29, island: "visayas" },
  { region: "SOCCSKSARGEN", count: 28, island: "mindanao" },
  { region: "Ilocos", count: 27, island: "luzon" },
  { region: "Cagayan Valley", count: 15, island: "luzon" },
  { region: "Bicol", count: 13, island: "luzon" },
  { region: "Eastern Visayas", count: 13, island: "visayas" },
  { region: "Caraga", count: 11, island: "mindanao" },
  { region: "MIMAROPA", count: 10, island: "luzon" },
  { region: "Zamboanga", count: 9, island: "mindanao" },
  { region: "ARMM", count: 1, island: "mindanao" },
];

export const fuelAvailability: FuelAvailability[] = [
  { name: "Diesel", brandName: "Exceed Diesel", available: 420, total: 442 },
  { name: "Gasoline 91 (Regular)", brandName: "Extreme U", available: 418, total: 442 },
  { name: "Gasoline 95 (Mid-grade)", brandName: "Extreme 95", available: 342, total: 442 },
  { name: "Gasoline 97 (Premium)", brandName: "Extreme 97", available: 86, total: 442 },
];

export const islandGroups: IslandGroup[] = [
  { name: "Luzon", stations: 237, percentage: "54%", regions: "NCR, CALABARZON, Central Luzon, Ilocos, Cagayan Valley, Bicol, MIMAROPA" },
  { name: "Visayas", stations: 104, percentage: "23%", regions: "Western Visayas, Central Visayas, Eastern Visayas" },
  { name: "Mindanao", stations: 101, percentage: "23%", regions: "Northern Mindanao, Davao, SOCCSKSARGEN, Caraga, Zamboanga, ARMM" },
];

export const infrastructureSource = {
  label: "DOE Downstream Oil Monitoring",
  url: "https://www.doe.gov.ph/downstream-oil",
};

export const infrastructureCallout =
  "450+ PriceLOCQ-equipped stations across 16 regions represent proven, operational distribution infrastructure. The PriceLOCQ for Business platform already provides verified driver identity, parameterized fuel allocation, real-time tracking, and price protection through forward purchasing. This existing infrastructure can be extended to stations of other fuel brands through API integration, creating a consolidated national fuel distribution network supporting all three government channels.";
