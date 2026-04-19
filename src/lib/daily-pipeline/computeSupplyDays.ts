import type { SupplyDaysComputation } from "@/data/types";
import { supplyDepletion } from "@/data/crisis-overview";

/**
 * Computes days-of-supply for today by extrapolating the actual-data trend
 * forward from the last known weekly data points. Uses a rolling window of
 * the last 4 points to estimate weekly drop, then subtracts the pro-rated
 * daily drop for elapsed days since the last known point.
 */
export function computeSupplyDays(
  previousValue: number | null,
): SupplyDaysComputation {
  const actual = supplyDepletion.actual.filter(
    (v): v is number => typeof v === "number",
  );
  if (actual.length < 2) {
    return {
      value: actual[actual.length - 1] ?? 45,
      delta: 0,
      basis: "Fallback — insufficient trend data",
    };
  }

  const window = actual.slice(-4);
  const drops: number[] = [];
  for (let i = 1; i < window.length; i++) {
    drops.push(window[i - 1] - window[i]);
  }
  const avgWeeklyDrop = drops.reduce((a, b) => a + b, 0) / drops.length;

  // Weekly cadence → ~3.5 days on average since the last known point
  const daysSinceLast = 3.5;
  const dailyDrop = avgWeeklyDrop / 7;

  const last = window[window.length - 1];
  const value = Math.max(0, Math.round(last - dailyDrop * daysSinceLast));

  const delta =
    previousValue != null && Number.isFinite(previousValue)
      ? value - previousValue
      : 0;

  return {
    value,
    delta,
    basis: `Extrapolated from last ${window.length} weekly data points (avg drop ${avgWeeklyDrop.toFixed(1)} days/week)`,
  };
}
