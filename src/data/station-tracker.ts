import { allStations, statusCounts } from "./all-stations";

export const stations = allStations;

export const trackerStats = {
  totalTracked: allStations.length,
  outOfStock: statusCounts["out-of-stock"],
  lowSupply: statusCounts["low-supply"],
  closed: statusCounts["closed"],
  operational: statusCounts["operational"],
  lastUpdated: "March 31, 2026",
  crowdSourceEnabled: false,
};
