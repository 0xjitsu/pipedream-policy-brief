"use client";

import { motion } from "framer-motion";

interface ReadinessMetersProps {
  fiscalEstimate: string;
  readiness: string;
  accentColor: string;
}

function parseReadinessPercent(readiness: string): number {
  const lower = readiness.toLowerCase();
  if (lower.startsWith("high")) return 90;
  if (lower.includes("medium-high")) return 75;
  if (lower.startsWith("medium")) return 60;
  if (lower.startsWith("low")) return 30;
  return 50;
}

// Extract numeric fiscal value for the mini-bar (normalize to 0-100 against ₱6.5B max)
function parseFiscalMax(estimate: string): number {
  // Look for patterns like "₱2–4B", "₱500M–1.5B", "₱6.5B"
  const billions = estimate.match(/(\d+\.?\d*)\s*B/gi);
  if (billions && billions.length > 0) {
    const lastMatch = billions[billions.length - 1];
    const val = parseFloat(lastMatch);
    return Math.min((val / 6.5) * 100, 100);
  }
  const millions = estimate.match(/(\d+\.?\d*)\s*M/gi);
  if (millions) return 10; // sub-billion is small
  return 50;
}

export function ReadinessMeters({ fiscalEstimate, readiness, accentColor }: ReadinessMetersProps) {
  const readinessPercent = parseReadinessPercent(readiness);
  const fiscalPercent = parseFiscalMax(fiscalEstimate);

  // SVG semi-arc params
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // half circle
  const readinessOffset = circumference - (readinessPercent / 100) * circumference;

  return (
    <div className="flex flex-wrap gap-4">
      {/* Readiness gauge */}
      <div className="glass px-4 py-3 flex items-center gap-3">
        <div className="relative" style={{ width: size, height: size / 2 + 8 }}>
          <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
            {/* Background arc */}
            <path
              d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Filled arc */}
            <motion.path
              d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
              fill="none"
              stroke={accentColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              whileInView={{ strokeDashoffset: readinessOffset }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            />
          </svg>
          {/* Percentage label */}
          <div className="absolute inset-0 flex items-end justify-center pb-0">
            <span className="text-xs font-mono font-bold text-white">{readinessPercent}%</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-white-50 uppercase tracking-wider">Readiness</div>
          <div className="text-sm text-white font-semibold">{readiness.split("—")[0].trim()}</div>
        </div>
      </div>

      {/* Fiscal cost bar */}
      <div className="glass px-4 py-3 flex-1 min-w-[200px]">
        <div className="text-[10px] text-white-50 uppercase tracking-wider mb-1.5">Fiscal Cost</div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 rounded-full bg-white/8 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: accentColor }}
              initial={{ width: 0 }}
              whileInView={{ width: `${fiscalPercent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            />
          </div>
          <span className="text-sm font-mono font-semibold text-white shrink-0">{fiscalEstimate}</span>
        </div>
        <div className="text-[10px] text-white-20 mt-1">relative to ₱6.5B/round (Channel 3)</div>
      </div>
    </div>
  );
}
