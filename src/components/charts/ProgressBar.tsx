"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  label: string;
  sublabel?: string;
  value: number;
  total: number;
}

export function ProgressBar({ label, sublabel, value, total }: ProgressBarProps) {
  const pct = Math.round((value / total) * 100);
  const color = pct >= 90 ? "#10B981" : pct >= 70 ? "#F59E0B" : "#EF4444";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white-70">
          {label}
          {sublabel && <span className="text-white-30 text-xs ml-1.5">({sublabel})</span>}
        </span>
        <span className="font-mono text-white font-medium">
          {value}/{total} <span className="text-white-50">({pct}%)</span>
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-white-05 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
