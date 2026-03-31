"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { stations, trackerStats } from "@/data/station-tracker";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import type { StationStatus } from "@/data/types";

// Dynamically import the map to avoid SSR issues with Leaflet
const StationMap = dynamic(
  () => import("@/components/charts/StationMap").then((mod) => mod.StationMap),
  { ssr: false, loading: () => <div className="w-full rounded-xl bg-[#0a1628]" style={{ height: 500 }} /> }
);

type FilterKey = StationStatus | "all";

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "out-of-stock", label: "Out of Stock" },
  { key: "low-supply", label: "Low Supply" },
  { key: "operational", label: "Operational" },
];

const STAT_CARDS: {
  label: string;
  valueKey: keyof typeof trackerStats;
  accent?: string;
  border?: string;
}[] = [
  { label: "Total Tracked", valueKey: "totalTracked" },
  { label: "Out of Stock", valueKey: "outOfStock", accent: "text-[#EF4444]", border: "border-l-[#EF4444]" },
  { label: "Low Supply", valueKey: "lowSupply", accent: "text-[#F59E0B]", border: "border-l-[#F59E0B]" },
  { label: "Operational", valueKey: "operational", accent: "text-[#10B981]", border: "border-l-[#10B981]" },
];

export function StationTracker() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filteredStations = useMemo(
    () => (filter === "all" ? stations : stations.filter((s) => s.status === filter)),
    [filter]
  );

  return (
    <SectionWrapper
      id="tracker"
      title="Station Status Tracker"
      subtitle={`Real-time fuel availability across ${trackerStats.totalTracked} monitored stations \u00B7 Updated ${trackerStats.lastUpdated}`}
    >
      {/* Stat cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
      >
        {STAT_CARDS.map((card) => (
          <motion.div
            key={card.label}
            variants={fadeInUp}
            className={`glass p-4 ${card.border ? `border-l-3 ${card.border}` : ""}`}
          >
            <div className={`font-mono text-2xl font-bold ${card.accent || "text-white"}`}>
              {trackerStats[card.valueKey]}
            </div>
            <div className="text-xs text-white-50 mt-1">{card.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filter pills */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-wrap gap-1.5 mb-6"
      >
        <span className="text-[10px] uppercase tracking-wider text-white-30 font-semibold self-center mr-1">
          Filter
        </span>
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors border ${
              filter === f.key
                ? "bg-white-10 border-white-20 text-white"
                : "border-transparent text-white-50 hover:bg-white-05 hover:text-white-70"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="text-xs text-white-30 self-center ml-2">
          {filteredStations.length} station{filteredStations.length !== 1 ? "s" : ""}
        </span>
      </motion.div>

      {/* Map */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-8"
      >
        <StationMap stations={filteredStations} />
      </motion.div>

      {/* Data sources callout */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="glass p-6 border-l-3 border-l-info bg-info/5"
      >
        <h4 className="text-xs font-semibold uppercase tracking-wider text-info mb-2">
          Data Sources
        </h4>
        <p className="text-sm text-white-70 leading-relaxed">
          Station statuses compiled from verified news reports and DOE monitoring data.
          Crowd-sourced citizen reporting coming soon.
        </p>
      </motion.div>
    </SectionWrapper>
  );
}
