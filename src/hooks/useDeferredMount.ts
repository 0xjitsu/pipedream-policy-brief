"use client";

import { useEffect } from "react";

/**
 * Runs `fn` on the next idle frame (or 100ms fallback). Use for
 * non-critical initial fetches — helps TTI by letting the browser
 * paint and hydrate first.
 */
export function useDeferredMount(fn: () => void, deps: React.DependencyList) {
  useEffect(() => {
    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const w = window as IdleWindow;
    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(fn, { timeout: 2000 });
    } else {
      timeoutId = setTimeout(fn, 100);
    }

    return () => {
      if (idleId != null && typeof w.cancelIdleCallback === "function") {
        w.cancelIdleCallback(idleId);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
