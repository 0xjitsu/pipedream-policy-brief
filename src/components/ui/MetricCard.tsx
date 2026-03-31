"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { AnimatedCounter } from "./AnimatedCounter";
import type { MetricCardData } from "@/data/types";

function RadialGauge({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(value / max, 1);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct * 0.75);
  const rotation = 135;

  // Dynamic danger-level color
  const arcColor = value <= 20 ? "#EF4444" : value <= 35 ? "#F59E0B" : color;

  return (
    <svg width="110" height="110" viewBox="0 0 110 110" className="mx-auto">
      <defs>
        <filter id="gauge-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Background arc */}
      <circle
        cx="55"
        cy="55"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
        transform={`rotate(${rotation} 55 55)`}
      />
      {/* Value arc with glow */}
      <circle
        cx="55"
        cy="55"
        r={radius}
        fill="none"
        stroke={arcColor}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
        strokeDashoffset={dashOffset}
        transform={`rotate(${rotation} 55 55)`}
        filter="url(#gauge-glow)"
        className="transition-all duration-1000 ease-out"
      />
      {/* Center text */}
      <text x="55" y="52" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="var(--font-dm-sans)">
        {value}
      </text>
      <text x="55" y="68" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="var(--font-dm-sans)">
        of {max} days
      </text>
    </svg>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      Live
    </span>
  );
}

export function MetricCard({ data }: { data: MetricCardData }) {
  const labelContent = (
    <span className={data.sourceUrl ? "hover:underline hover:underline-offset-2 transition-all" : ""}>
      {data.label}
    </span>
  );

  return (
    <motion.div variants={fadeInUp} className="glass glass-hover p-5 flex flex-col items-center text-center gap-2">
      {data.type === "gauge" && data.gaugeMax && data.gaugeValue && data.gaugeColor ? (
        <RadialGauge value={data.gaugeValue} max={data.gaugeMax} color={data.gaugeColor} />
      ) : (
        <AnimatedCounter value={data.value} className="font-mono text-3xl font-bold tracking-tight text-white" />
      )}
      <div className="flex items-center gap-1.5">
        <div className="text-sm text-white-70 font-medium">
          {data.sourceUrl ? (
            <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-white-70">
              {labelContent}
            </a>
          ) : (
            labelContent
          )}
        </div>
        {data.isLive && <LiveBadge />}
      </div>
      {data.delta && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-critical font-semibold font-mono">{data.delta}</span>
          {data.deltaLabel && <span className="text-white-50">{data.deltaLabel}</span>}
        </div>
      )}
    </motion.div>
  );
}
