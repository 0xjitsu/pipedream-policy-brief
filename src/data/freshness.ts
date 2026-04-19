/**
 * Data Freshness Taxonomy
 *
 * Four tiers of data currency, each with a visual treatment.
 * The brief "revolves with current things happening but is rooted in fundamentals" —
 * this module defines which category each piece of data belongs to.
 */

export type FreshnessTier = "live" | "daily" | "weekly" | "static";

export interface FreshnessTierMeta {
  id: FreshnessTier;
  label: string;
  cadence: string;
  color: string; // CSS color value
  dotClass: string; // Tailwind bg class for the dot
  textClass: string; // Tailwind text class for label
  description: string;
  examples: string[];
}

export const FRESHNESS_TIERS: Record<FreshnessTier, FreshnessTierMeta> = {
  live: {
    id: "live",
    label: "Live",
    cadence: "Every 5–10 min",
    color: "#10B981",
    dotClass: "bg-strategic",
    textClass: "text-strategic",
    description:
      "Market data and news polled continuously from public APIs. Refreshes while you read.",
    examples: ["Brent crude", "USD/PHP rate", "Live news feed"],
  },
  daily: {
    id: "daily",
    label: "Daily",
    cadence: "Every 24h · 06:00 PHT",
    color: "#38BDF8",
    dotClass: "bg-[#38BDF8]",
    textClass: "text-[#38BDF8]",
    description:
      "Factual snapshots refreshed once per day via scheduled scrape + agent synthesis.",
    examples: [
      "PH pump price",
      "ASEAN price comparison",
      "Station status snapshot",
      "Days of supply (computed)",
      "Today's narrative (AI)",
    ],
  },
  weekly: {
    id: "weekly",
    label: "Weekly",
    cadence: "Every Monday · 06:00 PHT",
    color: "#F59E0B",
    dotClass: "bg-important",
    textClass: "text-important",
    description:
      "Institutional reports and legislative statuses refreshed weekly.",
    examples: [
      "DOE LFO station report",
      "Legislative tracker statuses",
    ],
  },
  static: {
    id: "static",
    label: "Published",
    cadence: "Versioned manually",
    color: "rgba(255,255,255,0.7)",
    dotClass: "bg-white-40",
    textClass: "text-white-70",
    description:
      "Fundamentals — analytical frameworks that don't change with today's news. Versioned via commits.",
    examples: [
      "Policy pillars",
      "Distribution channels",
      "Economic scenarios",
      "Anti-recommendations",
      "Senate findings",
      "References",
    ],
  },
};

/**
 * Stale threshold per tier (in milliseconds).
 * If the last update is older than this, the badge turns red with a "Stale" warning.
 */
export const STALE_THRESHOLDS: Record<FreshnessTier, number> = {
  live: 30 * 60 * 1000, // 30 min
  daily: 36 * 60 * 60 * 1000, // 36 h
  weekly: 10 * 24 * 60 * 60 * 1000, // 10 days
  static: Infinity, // never stale — versioned content
};

/**
 * Format a timestamp as relative time (e.g. "2h ago", "just now").
 * Falls back to absolute date if > 7 days old.
 */
export function formatRelative(timestamp: Date | string | null): string {
  if (!timestamp) return "—";
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Format a timestamp as absolute PHT time for tooltip / hover.
 */
export function formatAbsolute(timestamp: Date | string | null): string {
  if (!timestamp) return "No timestamp";
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  return (
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " · " +
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }) +
    " PHT"
  );
}

/**
 * Determine if a given timestamp is stale for a given tier.
 */
export function isStale(timestamp: Date | string | null, tier: FreshnessTier): boolean {
  if (!timestamp || tier === "static") return false;
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const ageMs = Date.now() - date.getTime();
  return ageMs > STALE_THRESHOLDS[tier];
}
