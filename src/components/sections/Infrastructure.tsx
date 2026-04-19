"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { StationBarChart } from "@/components/charts/StationBarChart";
import { ProgressBar } from "@/components/charts/ProgressBar";
import { fuelAvailability, islandGroups, infrastructureCallout, infrastructureSource } from "@/data/infrastructure";
import { fadeInUp, staggerContainer } from "@/lib/motion";

const islandColor: Record<string, string> = {
  Luzon: "#3B82F6",
  Visayas: "#10B981",
  Mindanao: "#F97316",
};

export function Infrastructure() {
  return (
    <SectionWrapper
      id="infrastructure"
      title="Infrastructure & Station Coverage"
      icon="🏗️"
      subtitle="450+ PriceLOCQ-equipped stations powering targeted fuel distribution"
      tier="static"
    >
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Station bar chart */}
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <StationBarChart />
        </motion.div>

        {/* Right column: fuel availability + island groups */}
        <div className="space-y-6">
          {/* Fuel availability */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="glass p-5"
          >
            <h3 className="font-serif text-base font-semibold text-white mb-4">Fuel Availability</h3>
            <div className="space-y-4">
              {fuelAvailability.map((fuel) => (
                <ProgressBar key={fuel.name} label={fuel.name} sublabel={fuel.brandName} value={fuel.available} total={fuel.total} />
              ))}
            </div>
          </motion.div>

          {/* Island group summaries */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-3 gap-3"
          >
            {islandGroups.map((group) => (
              <motion.div
                key={group.name}
                variants={fadeInUp}
                className="glass p-4 text-center"
                style={{ borderTopColor: islandColor[group.name], borderTopWidth: 3 }}
              >
                <div className="font-mono text-2xl font-bold text-white">{group.stations}</div>
                <div className="text-xs text-white-50 mt-1">{group.name}</div>
                <div className="text-xs text-white-70 font-semibold">{group.percentage}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Callout */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="glass p-6 border-l-3 border-l-info bg-info/5"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-info mb-2">
          Why This Infrastructure Matters
        </h3>
        <p className="text-sm text-white-70 leading-relaxed">{infrastructureCallout}</p>
      </motion.div>

      <p className="text-[10px] text-white-20 mt-3">
        Source: <a href={infrastructureSource.url} target="_blank" rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-white-50 transition-colors">{infrastructureSource.label}</a>
      </p>
    </SectionWrapper>
  );
}
