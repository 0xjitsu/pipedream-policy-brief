"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
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
      subtitle="Coordinated response framework for immediate, medium-term, and structural action"
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
            <ul className="space-y-2.5">
              {pillar.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3 text-sm text-white-70 leading-relaxed">
                  <span className="text-white-30 shrink-0">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </ExpandableCard>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
