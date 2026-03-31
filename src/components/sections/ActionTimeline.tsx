"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { timeline } from "@/data/timeline";
import { staggerContainer, fadeInUp } from "@/lib/motion";
import type { Urgency } from "@/data/types";

const dotColor: Record<Urgency, string> = {
  critical: "#EF4444",
  urgent: "#F97316",
  important: "#F59E0B",
  info: "#3B82F6",
  strategic: "#10B981",
};

export function ActionTimeline() {
  return (
    <SectionWrapper
      id="timeline"
      title="Action Timeline"
      subtitle="Phased execution schedule with agency accountability"
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative"
      >
        {/* Vertical line */}
        <div className="absolute left-[15px] md:left-[19px] top-0 bottom-0 w-0.5 bg-white-08" />

        <div className="space-y-6">
          {timeline.map((period, pi) => (
            <motion.div key={pi} variants={fadeInUp} className="relative pl-10 md:pl-12">
              {/* Dot */}
              <div
                className="absolute left-[8px] md:left-[12px] top-1 w-4 h-4 rounded-full border-2"
                style={{
                  borderColor: dotColor[period.urgency],
                  backgroundColor: dotColor[period.urgency] + "30",
                }}
              />

              <div className="mb-3">
                <span
                  className="font-mono text-sm font-bold"
                  style={{ color: dotColor[period.urgency] }}
                >
                  {period.period}
                </span>
              </div>

              <div className="space-y-2">
                {period.items.map((item, ii) => (
                  <div key={ii} className="glass p-3 flex items-start justify-between gap-4">
                    <p className="text-sm text-white-70">{item.action}</p>
                    {item.sourceUrl ? (
                      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                         className="text-xs text-white-50 hover:text-white-70 underline underline-offset-2 transition-colors font-mono shrink-0 bg-white-05 px-2 py-0.5 rounded">
                        {item.agency}
                      </a>
                    ) : (
                      <span className="text-xs text-white-50 font-mono shrink-0 bg-white-05 px-2 py-0.5 rounded">
                        {item.agency}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
