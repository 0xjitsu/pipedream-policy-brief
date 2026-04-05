"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { staggerContainer, fadeInUp } from "@/lib/motion";
import {
  deliverables,
  partnershipPitch,
  ctaCards,
} from "@/data/roadmap-public";
import type { Deliverable } from "@/data/roadmap-public";

const COST_BADGE: Record<Deliverable["costType"], { bg: string; text: string }> = {
  monetary: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]" },
  engineering: { bg: "bg-[#3B82F6]/10", text: "text-[#3B82F6]" },
  partnership: { bg: "bg-[#8B5CF6]/10", text: "text-[#8B5CF6]" },
};

export function PublicRoadmap() {
  return (
    <SectionWrapper
      id="roadmap"
      title="What's Next"
      icon="🗺️"
      subtitle="Key deliverables and partnership opportunities"
    >
      {/* Deliverable cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12"
      >
        {deliverables.map((d) => {
          const badge = COST_BADGE[d.costType];
          return (
            <motion.div
              key={d.title}
              variants={fadeInUp}
              className="glass rounded-xl p-5 flex flex-col gap-3"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none" aria-hidden="true">
                  {d.icon}
                </span>
                <h3 className="text-sm font-bold text-white-90 leading-snug">
                  {d.title}
                </h3>
              </div>
              <p className="text-xs text-white-70 leading-relaxed flex-1">
                {d.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white-08">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${badge.bg} ${badge.text}`}
                >
                  {d.cost}
                </span>
                <span className="text-[10px] text-white-50">
                  {d.partnership}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Partnership callout */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="glass rounded-xl p-6 md:p-8 mb-12 relative overflow-hidden"
      >
        {/* Gradient left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
          style={{
            background:
              "linear-gradient(to bottom, #F59E0B, #10B981, #8B5CF6)",
          }}
        />
        <div className="pl-4 md:pl-6">
          <p className="font-serif text-lg md:text-xl text-white-90 leading-relaxed mb-4">
            &ldquo;{partnershipPitch.headline}&rdquo;
          </p>
          <ul className="space-y-2">
            {partnershipPitch.points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2 text-sm text-white-70"
              >
                <span className="text-[#10B981] mt-0.5" aria-hidden="true">
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* CTA grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid md:grid-cols-3 gap-4"
      >
        {ctaCards.map((card) => (
          <motion.div
            key={card.title}
            variants={fadeInUp}
            className="glass glass-hover rounded-xl p-5 flex flex-col gap-3"
          >
            <span className="text-2xl leading-none" aria-hidden="true">
              {card.icon}
            </span>
            <h3 className="text-sm font-bold text-white-90">{card.title}</h3>
            <p className="text-xs text-white-70 leading-relaxed flex-1">
              {card.description}
            </p>
            <a
              href={card.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3B82F6] hover:text-[#60A5FA] transition-colors min-h-[44px]"
            >
              {card.linkText}
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                className="shrink-0"
              >
                <path
                  d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center text-xs text-white-50"
      >
        Full technical roadmap available at{" "}
        <a
          href="https://github.com/0xjitsu/pipedream-policy-brief/blob/main/docs/ROADMAP.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#3B82F6] hover:underline"
        >
          docs/ROADMAP.md
        </a>
      </motion.p>
    </SectionWrapper>
  );
}
