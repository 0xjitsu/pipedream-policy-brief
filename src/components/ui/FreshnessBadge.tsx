"use client";

import { useEffect, useState } from "react";
import {
  FRESHNESS_TIERS,
  formatAbsolute,
  formatRelative,
  isStale,
  type FreshnessTier,
} from "@/data/freshness";

interface FreshnessBadgeProps {
  tier: FreshnessTier;
  timestamp?: Date | string | null;
  /** Size variant. Default "md". */
  size?: "sm" | "md" | "lg";
  /** Show the tier label (e.g. "Live"). Default true. */
  showLabel?: boolean;
  /** Show the relative time (e.g. "2h ago"). Default true. */
  showTime?: boolean;
  /** Extra className passthrough */
  className?: string;
}

/**
 * Reusable badge showing data freshness tier + last-updated timestamp.
 *
 * Behavior:
 * - Animated dot (respects prefers-reduced-motion)
 * - Stale state: red dot + "Stale" text when timestamp is beyond tier's threshold
 * - Static tier: no dot animation, shows "Published [date]"
 * - Updates relative time every 30s so "2m ago" stays accurate
 */
export function FreshnessBadge({
  tier,
  timestamp,
  size = "md",
  showLabel = true,
  showTime = true,
  className = "",
}: FreshnessBadgeProps) {
  const meta = FRESHNESS_TIERS[tier];
  const stale = isStale(timestamp ?? null, tier);

  // Re-render every 30s to keep relative time fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    if (tier === "static") return;
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [tier]);

  const sizeConfig = {
    sm: { dot: "w-1.5 h-1.5", text: "text-[10px]", gap: "gap-1.5" },
    md: { dot: "w-2 h-2", text: "text-xs", gap: "gap-2" },
    lg: { dot: "w-2.5 h-2.5", text: "text-sm", gap: "gap-2.5" },
  }[size];

  const dotColor = stale ? "bg-critical" : meta.dotClass;
  const textColor = stale ? "text-critical" : meta.textClass;
  const shouldPulse = tier !== "static" && !stale;

  const relative = formatRelative(timestamp ?? null);
  const absolute = formatAbsolute(timestamp ?? null);
  const titleText = stale
    ? `Stale — last update ${absolute}. Expected refresh every ${meta.cadence.toLowerCase()}.`
    : `${meta.label} data · Last update: ${absolute}`;

  const prefix = tier === "static" ? "Published" : stale ? "Stale" : meta.label;

  return (
    <span
      className={`inline-flex items-center ${sizeConfig.gap} ${sizeConfig.text} ${className}`}
      title={titleText}
      role="status"
      aria-label={titleText}
    >
      <span className={`relative inline-flex ${sizeConfig.dot}`} aria-hidden="true">
        {shouldPulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-60 motion-safe:animate-ping`}
          />
        )}
        <span className={`relative inline-flex ${sizeConfig.dot} rounded-full ${dotColor}`} />
      </span>
      {showLabel && (
        <span className={`font-medium ${textColor}`}>{prefix}</span>
      )}
      {showTime && timestamp && (
        <span className="text-white-60">· {relative}</span>
      )}
    </span>
  );
}
