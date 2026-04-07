"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { MetricCard } from "@/components/ui/MetricCard";
import { SupplyChart } from "@/components/charts/SupplyChart";
import { GdpInflationChart } from "@/components/charts/GdpInflationChart";
import { AseanComparisonChart } from "@/components/charts/AseanComparisonChart";
import { metrics, senateFindings, senateVerdict } from "@/data/crisis-overview";
import { useMarketData } from "@/hooks/useMarketData";
import { staggerContainer, fadeInUp } from "@/lib/motion";
import type { MetricCardData } from "@/data/types";

const situationDate = new Date().toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function CrisisOverview() {
  const { oilPrice, pesoRate } = useMarketData();

  const liveMetrics: MetricCardData[] = useMemo(() => {
    return metrics.map((m) => {
      if (m.label === "Crude Oil" && oilPrice) {
        return {
          ...m,
          value: `$${oilPrice.value}/bbl`,
          delta: oilPrice.delta || m.delta,
          deltaLabel: `via ${oilPrice.source}`,
          sourceUrl: oilPrice.sourceUrl,
          isLive: true,
        };
      }
      if (m.label === "Peso Rate" && pesoRate) {
        return {
          ...m,
          value: `₱${pesoRate.value}/$1`,
          delta: pesoRate.delta || m.delta,
          deltaLabel: `via ${pesoRate.source}`,
          sourceUrl: pesoRate.sourceUrl,
          isLive: true,
        };
      }
      return m;
    });
  }, [oilPrice, pesoRate]);

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
        <footer className="mt-3 text-xs text-white-30">
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
    </SectionWrapper>
  );
}
