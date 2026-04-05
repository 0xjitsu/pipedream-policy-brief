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

const channelOneLiners: Record<number, string> = {
  1: "Government buys fuel at scale and sells to distributors at subsidized prices",
  2: "Digital fuel codes delivered to verified beneficiaries via existing PriceLOCQ platform",
  3: "Direct free fuel distribution to households through physical or digital vouchers",
};

const channelEmojis: Record<number, string> = {
  1: "🏭",
  2: "📱",
  3: "🎫",
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
      {/* 1. Problem statement + scale metrics */}
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
        </div>
      </motion.div>

      {/* 2. The Central Question — prominent thesis callout */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-8"
      >
        <div className="relative overflow-hidden rounded-xl border border-white-08 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl p-8 md:p-10">
          {/* Decorative open-quote */}
          <div
            className="absolute top-3 left-4 md:top-4 md:left-6 font-serif text-[6rem] md:text-[8rem] leading-none text-white/[0.04] select-none pointer-events-none"
            aria-hidden="true"
          >
            &ldquo;
          </div>
          {/* Accent bar left */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
            style={{ background: "linear-gradient(to bottom, #F59E0B, #10B981, #8B5CF6)" }}
            aria-hidden="true"
          />
          <p className="relative font-serif text-xl md:text-2xl lg:text-[1.75rem] text-white-90 leading-snug md:leading-relaxed tracking-tight text-center max-w-3xl mx-auto">
            The central policy question is not whether to intervene, but{" "}
            <span className="font-bold italic text-strategic">how</span>.
          </p>
          <p className="relative text-sm text-white-50 text-center mt-3 max-w-2xl mx-auto">
            Three distribution mechanisms exist, each with fundamentally different trade-offs in speed, fiscal cost, targeting accuracy, and corruption risk.
          </p>
        </div>
      </motion.div>

      {/* 3. Three Channels Overview — context before comparison */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-2"
      >
        <h3 className="font-serif text-lg font-semibold text-white mb-1">Three Mechanisms Under Consideration</h3>
        <p className="text-xs text-white-50 mb-4">
          Each channel represents a distinct approach to fuel relief delivery, with different cost structures and implementation timelines.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-3 gap-4 mb-8"
      >
        {channels.map((channel) => {
          const accentColor = tagColorMap[channel.tagColor];
          const isRecommended = channel.id === 2;

          return (
            <motion.div
              key={channel.id}
              variants={fadeInUp}
              className="relative glass p-5 flex flex-col"
              style={{ borderTop: `3px solid ${accentColor}` }}
            >
              {/* Recommended indicator for Channel 2 */}
              {isRecommended && (
                <div className="absolute -top-px right-4 -translate-y-full">
                  <span className="inline-flex items-center gap-1 bg-strategic/20 text-strategic text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-t-md border border-b-0 border-strategic/30">
                    <span aria-hidden="true">★</span> Recommended
                  </span>
                </div>
              )}

              {/* Channel header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden="true">{channelEmojis[channel.id]}</span>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white-50">
                      Channel {channel.id}
                    </div>
                    <div className="text-sm font-semibold text-white leading-tight">
                      {channel.name}
                    </div>
                  </div>
                </div>
              </div>

              {/* One-liner description */}
              <p className="text-xs text-white-70 leading-relaxed mb-4 flex-1">
                {channelOneLiners[channel.id]}
              </p>

              {/* Fiscal cost metric */}
              <div className="glass p-3 mb-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-white-50 mb-1">Fiscal Cost</div>
                <div className="font-mono text-sm font-semibold text-white">{channel.fiscalEstimate}</div>
              </div>

              {/* Tag badge */}
              <div className="flex items-center">
                <span
                  className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{
                    color: accentColor,
                    backgroundColor: `${accentColor}15`,
                    border: `1px solid ${accentColor}30`,
                  }}
                >
                  {channel.tag}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 4. Comparison charts — At a Glance */}
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

      {/* 5. Channel detail cards — zoom in */}
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
