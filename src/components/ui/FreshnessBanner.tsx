"use client";

import { useMarketData } from "@/hooks/useMarketData";
import { useNewsFeed } from "@/hooks/useNewsFeed";
import { FRESHNESS_TIERS, formatAbsolute, formatRelative } from "@/data/freshness";
import { FreshnessLegend } from "./FreshnessLegend";

/**
 * Global freshness banner — renders below the Ticker in the nav area.
 *
 * Shows the most recent timestamp across all live data sources + a compact
 * tier legend (Live · Daily · Static) and an info button that opens the full
 * FreshnessLegend modal.
 *
 * Rendered once per page. Reads existing hooks (no new fetches) — the
 * timestamp is the max of market + news last-updated.
 */
export function FreshnessBanner() {
  const { lastUpdated: marketTs } = useMarketData();
  const { lastUpdated: newsTs } = useNewsFeed();

  // Most recent of all available timestamps
  const latest = [marketTs, newsTs]
    .filter((t): t is Date => t instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return (
    <div
      className="fixed top-[82px] left-0 right-0 z-30 border-b border-white-05 bg-navy/80 backdrop-blur-sm"
      aria-label="Data freshness status"
    >
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-1.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] min-w-0">
          <span className="shrink-0 inline-flex w-1.5 h-1.5 rounded-full bg-strategic motion-safe:animate-pulse" aria-hidden="true" />
          <span className="text-white-60 shrink-0">Data as of</span>
          <span
            className="font-mono text-white-90 truncate"
            title={latest ? formatAbsolute(latest) : undefined}
          >
            {latest ? formatAbsolute(latest) : "Loading…"}
          </span>
          {latest && (
            <span className="text-white-50 hidden sm:inline shrink-0">
              · {formatRelative(latest)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 text-[10px]">
            {(["live", "daily", "static"] as const).map((tierId) => {
              const tier = FRESHNESS_TIERS[tierId];
              return (
                <span
                  key={tierId}
                  className="inline-flex items-center gap-1"
                  title={`${tier.label}: ${tier.cadence}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${tier.dotClass}`}
                    aria-hidden="true"
                  />
                  <span className={tier.textClass}>{tier.label}</span>
                </span>
              );
            })}
          </div>
          <FreshnessLegend />
        </div>
      </div>
    </div>
  );
}
