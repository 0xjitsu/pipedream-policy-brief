"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/motion";

interface ProcessFlowProps {
  steps: string[];
  accentColor: string;
}

export function ProcessFlow({ steps, accentColor }: ProcessFlowProps) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-white-50 mb-3">How it works</h4>

      {/* Desktop: horizontal flow */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="hidden md:flex items-start gap-0"
      >
        {steps.map((step, i) => (
          <motion.div key={i} variants={fadeInUp} className="flex items-start flex-1 min-w-0">
            {/* Step card */}
            <div className="flex-1 min-w-0">
              <div className="glass p-3 relative">
                {/* Step number badge */}
                <div
                  className="absolute -top-2.5 left-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {i + 1}
                </div>
                <p className="text-xs text-white-70 leading-relaxed mt-1.5">
                  {step}
                </p>
              </div>
            </div>

            {/* Arrow connector */}
            {i < steps.length - 1 && (
              <div className="flex items-center shrink-0 pt-5 px-1">
                <svg width="20" height="12" viewBox="0 0 20 12" fill="none" className="opacity-30">
                  <path d="M0 6H16M16 6L11 1M16 6L11 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Mobile: vertical flow */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="md:hidden space-y-0"
      >
        {steps.map((step, i) => (
          <motion.div key={i} variants={fadeInUp} className="flex gap-3 relative">
            {/* Vertical connector line */}
            {i < steps.length - 1 && (
              <div
                className="absolute left-[9px] top-[22px] w-0.5 h-full opacity-30"
                style={{ backgroundColor: accentColor }}
              />
            )}
            {/* Step number dot */}
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5 relative z-10"
              style={{ backgroundColor: accentColor }}
            >
              {i + 1}
            </div>
            {/* Step text */}
            <p className="text-sm text-white-70 leading-relaxed pb-3">{step}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
