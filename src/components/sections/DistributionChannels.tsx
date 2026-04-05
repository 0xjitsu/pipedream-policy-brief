"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { ChannelRadarChart } from "@/components/charts/ChannelRadarChart";
import { FiscalCostChart } from "@/components/charts/FiscalCostChart";
import { ProcessFlow } from "@/components/charts/ProcessFlow";
import { ProsConsChart } from "@/components/charts/ProsConsChart";
import { RoadmapGantt } from "@/components/charts/RoadmapGantt";
import { ReadinessMeters } from "@/components/charts/ReadinessMeters";
import { channels, sequencingRecommendation, channelContext } from "@/data/channels";
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
      {/* Summary */}
      <p className="text-sm text-white-70 leading-relaxed">{channel.summary}</p>

      {/* Proven Platform callout — Channel 2 only */}
      {isTargeted && channel.provenPlatform && (
        <div className="glass p-4 border-l-3 border-l-strategic bg-strategic/5">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-strategic opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-strategic" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-strategic">Operational</span>
            <span className="text-white-20 mx-1">·</span>
            <a
              href={channel.provenPlatform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-white hover:text-strategic transition-colors"
            >
              {channel.provenPlatform.name}
            </a>
            <span className="text-xs text-white-50">by {channel.provenPlatform.operator}</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
            <div className="text-xs text-white-50">
              <span className="font-mono font-semibold text-white">{channel.provenPlatform.stationCount}</span> stations nationwide
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-1.5 mb-3">
            {channel.provenPlatform.capabilities.map((cap, i) => (
              <div key={i} className="flex gap-2 text-xs text-white-50">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" aria-hidden="true">
                  <rect width="16" height="16" rx="4" fill="rgba(16,185,129,0.15)" />
                  <path d="M4.5 8L7 10.5L11.5 5.5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{cap}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-white-50 leading-relaxed border-t border-white-08 pt-2">
            {channel.provenPlatform.scalabilityNote}
          </p>
        </div>
      )}

      {/* How it works — process flow */}
      {Array.isArray(channel.how) ? (
        <ProcessFlow steps={channel.how} accentColor={tagColorMap[channel.tagColor]} />
      ) : (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white-50 mb-2">How it works</h4>
          <p className="text-sm text-white-70 leading-relaxed">{channel.how}</p>
        </div>
      )}

      {/* Advantages + Risks — diverging bar chart */}
      <ProsConsChart
        advantages={channel.advantages}
        risks={channel.risks}
        accentColor={tagColorMap[channel.tagColor]}
      />

      {/* Fiscal + Readiness — visual meters */}
      <ReadinessMeters
        fiscalEstimate={channel.fiscalEstimate}
        readiness={channel.readiness}
        accentColor={tagColorMap[channel.tagColor]}
      />

      {/* Prerequisites */}
      {channel.prerequisites && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white-50 mb-2">Prerequisites</h4>
          <ul className="space-y-1.5">
            {channel.prerequisites.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-white-70">
                <span className="text-info shrink-0">○</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {channel.whenToDeploy && (
        <div className="glass px-4 py-3 border-l-2 border-l-important">
          <span className="text-xs text-white-50 uppercase tracking-wider font-semibold">When to deploy: </span>
          <span className="text-sm text-white-70">{channel.whenToDeploy}</span>
        </div>
      )}

      {/* Implementation Roadmap — Channel 2 only (Gantt chart) */}
      {isTargeted && channel.roadmap && (
        <RoadmapGantt items={channel.roadmap} accentColor={tagColorMap[channel.tagColor]} />
      )}

      {/* Platform Requirements — Channel 2 only */}
      {isTargeted && channel.platformRequirements && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white-50 mb-3">Platform Capabilities (Operational)</h4>
          <div className="grid md:grid-cols-2 gap-2">
            {channel.platformRequirements.map((req, i) => (
              <div key={i} className="flex gap-2 text-sm text-white-70">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" aria-hidden="true">
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
      icon="🛢️"
      subtitle="How should the government deliver fuel relief to those who need it most?"
    >
      {/* Context block — the problem */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-8"
      >
        <div className="glass p-6 space-y-4">
          <p className="text-sm md:text-base text-white-70 leading-relaxed">
            {channelContext.problem}
          </p>

          {/* Who's affected — scale metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {channelContext.scale.map((group) => (
              <div key={group.label} className="glass p-3 text-center">
                <div className="font-mono text-lg md:text-xl font-bold text-white">{group.count}</div>
                <div className="text-xs text-white-50 mt-1">{group.label}</div>
                <a
                  href={group.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-info/70 hover:text-info transition-colors"
                >
                  {group.source} →
                </a>
              </div>
            ))}
          </div>

          <p className="text-sm text-white-50 leading-relaxed border-t border-white-08 pt-4">
            {channelContext.question}
          </p>
        </div>
      </motion.div>

      {/* Comparison charts — zoom out view */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-2"
      >
        <h3 className="font-serif text-lg font-semibold text-white mb-1">At a Glance</h3>
        <p className="text-xs text-white-50 mb-4">
          Side-by-side evaluation of the three channels across six criteria and their fiscal impact.
          Data from{" "}
          <a
            href={channelContext.sources.senateHearing.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-info/80 hover:text-info transition-colors underline underline-offset-2"
          >
            {channelContext.sources.senateHearing.label}
          </a>{" "}
          and{" "}
          <a
            href={channelContext.sources.dof.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-info/80 hover:text-info transition-colors underline underline-offset-2"
          >
            {channelContext.sources.dof.label}
          </a>{" "}
          estimates.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <ChannelRadarChart />
        </motion.div>
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <FiscalCostChart />
        </motion.div>
      </div>

      {/* Channel detail cards — zoom in */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-2"
      >
        <h3 className="font-serif text-lg font-semibold text-white mb-1">Channel Details</h3>
        <p className="text-xs text-white-50 mb-4">
          Click each channel to see how it works, its advantages, risks, and fiscal cost.
          Channel 2 (targeted) is expanded by default as the recommended primary mechanism.
        </p>
      </motion.div>

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
        <p className="text-[10px] text-white-20 mt-3">
          Sources:{" "}
          <a
            href={channelContext.sources.senateHearing.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white-20 hover:text-white-50 underline underline-offset-2 transition-colors"
          >
            {channelContext.sources.senateHearing.label}
          </a>
          {" · "}
          <a
            href={channelContext.sources.doe.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white-20 hover:text-white-50 underline underline-offset-2 transition-colors"
          >
            {channelContext.sources.doe.label}
          </a>
          {" · "}
          <a
            href={channelContext.sources.dof.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white-20 hover:text-white-50 underline underline-offset-2 transition-colors"
          >
            {channelContext.sources.dof.label}
          </a>
        </p>
      </motion.div>
    </SectionWrapper>
  );
}
