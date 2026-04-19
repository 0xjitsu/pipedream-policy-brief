"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { SectionCTA } from "@/components/ui/SectionCTA";
import { pillars } from "@/data/pillars";
import { staggerContainer } from "@/lib/motion";
import type { Urgency } from "@/data/types";

const urgencyAccent: Record<Urgency, string> = {
  critical: "#EF4444",
  urgent: "#F97316",
  important: "#F59E0B",
  info: "#3B82F6",
  strategic: "#10B981",
};

const urgencyLabel: Record<Urgency, string> = {
  critical: "Critical",
  urgent: "Urgent",
  important: "Important",
  info: "Important",
  strategic: "Strategic",
};

export function PolicyPillars() {
  return (
    <SectionWrapper
      id="pillars"
      title="Five Policy Pillars"
      icon="🏛️"
      subtitle="Coordinated response framework for immediate, medium-term, and structural action"
      tier="static"
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-4"
      >
        {pillars.map((pillar) => (
          <ExpandableCard
            key={pillar.id}
            title={`${pillar.id}. ${pillar.title}`}
            badge={{ text: urgencyLabel[pillar.urgency], color: pillar.urgency }}
            accentColor={urgencyAccent[pillar.urgency]}
            defaultExpanded={pillar.id <= 2}
          >
            <div className="space-y-5">
              {/* Rationale */}
              <div className="glass px-4 py-3 border-l-2" style={{ borderLeftColor: urgencyAccent[pillar.urgency] }}>
                <span className="text-xs font-semibold uppercase tracking-wider text-white-50">Rationale: </span>
                <span className="text-sm text-white-70 leading-relaxed">{pillar.rationale}</span>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white-50 mb-3">Recommendations</h3>
                <div className="space-y-3">
                  {pillar.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-3">
                      <span
                        className="font-mono text-xs font-bold shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: `${urgencyAccent[pillar.urgency]}15`,
                          color: urgencyAccent[pillar.urgency],
                        }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-white">{rec.title}</div>
                        <p className="text-sm text-white-70 leading-relaxed mt-0.5">
                          {rec.detail}
                          {rec.sourceUrl && (
                            <a href={rec.sourceUrl} target="_blank" rel="noopener noreferrer"
                               className="text-[10px] text-white-30 hover:text-white-50 underline underline-offset-2 transition-colors ml-1">
                              Source
                            </a>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ExpandableCard>
        ))}
      </motion.div>

      <SectionCTA text="How do we actually implement this? →" href="#timeline" />
    </SectionWrapper>
  );
}
