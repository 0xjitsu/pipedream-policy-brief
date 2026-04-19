"use client";

import { useCallback, useEffect, useState } from "react";
import type { DailySnapshot } from "@/data/types";

interface UseDailyDataState {
  snapshot: DailySnapshot | null;
  isLoading: boolean;
  isStale: boolean;         // true if generatedAt > 36h old
  lastUpdated: Date | null;
}

const POLL_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const STALE_THRESHOLD_MS = 36 * 60 * 60 * 1000; // 36 hours

/**
 * Client hook that reads the daily snapshot from /api/daily.
 * Polls hourly since the cron only runs once per day.
 * Preserves the previous snapshot on fetch errors — UI can show stale state.
 */
export function useDailyData(): UseDailyDataState {
  const [snapshot, setSnapshot] = useState<DailySnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSnapshot = useCallback(() => {
    fetch("/api/daily")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: DailySnapshot | null) => {
        if (data && data.snapshotDate) setSnapshot(data);
      })
      .catch(() => {
        /* Keep previous value — stale banner surfaces the problem */
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchSnapshot();
    const id = setInterval(fetchSnapshot, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchSnapshot]);

  const lastUpdated = snapshot?.generatedAt
    ? new Date(snapshot.generatedAt)
    : null;
  const isStale = lastUpdated
    ? Date.now() - lastUpdated.getTime() > STALE_THRESHOLD_MS
    : false;

  return { snapshot, isLoading, isStale, lastUpdated };
}
