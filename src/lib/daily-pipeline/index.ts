import type { DailySnapshot } from "@/data/types";
import { fetchPumpPrice } from "./fetchPumpPrice";
import { fetchAseanPrices } from "./fetchAseanPrices";
import { fetchStationSnapshot } from "./fetchStationSnapshot";
import { computeSupplyDays } from "./computeSupplyDays";
import { readLatestSnapshot } from "./readSnapshot";
import { writeSnapshot } from "./writeSnapshot";

/**
 * Runs all independent fetchers in parallel, computes derived values,
 * and upserts the snapshot. Narrative synthesis is folded in by Task 19.
 */
export async function runDailyPipeline(): Promise<DailySnapshot> {
  const previous = await readLatestSnapshot();

  const [pumpPrice, aseanPrices, stations] = await Promise.all([
    fetchPumpPrice(),
    fetchAseanPrices(),
    fetchStationSnapshot(),
  ]);

  // Compute WoW delta on pump price using previous snapshot
  if (pumpPrice && previous?.pumpPrice) {
    const prev = previous.pumpPrice.value;
    if (prev > 0) {
      const pct = ((pumpPrice.value - prev) / prev) * 100;
      const sign = pct >= 0 ? "+" : "";
      pumpPrice.delta = `${sign}${pct.toFixed(1)}% WoW`;
    }
  }

  const supplyDays = computeSupplyDays(previous?.supplyDays?.value ?? null);

  const snapshot: DailySnapshot = {
    snapshotDate: new Date().toISOString().slice(0, 10),
    generatedAt: new Date().toISOString(),
    pumpPrice,
    aseanPrices,
    stations,
    supplyDays,
    narrative: null,
  };

  await writeSnapshot(snapshot);
  return snapshot;
}
