"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { scenarios, scenarioContext } from "@/data/scenarios";
import { useMarketData } from "@/hooks/useMarketData";
import { fadeInUp, staggerContainer } from "@/lib/motion";

// Parse scenario midpoint prices for matching
const SCENARIO_PRICES: Record<string, number> = {
  "$80–85/bbl": 82.5,
  "$100/bbl": 100,
  "$130/bbl": 130,
  "$150/bbl": 150,
  "$200/bbl": 200,
};

// Find the closest scenario to the current oil price
function findClosestScenario(price: number): string {
  let closest = "$130/bbl";
  let minDiff = Infinity;
  for (const [label, mid] of Object.entries(SCENARIO_PRICES)) {
    const diff = Math.abs(price - mid);
    if (diff < minDiff) {
      minDiff = diff;
      closest = label;
    }
  }
  return closest;
}

export function EconomicScenarios() {
  const { oilPrice } = useMarketData();
  const currentScenario = oilPrice?.value ? findClosestScenario(oilPrice.value) : "$130/bbl";
  return (
    <SectionWrapper
      id="scenarios"
      title="Economic Impact Scenarios"
      icon="📊"
      subtitle="How oil price levels translate to GDP growth and inflation outcomes"
    >
      {/* Context */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-8"
      >
        <p className="text-sm md:text-base text-white-70 leading-relaxed glass p-5">
          {scenarioContext}
        </p>
      </motion.div>

      {/* Scenario cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-3"
      >
        {scenarios.map((s) => {
          const isCurrentRange = s.price === currentScenario;
          return (
            <motion.div
              key={s.price}
              variants={fadeInUp}
              className={`glass p-4 md:p-5 ${isCurrentRange ? "border-l-3 border-l-critical ring-1 ring-critical/20" : ""}`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                {/* Price + label */}
                <div className="flex items-center gap-3 md:w-48 shrink-0">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-mono text-sm font-bold text-white shrink-0"
                    style={{ backgroundColor: `${s.color}20`, color: s.color }}
                  >
                    {s.severity}
                  </div>
                  <div>
                    <div className="font-mono text-sm font-semibold text-white">{s.price}</div>
                    <div className="text-xs text-white-50">{s.label}</div>
                  </div>
                </div>

                {/* Severity bar */}
                <div className="flex-1 min-w-0">
                  <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(s.severity / 5) * 100}%`,
                        backgroundColor: s.color,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>

                {/* GDP + Inflation */}
                <div className="flex gap-4 md:gap-6 shrink-0">
                  <div className="text-center md:text-right">
                    <div className="text-[10px] uppercase tracking-wider text-white-30 mb-0.5">GDP</div>
                    <div className="font-mono text-sm font-semibold" style={{ color: s.severity >= 4 ? "#EF4444" : "rgba(255,255,255,0.9)" }}>
                      {s.gdp}
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-[10px] uppercase tracking-wider text-white-30 mb-0.5">Inflation</div>
                    <div className="font-mono text-sm font-semibold" style={{ color: s.severity >= 3 ? "#EF4444" : "rgba(255,255,255,0.9)" }}>
                      {s.inflation}
                    </div>
                  </div>
                </div>

                {/* Current marker */}
                {isCurrentRange && (
                  <div className="shrink-0">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-critical text-white">
                      NEAR CURRENT
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Source */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-4"
      >
        <p className="text-[10px] text-white-20">
          Sources:{" "}
          <a href="https://business.inquirer.net/567526/dbcc-cuts-targets-gdp-for-2026-now-at-5-6" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white-50 transition-colors">DBCC/NEDA</a>
          {" · "}
          <a href="https://www.bsp.gov.ph/Price%20Stability/MonetaryPolicyReport/EconomicOutlook-February2026.pdf" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white-50 transition-colors">BSP Monetary Policy Report</a>
          {" · "}
          <a href="https://think.ing.com/articles/oil-price-shock-raises-inflation-and-policy-risks-in-philippines/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white-50 transition-colors">ING Research</a>
          {" · "}
          <a href="https://www.mufgresearch.com/fx/philippines-strait-of-hormuz-closure-impact-of-higher-oil-prices-and-more-9-march-2026/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white-50 transition-colors">MUFG</a>
          {" · "}
          Wood Mackenzie
        </p>
      </motion.div>
    </SectionWrapper>
  );
}
