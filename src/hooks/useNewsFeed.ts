"use client";

import { useState, useEffect, useCallback } from "react";
import { fallbackNewsEvents } from "@/data/news-events";
import type { NewsEvent } from "@/data/types";

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useNewsFeed() {
  const [events, setEvents] = useState<NewsEvent[]>(fallbackNewsEvents);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchNews = useCallback(() => {
    fetch("/api/news")
      .then((r) => (r.ok ? r.json() : fallbackNewsEvents))
      .then((data: NewsEvent[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setEvents(data);
          setIsLive(true);
          setLastUpdated(new Date());
        }
      })
      .catch(() => {
        // Keep static fallback — section never breaks
      });
  }, []);

  useEffect(() => {
    fetchNews();
    const id = setInterval(fetchNews, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchNews]);

  return { events, isLive, lastUpdated };
}
