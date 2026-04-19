import { getSupabase } from "@/lib/supabase";
import type { DailySnapshot } from "@/data/types";

/**
 * Reads the most recent snapshot. Returns null if the table is empty.
 */
export async function readLatestSnapshot(): Promise<DailySnapshot | null> {
  const db = getSupabase();
  const { data, error } = await db
    .from("daily_snapshot")
    .select("*")
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    snapshotDate: data.snapshot_date,
    generatedAt: data.generated_at,
    pumpPrice: data.pump_price,
    aseanPrices: data.asean_prices ?? [],
    stations: data.stations,
    supplyDays: data.supply_days,
    narrative: data.narrative,
  };
}
