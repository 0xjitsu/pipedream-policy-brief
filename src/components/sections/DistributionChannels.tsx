"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { ChannelRadarChart } from "@/components/charts/ChannelRadarChart";
import { FiscalCostChart } from "@/components/charts/FiscalCostChart";
import { channels, sequencingRecommendation } from "@/data/channels";
import { fadeInUp, staggerContainer } from "@/lib/motion";

const tagColorMap: Record<string, string> = {
  important: "#F59E0B",
  strategic: "#10B981",
  purple: "#8B5CF6",
};

function ChannelContent({ channel }: { channel: (typeof channels)[0] }) {
  const isTargeted = channel.id === 2;

  return (
    <div className="space-y-5">
      {/* How it works */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-white-50 mb-2">How it works</h4>
        {Array.isArray(channel.how) ? (
          <ol className="space-y-2">
            {channel.how.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-white-70">
                <span className="font-mono text-xs text-white-30 shrink-0 mt-0.5">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-white-70 leading-relaxed">{channel.how}</p>
        )}
      </div>

      {/* Advantages + Risks side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-strategic mb-2">Advantages</h4>
          <ul className="space-y-1.5">
            {channel.advantages.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm text-white-70">
                <span className="text-strategic shrink-0">+</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-critical mb-2">Risks</h4>
          <ul className="space-y-1.5">
            {channel.risks.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm text-white-70">
                <span className="text-critical shrink-0">–</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Fiscal + Readiness */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="glass px-4 py-2">
          <span className="text-white-50">Fiscal: </span>
          <span className="text-white font-semibold font-mono">{channel.fiscalEstimate}</span>
        </div>
        <div className="glass px-4 py-2">
          <span className="text-white-50">Readiness: </span>
          <span className="text-white font-semibold">{channel.readiness}</span>
        </div>
      </div>

      {channel.whenToDeploy && (
        <div className="glass px-4 py-3 border-l-2 border-l-important">
          <span className="text-xs text-white-50 uppercase tracking-wider font-semibold">When to deploy: </span>
          <span className="text-sm text-white-70">{channel.whenToDeploy}</span>
        </div>
      )}

      {/* Implementation Roadmap — Channel 2 only */}
      {isTargeted && channel.roadmap && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white-50 mb-3">Implementation Roadmap</h4>
          <div className="space-y-0">
            {channel.roadmap.map((step, i) => (
              <div key={i} className="flex gap-4 pb-4 relative">
                {/* Timeline line */}
                {i < channel.roadmap!.length - 1 && (
                  <div className="absolute left-[7px] top-[18px] w-0.5 h-full bg-strategic/30" />
                )}
                <div className="w-4 h-4 rounded-full bg-strategic/20 border-2 border-strategic shrink-0 mt-0.5 relative z-10" />
                <div>
                  <div className="text-xs font-semibold text-strategic font-mono">{step.week}</div>
                  <div className="text-sm text-white-70 mt-0.5">{step.task}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Requirements — Channel 2 only */}
      {isTargeted && channel.platformRequirements && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white-50 mb-3">Digital Platform Requirements</h4>
          <div className="grid md:grid-cols-2 gap-2">
            {channel.platformRequirements.map((req, i) => (
              <div key={i} className="flex gap-2 text-sm text-white-70">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                  <rect width="16" height="16" rx="4" fill="rgba(16,185,129,0.15)" />
                  <path d="M4.5 8L7 10.5L11.5 5.5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DistributionChannels() {
  return (
    <SectionWrapper
      id="channels"
      title="Distribution Channels"
      subtitle="Three mechanisms for delivering discounted fuel to target populations"
    >
      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <ChannelRadarChart />
        </motion.div>
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <FiscalCostChart />
        </motion.div>
      </div>

      {/* Channel cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-4 mb-8"
      >
        {channels.map((channel) => (
          <ExpandableCard
            key={channel.id}
            title={`Channel ${channel.id}: ${channel.name}`}
            badge={{ text: channel.tag, color: channel.tagColor }}
            defaultExpanded={channel.id === 2}
            accentColor={tagColorMap[channel.tagColor]}
          >
            <ChannelContent channel={channel} />
          </ExpandableCard>
        ))}
      </motion.div>

      {/* Sequencing recommendation */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="glass p-6 border-l-3 border-l-strategic bg-strategic/5"
      >
        <h4 className="text-xs font-semibold uppercase tracking-wider text-strategic mb-2">
          Sequencing Recommendation
        </h4>
        <p className="text-sm text-white-70 leading-relaxed">{sequencingRecommendation}</p>
      </motion.div>
    </SectionWrapper>
  );
}
