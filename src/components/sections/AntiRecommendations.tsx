"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { staggerContainer, fadeInUp } from "@/lib/motion";
import { antiRecommendations, antiRecContext } from "@/data/anti-recs";

export function AntiRecommendations() {
  return (
    <SectionWrapper
      id="anti-recs"
      title="What We Do Not Recommend"
      icon="⛔"
      subtitle="Proposals considered and rejected on substantive grounds"
    >
      {/* Context paragraph */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-6"
      >
        <p className="text-sm md:text-base text-white-70 leading-relaxed glass p-5">
          {antiRecContext}
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-2 gap-4"
      >
        {antiRecommendations.map((item) => (
          <motion.div
            key={item.id}
            variants={fadeInUp}
            className="glass p-5 border-l-3 border-l-critical bg-critical/5"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-critical-bg flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 4L12 12M12 4L4 12" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                <p className="text-sm text-white-50 leading-relaxed mt-2">{item.reason}</p>
                {item.sourceUrl && (
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-xs text-white-30 hover:text-white-50 underline underline-offset-2 transition-colors">
                    Source &rarr;
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
