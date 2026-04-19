"use client";

import { useState, useEffect, useCallback } from "react";
import { useDeferredMount } from "./useDeferredMount";

interface MarketDataField {
  value: number;
  delta: string;
  source: string;
  sourceUrl: string;
  updatedAt: string;
}

interface MarketDataState {
  oilPrice: MarketDataField | null;
  pesoRate: MarketDataField | null;
  isLive: boolean;
  lastUpdated: Date | null;
}

const POLL_INTERVAL = 10 * 60 * 1000; // 10 minutes

export function useMarketData(): MarketDataState {
  const [oilPrice, setOilPrice] = useState<MarketDataField | null>(null);
  const [pesoRate, setPesoRate] = useState<MarketDataField | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMarket = useCallback(() => {
    fetch("/api/market")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.oilPrice) {
          setOilPrice(data.oilPrice);
          setIsLive(true);
          setLastUpdated(new Date());
        }
        if (data.pesoRate) {
          setPesoRate(data.pesoRate);
          setIsLive(true);
          setLastUpdated(new Date());
        }
      })
      .catch(() => {
        // Keep null — static fallback stays in place
      });
  }, []);

  useDeferredMount(() => {
    fetchMarket();
  }, [fetchMarket]);

  useEffect(() => {
    const id = setInterval(fetchMarket, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchMarket]);

  return { oilPrice, pesoRate, isLive, lastUpdated };
}
