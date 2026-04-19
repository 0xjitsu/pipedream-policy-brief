"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { MetricCard } from "@/components/ui/MetricCard";
import { SupplyChart } from "@/components/charts/SupplyChart";
import { GdpInflationChart } from "@/components/charts/GdpInflationChart";
import { AseanComparisonChart } from "@/components/charts/AseanComparisonChart";
import { metrics, senateFindings, senateVerdict } from "@/data/crisis-overview";
import { SectionCTA } from "@/components/ui/SectionCTA";
import { useMarketData } from "@/hooks/useMarketData";
import { useDailyData } from "@/hooks/useDailyData";
import { staggerContainer, fadeInUp } from "@/lib/motion";
import type { MetricCardData } from "@/data/types";

const situationDate = new Date().toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function CrisisOverview() {
  const { oilPrice, pesoRate, lastUpdated } = useMarketData();
  const { snapshot, lastUpdated: dailyTs } = useDailyData();

  const liveMetrics: MetricCardData[] = useMemo(() => {
    return metrics.map((m) => {
      // ─── Live tier (market data polled every 10min) ───
      if (m.label === "Crude Oil" && oilPrice) {
        return {
          ...m,
          value: `$${oilPrice.value}/bbl`,
          delta: oilPrice.delta || m.delta,
          deltaLabel: `via ${oilPrice.source}`,
          sourceUrl: oilPrice.sourceUrl,
          tier: "live" as const,
          tierTimestamp: lastUpdated ?? undefined,
        };
      }
      if (m.label === "Peso Rate" && pesoRate) {
        return {
          ...m,
          value: `₱${pesoRate.value}/$1`,
          delta: pesoRate.delta || m.delta,
          deltaLabel: `via ${pesoRate.source}`,
          sourceUrl: pesoRate.sourceUrl,
          tier: "live" as const,
          tierTimestamp: lastUpdated ?? undefined,
        };
      }

      // ─── Daily tier (Supabase snapshot, refreshed via Vercel Cron) ───
      if (m.label === "Diesel Pump Price" && snapshot?.pumpPrice) {
        return {
          ...m,
          value: `₱${snapshot.pumpPrice.value}/L`,
          delta: snapshot.pumpPrice.delta || m.delta,
          deltaLabel: `via ${snapshot.pumpPrice.source}`,
          sourceUrl: snapshot.pumpPrice.sourceUrl,
          tier: "daily" as const,
          tierTimestamp: dailyTs ?? undefined,
        };
      }
      if (m.label === "Stations Closed" && snapshot?.stations) {
        const pct = ((snapshot.stations.closed / snapshot.stations.total) * 100).toFixed(2);
        return {
          ...m,
          value: snapshot.stations.closed.toLocaleString(),
          delta: `${pct}%`,
          deltaLabel: `of ${snapshot.stations.total.toLocaleString()} total`,
          tier: "daily" as const,
          tierTimestamp: dailyTs ?? undefined,
        };
      }
      if (m.label === "Days of Supply" && snapshot?.supplyDays) {
        const d = snapshot.supplyDays.delta;
        return {
          ...m,
          value: `~${snapshot.supplyDays.value}`,
          gaugeValue: snapshot.supplyDays.value,
          delta: d !== 0 ? `${d > 0 ? "+" : ""}${d}` : m.delta,
          deltaLabel: snapshot.supplyDays.basis,
          tier: "daily" as const,
          tierTimestamp: dailyTs ?? undefined,
        };
      }

      // Fallback: static values from crisis-overview.ts, tagged daily (will
      // flip to real data once the cron has run at least once).
      return { ...m, tier: "daily" as const };
    });
  }, [oilPrice, pesoRate, lastUpdated, snapshot, dailyTs]);

  return (
    <SectionWrapper id="crisis" title="Crisis Overview" icon="🚨" subtitle={`Philippine fuel supply emergency — ${situationDate}`}>
      {/* Metric cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8"
      >
        {liveMetrics.map((m) => (
          <MetricCard key={m.label} data={m} />
        ))}
      </motion.div>

      {/* Main chart — supply depletion */}
      <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-6">
        <SupplyChart />
      </motion.div>

      {/* Two-column: GDP/Inflation + ASEAN comparison */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <GdpInflationChart currentOilPrice={oilPrice?.value} />
        </motion.div>
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <AseanComparisonChart />
        </motion.div>
      </div>

      {/* Senate Hearing Key Findings */}
      <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <h3 className="font-serif text-lg font-semibold text-white mb-4">Senate Hearing Key Findings</h3>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-3"
        >
          {senateFindings.map((f, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className={`glass p-4 flex items-start gap-3 ${f.critical ? "border-l-2 border-l-critical" : ""}`}
            >
              <span className="font-mono text-xs text-white-50 shrink-0 mt-0.5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white-90 leading-relaxed">{f.text}</p>
                <div className="flex items-center gap-2 mt-2">
                  <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-white-50 hover:text-white-70 underline underline-offset-2 transition-colors">{f.source}</a>
                  {f.critical && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-critical-bg text-critical border border-critical/30">
                      Action needed
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Senate verdict */}
      <motion.blockquote
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-8 glass border-l-3 border-l-critical p-5"
      >
        <p className="text-base font-serif italic text-white-70 leading-relaxed">
          &ldquo;{senateVerdict.text}&rdquo;
        </p>
        <footer className="mt-3 text-xs text-white-40">
          &mdash;{" "}
          <a
            href={senateVerdict.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 decoration-white-20 hover:text-white-50 transition-colors"
          >
            {senateVerdict.resolution}
          </a>
        </footer>
      </motion.blockquote>

      <SectionCTA text="See what this means for real Filipinos →" href="#impact" />
    </SectionWrapper>
  );
}
