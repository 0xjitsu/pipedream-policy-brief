import { getSupabase } from "@/lib/supabase";
import type { DailySnapshot } from "@/data/types";

/**
 * Upserts today's snapshot row. Same date → overwrites.
 */
export async function writeSnapshot(snapshot: DailySnapshot): Promise<void> {
  const db = getSupabase();
  const { error } = await db.from("daily_snapshot").upsert(
    {
      snapshot_date: snapshot.snapshotDate,
      generated_at: snapshot.generatedAt,
      pump_price: snapshot.pumpPrice,
      asean_prices: snapshot.aseanPrices,
      stations: snapshot.stations,
      supply_days: snapshot.supplyDays,
      narrative: snapshot.narrative,
    },
    { onConflict: "snapshot_date" },
  );
  if (error) throw new Error(`writeSnapshot failed: ${error.message}`);
}
