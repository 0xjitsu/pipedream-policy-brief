"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  accentColor?: string;
}

export function GlassCard({ children, className = "", hover = false, accentColor }: GlassCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className={`glass ${hover ? "glass-hover cursor-pointer" : ""} p-6 ${className}`}
      style={accentColor ? { borderLeftColor: accentColor, borderLeftWidth: 3 } : undefined}
    >
      {children}
    </motion.div>
  );
}
