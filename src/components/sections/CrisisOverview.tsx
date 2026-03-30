"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { MetricCard } from "@/components/ui/MetricCard";
import { SupplyChart } from "@/components/charts/SupplyChart";
import { GdpInflationChart } from "@/components/charts/GdpInflationChart";
import { AseanComparisonChart } from "@/components/charts/AseanComparisonChart";
import { metrics, senateFindings } from "@/data/crisis-overview";
import { staggerContainer, fadeInUp } from "@/lib/motion";

export function CrisisOverview() {
  return (
    <SectionWrapper id="crisis" title="Crisis Overview" subtitle="Philippine fuel supply emergency — March 30, 2026">
      {/* Metric cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8"
      >
        {metrics.map((m) => (
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
          <GdpInflationChart />
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
                  <span className="text-xs text-white-50">{f.source}</span>
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
    </SectionWrapper>
  );
}
