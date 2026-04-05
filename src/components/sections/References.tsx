"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { staggerContainer, fadeInUp } from "@/lib/motion";
import {
  references,
  CATEGORY_META,
  type ReferenceCategory,
} from "@/data/references";

type CategoryFilter = "all" | ReferenceCategory;

export function References() {
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const filtered =
    filter === "all"
      ? references
      : references.filter((r) => r.category === filter);

  const categories: { key: CategoryFilter; count: number }[] = [
    { key: "all", count: references.length },
    ...Object.keys(CATEGORY_META).map((k) => ({
      key: k as ReferenceCategory,
      count: references.filter((r) => r.category === k).length,
    })),
  ];

  return (
    <SectionWrapper
      id="references"
      title="References & Data Sources"
      icon="📚"
      subtitle="All sources cited in this brief — verified as of March 30, 2026"
    >
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {categories.map(({ key, count }) => {
          const isActive = filter === key;
          const meta = key !== "all" ? CATEGORY_META[key] : null;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors border min-h-[44px] ${
                isActive
                  ? "bg-white-10 border-white-20 text-white"
                  : "border-transparent text-white-50 hover:bg-white-05 hover:text-white-70"
              }`}
            >
              {meta ? meta.label : "All"}
              <span className="ml-1.5 text-[10px] text-white-30">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop table */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="hidden md:block"
      >
        <div className="glass overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white-08">
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-white-50 font-semibold w-10">
                  #
                </th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-white-50 font-semibold">
                  Source
                </th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-white-50 font-semibold w-28">
                  Type
                </th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-white-50 font-semibold">
                  Used In
                </th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-white-50 font-semibold hidden lg:table-cell">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ref, i) => {
                const meta = CATEGORY_META[ref.category];
                return (
                  <motion.tr
                    key={ref.id}
                    variants={fadeInUp}
                    className="border-b border-white-05 last:border-0 hover:bg-white-05 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-white-30 font-mono">
                      {ref.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${ref.domain}&sz=16`}
                          alt=""
                          width={14}
                          height={14}
                          className="opacity-60 shrink-0"
                        />
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-white-70 hover:text-white transition-colors underline underline-offset-2"
                        >
                          {ref.label}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${meta.bg} ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {ref.usedIn.map((section) => (
                          <span
                            key={section}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-white-05 text-white-40"
                          >
                            {section}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-[11px] text-white-30 leading-relaxed max-w-sm">
                        {ref.description}
                      </p>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Mobile cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="md:hidden space-y-2"
      >
        {filtered.map((ref) => {
          const meta = CATEGORY_META[ref.category];
          return (
            <motion.div key={ref.id} variants={fadeInUp} className="glass p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${ref.domain}&sz=16`}
                    alt=""
                    width={14}
                    height={14}
                    className="opacity-60 shrink-0"
                  />
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white-70 hover:text-white transition-colors underline underline-offset-2 truncate"
                  >
                    {ref.label}
                  </a>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${meta.bg} ${meta.color}`}
                >
                  {meta.label}
                </span>
              </div>
              <p className="text-[11px] text-white-30 leading-relaxed mb-2">
                {ref.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {ref.usedIn.map((section) => (
                  <span
                    key={section}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-white-05 text-white-40"
                  >
                    {section}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Footer note */}
      <p className="mt-6 text-[11px] text-white-20 leading-relaxed">
        Station data is updated weekly from DOE OIMB reports and citizen
        submissions. Market data (oil prices, FX rates) is polled every 10
        minutes from Yahoo Finance and ECB/Frankfurter. News headlines are
        aggregated from RSS feeds and refreshed every 5 minutes.
      </p>
    </SectionWrapper>
  );
}
