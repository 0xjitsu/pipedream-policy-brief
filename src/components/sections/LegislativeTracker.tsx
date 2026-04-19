"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { staggerContainer, fadeInUp } from "@/lib/motion";
import { legislationItems, POSITION_COLORS } from "@/data/legislation";

type PositionFilter = "all" | "supported" | "opposed" | "conditional";

const POSITION_LABELS: Record<string, string> = {
  supported: "✅ Supported",
  opposed: "⛔ Opposed",
  conditional: "⚠️ Conditional",
};

export function LegislativeTracker() {
  const [filter, setFilter] = useState<PositionFilter>("all");

  const filtered =
    filter === "all"
      ? legislationItems
      : legislationItems.filter((item) => item.position === filter);

  const filters: { key: PositionFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "supported", label: "Supported" },
    { key: "opposed", label: "Opposed" },
    { key: "conditional", label: "Conditional" },
  ];

  return (
    <SectionWrapper
      id="legislation"
      title="Legislative Tracker"
      icon="⚖️"
      subtitle="Status of key bills, orders, and agency actions"
      tier="weekly"
    >
      {/* Context */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="glass rounded-xl p-5 mb-8 text-sm text-white-70 leading-relaxed"
      >
        The following legislative and executive actions are being tracked. This brief&apos;s position on each is based on the{" "}
        <a href="#pillars" className="text-[#3B82F6] hover:underline">
          Five Pillars framework
        </a>
        .
      </motion.div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Filter by position">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[44px] ${
              filter === f.key
                ? "bg-white-10 text-white"
                : "text-white-50 hover:text-white-70 hover:bg-white-05"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Legislative items */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="space-y-3"
      >
        {filtered.map((item) => (
          <motion.div
            key={item.id}
            variants={fadeInUp}
            className="glass rounded-xl p-5"
            style={{ borderLeft: `3px solid ${POSITION_COLORS[item.position]}` }}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              {/* Left: main content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span aria-hidden="true">{item.categoryIcon}</span>
                  <h3 className="text-sm font-bold text-white-90">{item.title}</h3>
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: `${item.statusColor}15`,
                      color: item.statusColor,
                    }}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-white-70 leading-relaxed mb-2">
                  {item.description}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-white-50">
                  <span>{item.author}</span>
                  <span className="text-white-20">·</span>
                  <span>{item.category}</span>
                  <span className="text-white-20">·</span>
                  <span>Updated {item.lastUpdated}</span>
                  {item.sourceUrl && (
                    <>
                      <span className="text-white-20">·</span>
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3B82F6] hover:underline"
                      >
                        Source →
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Right: position badge */}
              <div className="shrink-0">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap"
                  style={{
                    backgroundColor: `${POSITION_COLORS[item.position]}15`,
                    color: POSITION_COLORS[item.position],
                    border: `1px solid ${POSITION_COLORS[item.position]}30`,
                  }}
                >
                  {POSITION_LABELS[item.position]}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-center text-xs text-white-50"
      >
        Positions are based on evidence from Senate hearings, DOE reports, and fiscal impact analysis.
        Updated as legislation progresses.
      </motion.p>
    </SectionWrapper>
  );
}
