"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";

interface ExpandableCardProps {
  title: string;
  badge?: { text: string; color: string };
  defaultExpanded?: boolean;
  accentColor?: string;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
}

const badgeColors: Record<string, string> = {
  critical: "bg-critical-bg text-critical border-critical/30",
  urgent: "bg-urgent-bg text-urgent border-urgent/30",
  important: "bg-important-bg text-important border-important/30",
  info: "bg-info-bg text-info border-info/30",
  strategic: "bg-strategic-bg text-strategic border-strategic/30",
  purple: "bg-purple-bg text-purple border-purple/30",
};

export function ExpandableCard({
  title,
  badge,
  defaultExpanded = false,
  accentColor,
  children,
  headerExtra,
}: ExpandableCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <motion.div
      variants={fadeInUp}
      className="glass overflow-hidden"
      style={accentColor ? { borderLeftColor: accentColor, borderLeftWidth: 3 } : undefined}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white-05 transition-colors"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-serif text-lg font-semibold text-white">{title}</h3>
          {badge && (
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeColors[badge.color] ?? "bg-white-05 text-white-70"}`}>
              {badge.text}
            </span>
          )}
          {headerExtra}
        </div>
        <motion.svg
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="shrink-0 ml-4"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
        </motion.svg>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-0">{children}</div>
        </div>
      </div>
    </motion.div>
  );
}
