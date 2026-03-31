"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { stations, trackerStats } from "@/data/station-tracker";
import {
  BRAND_LIST,
  BRAND_COLORS,
  ALL_REGIONS,
  getStationRegion,
} from "@/data/all-stations";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import type { StationStatus } from "@/data/types";

// Dynamically import the map to avoid SSR issues with Leaflet
const StationMap = dynamic(
  () =>
    import("@/components/charts/StationMap").then((mod) => mod.StationMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full rounded-xl bg-[#0a1628]"
        style={{ height: 500 }}
      />
    ),
  }
);

type StatusFilter = StationStatus | "all";

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "out-of-stock", label: "Out of Stock" },
  { key: "low-supply", label: "Low Supply" },
  { key: "closed", label: "Closed" },
  { key: "operational", label: "Operational" },
];

const STAT_CARDS: {
  label: string;
  valueKey: keyof typeof trackerStats;
  accent?: string;
  border?: string;
  sourceUrl?: string;
}[] = [
  { label: "Total Tracked", valueKey: "totalTracked" },
  {
    label: "Out of Stock",
    valueKey: "outOfStock",
    accent: "text-[#EF4444]",
    border: "border-l-[#EF4444]",
    sourceUrl: "https://www.doe.gov.ph/downstream-oil",
  },
  {
    label: "Low Supply",
    valueKey: "lowSupply",
    accent: "text-[#F59E0B]",
    border: "border-l-[#F59E0B]",
    sourceUrl: "https://www.doe.gov.ph/downstream-oil",
  },
  {
    label: "Closed",
    valueKey: "closed",
    accent: "text-[#6B7280]",
    border: "border-l-[#6B7280]",
    sourceUrl: "https://newsinfo.inquirer.net/2044671/fuel-shortages-worsen-in-mindanao",
  },
  {
    label: "Operational",
    valueKey: "operational",
    accent: "text-[#10B981]",
    border: "border-l-[#10B981]",
    sourceUrl: "https://www.doe.gov.ph/downstream-oil",
  },
];

export function StationTracker() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");

  const filteredStations = useMemo(() => {
    let result = stations;

    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }

    if (brandFilter !== "all") {
      result = result.filter((s) => s.brand === brandFilter);
    }

    if (regionFilter !== "all") {
      result = result.filter((s) => getStationRegion(s.id) === regionFilter);
    }

    return result;
  }, [statusFilter, brandFilter, regionFilter]);

  return (
    <SectionWrapper
      id="tracker"
      title="Station Status Tracker"
      subtitle={`Fuel availability across ${trackerStats.totalTracked.toLocaleString()} monitored stations \u00B7 Updated ${trackerStats.lastUpdated}`}
    >
      {/* Stat cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6"
      >
        {STAT_CARDS.map((card) => (
          <motion.div
            key={card.label}
            variants={fadeInUp}
            className={`glass p-4 ${card.border ? `border-l-3 ${card.border}` : ""}`}
          >
            <div
              className={`font-mono text-2xl font-bold ${card.accent || "text-white"}`}
            >
              {typeof trackerStats[card.valueKey] === "number"
                ? (trackerStats[card.valueKey] as number).toLocaleString()
                : trackerStats[card.valueKey]}
            </div>
            <div className="text-xs text-white-50 mt-1">
              {card.sourceUrl ? (
                <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline hover:underline-offset-2 transition-colors">
                  {card.label} <span className="text-white-20">&rarr;</span>
                </a>
              ) : (
                card.label
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Brand filter pills */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-wrap gap-1.5 mb-3"
      >
        <span className="text-[10px] uppercase tracking-wider text-white-20 font-semibold self-center mr-1">
          Brand
        </span>
        <button
          onClick={() => setBrandFilter("all")}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors border ${
            brandFilter === "all"
              ? "bg-white-10 border-white-20 text-white"
              : "border-transparent text-white-50 hover:bg-white-05 hover:text-white-70"
          }`}
        >
          All
        </button>
        {BRAND_LIST.map((brand) => (
          <button
            key={brand}
            onClick={() =>
              setBrandFilter(brandFilter === brand ? "all" : brand)
            }
            className={`px-2.5 py-1 text-xs rounded-md transition-colors border flex items-center gap-1.5 ${
              brandFilter === brand
                ? "bg-white-10 border-white-20 text-white"
                : "border-transparent text-white-50 hover:bg-white-05 hover:text-white-70"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: BRAND_COLORS[brand] }}
            />
            {brand}
          </button>
        ))}
      </motion.div>

      {/* Status filter pills + region dropdown */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-wrap items-center gap-1.5 mb-6"
      >
        <span className="text-[10px] uppercase tracking-wider text-white-20 font-semibold self-center mr-1">
          Status
        </span>
        {STATUS_OPTIONS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors border ${
              statusFilter === f.key
                ? "bg-white-10 border-white-20 text-white"
                : "border-transparent text-white-50 hover:bg-white-05 hover:text-white-70"
            }`}
          >
            {f.label}
          </button>
        ))}

        {/* Region dropdown */}
        <span className="text-[10px] uppercase tracking-wider text-white-20 font-semibold self-center ml-3 mr-1">
          Region
        </span>
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="text-xs bg-white-05 border border-white-08 text-white-70 rounded-md px-2 py-1 outline-none focus:border-white-20 transition-colors appearance-none cursor-pointer max-w-[200px]"
          style={{ backgroundImage: "none" }}
        >
          <option value="all" className="bg-navy text-white">
            All Regions
          </option>
          {ALL_REGIONS.map((r) => (
            <option key={r} value={r} className="bg-navy text-white">
              {r}
            </option>
          ))}
        </select>

        <span className="text-xs text-white-20 self-center ml-2">
          {filteredStations.length.toLocaleString()} station
          {filteredStations.length !== 1 ? "s" : ""}
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
          Station locations sourced from OpenStreetMap (10,469 stations). Status data compiled from{" "}
          <a
            href="https://www.doe.gov.ph/downstream-oil"
            target="_blank"
            rel="noopener noreferrer"
            className="text-info underline underline-offset-2"
          >
            DOE downstream oil monitoring
          </a>{" "}
          and verified news reports. Crowd-sourced citizen reporting coming soon.
        </p>
      </motion.div>
    </SectionWrapper>
  );
}
