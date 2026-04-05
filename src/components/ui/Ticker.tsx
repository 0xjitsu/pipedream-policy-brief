"use client";

import { useMarketData } from "@/hooks/useMarketData";
import { useNewsFeed } from "@/hooks/useNewsFeed";
import type { NewsSeverity } from "@/data/types";

const SEVERITY_DOT: Record<NewsSeverity, string> = {
  red: "bg-[#EF4444]",
  yellow: "bg-[#F59E0B]",
  green: "bg-[#10B981]",
};

type TickerItem =
  | { kind: "price"; name: string; value: string; delta?: string }
  | { kind: "headline"; text: string; severity: NewsSeverity; source: string; sourceUrl: string };

export function Ticker() {
  const { oilPrice, pesoRate } = useMarketData();
  const { events } = useNewsFeed();

  // Build price items from market data
  const priceItems: TickerItem[] = [];

  if (oilPrice) {
    priceItems.push({
      kind: "price",
      name: "Brent Crude",
      value: `${oilPrice.value.toFixed(2)} $/bbl`,
      delta: oilPrice.delta || undefined,
    });
  }

  if (pesoRate) {
    priceItems.push({
      kind: "price",
      name: "USD/PHP",
      value: `\u20B1${pesoRate.value.toFixed(2)}`,
      delta: pesoRate.delta || undefined,
    });
  }

  // Add static key metrics
  priceItems.push(
    { kind: "price", name: "Diesel", value: "\u20B1130+/L" },
    { kind: "price", name: "Supply", value: "45 days" },
  );

  // Build headline items from news feed
  const headlineItems: TickerItem[] = events.slice(0, 6).map((e) => ({
    kind: "headline",
    text: e.headline.length > 65 ? e.headline.slice(0, 62) + "\u2026" : e.headline,
    severity: e.severity,
    source: e.source,
    sourceUrl: e.sourceUrl,
  }));

  // Interleave: 2 prices, 1 headline pattern
  const merged: TickerItem[] = [];
  let pi = 0;
  let hi = 0;
  while (pi < priceItems.length || hi < headlineItems.length) {
    if (pi < priceItems.length) merged.push(priceItems[pi++]);
    if (pi < priceItems.length) merged.push(priceItems[pi++]);
    if (hi < headlineItems.length) merged.push(headlineItems[hi++]);
  }

  // Duplicate for seamless infinite loop
  const tickerContent = [...merged, ...merged];

  return (
    <div className="overflow-hidden border-b border-white-08 bg-navy/95 backdrop-blur-sm ticker-mask">
      <div className="flex ticker-animate whitespace-nowrap py-1.5">
        {tickerContent.map((item, i) => (
          <span key={i} className="mx-3 inline-flex items-center gap-1.5 text-[10px] font-mono">
            {item.kind === "price" ? (
              <>
                <span className="text-white-50">{item.name}</span>
                <span className="text-white font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {item.value}
                </span>
                {item.delta && (
                  <span className={`font-semibold ${item.delta.startsWith("+") ? "text-[#EF4444]" : "text-[#10B981]"}`}>
                    {item.delta.startsWith("+") ? "\u25B2" : "\u25BC"} {item.delta}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="text-white-20">{"\u00B7"}</span>
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${SEVERITY_DOT[item.severity]}`} />
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white-50 hover:text-white transition-colors"
                >
                  {item.text}
                </a>
                <span className="text-white-20">{item.source}</span>
                <span className="text-white-20">{"\u00B7"}</span>
              </>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
