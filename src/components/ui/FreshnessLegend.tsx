"use client";

import { useId } from "react";
import { FRESHNESS_TIERS, type FreshnessTier } from "@/data/freshness";

const TIER_ORDER: FreshnessTier[] = ["live", "daily", "weekly", "static"];

/**
 * Modal explaining the four freshness tiers.
 * Uses HTML popover API (same pattern as MetricTooltip).
 *
 * Renders an info button + popover panel. The trigger's visual style is
 * intentionally subtle so it fits inline with the FreshnessBanner.
 */
export function FreshnessLegend() {
  const popoverId = useId();

  return (
    <>
      <button
        type="button"
        popoverTarget={popoverId}
        aria-label="View data freshness legend"
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white-05 text-white-60 text-[11px] hover:bg-white-10 hover:text-white-90 transition-colors"
      >
        ?
      </button>

      <div
        id={popoverId}
        popover="auto"
        className="glass max-w-md p-5 m-auto text-sm [&:not(:popover-open)]:hidden"
        style={{ inset: "auto" }}
      >
        <h3 className="font-serif text-base font-bold text-white mb-1">
          Data Freshness
        </h3>
        <p className="text-xs text-white-60 leading-relaxed mb-4">
          This brief revolves with current events but is rooted in fundamentals.
          Here&apos;s how often each type of data refreshes.
        </p>

        <div className="space-y-3">
          {TIER_ORDER.map((tierId) => {
            const tier = FRESHNESS_TIERS[tierId];
            return (
              <div key={tierId} className="flex items-start gap-3">
                <span
                  className={`mt-1 shrink-0 w-2 h-2 rounded-full ${tier.dotClass}`}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xs font-semibold ${tier.textClass}`}>
                      {tier.label}
                    </span>
                    <span className="text-[10px] font-mono text-white-60">
                      {tier.cadence}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-white-70 leading-relaxed">
                    {tier.description}
                  </p>
                  <p className="mt-1 text-[10px] text-white-60">
                    {tier.examples.join(" · ")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
