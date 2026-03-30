"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import type { MetricCardData } from "@/data/types";

function RadialGauge({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(value / max, 1);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct * 0.75); // 270 degrees arc
  const rotation = 135; // start from bottom-left

  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="mx-auto">
      {/* Background arc */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
        transform={`rotate(${rotation} 50 50)`}
      />
      {/* Value arc */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
        strokeDashoffset={dashOffset}
        transform={`rotate(${rotation} 50 50)`}
        className="transition-all duration-1000 ease-out"
      />
      {/* Center text */}
      <text x="50" y="48" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="var(--font-dm-sans)">
        {value}
      </text>
      <text x="50" y="63" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="var(--font-dm-sans)">
        of {max} days
      </text>
    </svg>
  );
}

export function MetricCard({ data }: { data: MetricCardData }) {
  return (
    <motion.div variants={fadeInUp} className="glass p-5 flex flex-col items-center text-center gap-2">
      {data.type === "gauge" && data.gaugeMax && data.gaugeValue && data.gaugeColor ? (
        <RadialGauge value={data.gaugeValue} max={data.gaugeMax} color={data.gaugeColor} />
      ) : (
        <div className="font-mono text-3xl font-bold tracking-tight text-white">{data.value}</div>
      )}
      <div className="text-sm text-white-70 font-medium">{data.label}</div>
      {data.delta && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-critical font-semibold font-mono">{data.delta}</span>
          {data.deltaLabel && <span className="text-white-50">{data.deltaLabel}</span>}
        </div>
      )}
    </motion.div>
  );
}
