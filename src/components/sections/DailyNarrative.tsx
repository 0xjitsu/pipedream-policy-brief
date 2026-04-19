"use client";

import { motion } from "framer-motion";
import { useDailyData } from "@/hooks/useDailyData";
import { fadeInUp } from "@/lib/motion";
import { FreshnessBadge } from "@/components/ui/FreshnessBadge";
import { SignalArrow } from "@/components/ui/SignalArrow";

const SIGNAL_LABELS: Record<string, string> = {
  crude: "Brent",
  peso: "Peso",
  pump: "Pump",
  supply: "Supply",
};

// "up" direction semantics: is rising value bad for the reader?
const SIGNAL_UP_IS_BAD: Record<string, boolean> = {
  crude: true,  // higher oil = worse
  peso: true,   // weaker peso = worse
  pump: true,   // higher pump price = worse
  supply: false, // more days of supply = better
};

/**
 * AI-synthesized "what shifted today" block, rendered between hero and
 * Crisis Overview. Shows a lightweight skeleton while loading and a
 * friendly fallback if no snapshot yet — never silently disappears.
 */
export function DailyNarrative() {
  const { snapshot, isLoading, lastUpdated } = useDailyData();
  const narrative = snapshot?.narrative;

  if (isLoading) {
    return (
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-12">
        <div className="glass p-6 animate-pulse space-y-3" aria-busy="true">
          <div className="h-5 bg-white-05 rounded w-2/3" />
          <div className="h-3 bg-white-05 rounded w-full" />
          <div className="h-3 bg-white-05 rounded w-5/6" />
        </div>
      </section>
    );
  }

  if (!narrative) {
    return (
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-12">
        <div className="glass p-6 border-l-3 border-l-white-20">
          <p className="text-sm text-white-70 italic">
            Daily narrative pending — today&apos;s snapshot hasn&apos;t been
            synthesized yet. Live market metrics and the static brief below
            remain accurate.
          </p>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-12"
      aria-label="Today's synthesized brief"
    >
      <div className="glass p-6 border-l-3 border-l-[#38BDF8]">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 className="font-serif text-xl md:text-2xl font-bold text-white leading-tight">
            {narrative.headline}
          </h2>
          <FreshnessBadge tier="daily" timestamp={lastUpdated} size="sm" />
        </div>
        <p className="text-sm md:text-base text-white-90 leading-relaxed mb-4">
          {narrative.body}
        </p>
        <div className="flex flex-wrap gap-3 pt-3 border-t border-white-05">
          {narrative.signals.map((s) => (
            <SignalArrow
              key={s.metric}
              direction={s.direction}
              upIsBad={SIGNAL_UP_IS_BAD[s.metric] ?? false}
              label={SIGNAL_LABELS[s.metric] ?? s.metric}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
