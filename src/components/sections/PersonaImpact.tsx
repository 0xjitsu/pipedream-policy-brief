"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { staggerContainer, fadeInUp } from "@/lib/motion";
import { personas } from "@/data/personas";

export function PersonaImpact() {
  return (
    <SectionWrapper
      id="impact"
      title="What This Means for You"
      icon="👤"
      subtitle="How the fuel crisis affects everyday Filipinos"
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {personas.map((p) => (
          <motion.div
            key={p.id}
            variants={fadeInUp}
            className="glass glass-hover rounded-xl p-5 flex flex-col gap-3"
          >
            {/* Header: icon + name */}
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none" aria-hidden="true">
                {p.icon}
              </span>
              <h3 className="text-sm font-bold text-white-90">{p.name}</h3>
            </div>

            {/* Quote */}
            <blockquote className="font-serif italic text-sm text-white-70 leading-relaxed flex-1">
              &ldquo;{p.quote}&rdquo;
            </blockquote>

            {/* Stat pill */}
            <div className="flex items-center gap-2 pt-2 border-t border-white-08">
              <span
                className="text-lg font-mono font-bold"
                style={{ color: p.impactColor }}
              >
                {p.keyStat}
              </span>
              <span className="text-[10px] text-white-50 uppercase tracking-wider">
                {p.statLabel}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Context note */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-center text-xs text-white-50"
      >
        Based on Senate hearing testimony, DOE reports, and field interviews. Figures represent typical cases, not averages.
      </motion.p>
    </SectionWrapper>
  );
}
