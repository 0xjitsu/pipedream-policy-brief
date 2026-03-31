"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/motion";

interface ProsConsChartProps {
  advantages: string[];
  risks: string[];
  accentColor: string;
}

export function ProsConsChart({ advantages, risks, accentColor }: ProsConsChartProps) {
  const maxBars = Math.max(advantages.length, risks.length);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-white-50">Advantages vs Risks</h4>
        <div className="flex gap-3 text-[10px] text-white-50">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: accentColor + "80" }} />
            +{advantages.length} advantages
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-critical/50" />
            –{risks.length} risks
          </span>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-1.5"
      >
        {/* Advantages */}
        {advantages.map((text, i) => {
          const barWidth = ((i + 1) / maxBars) * 100;
          return (
            <motion.div key={`adv-${i}`} variants={fadeInUp} className="flex items-start gap-3">
              <p className="text-xs text-white-70 leading-relaxed flex-1 min-w-0 py-0.5">{text}</p>
              <div className="w-[120px] md:w-[180px] shrink-0 flex items-center pt-0.5">
                <motion.div
                  className="h-3 rounded-r-sm"
                  style={{ backgroundColor: accentColor + "80", borderLeft: `2px solid ${accentColor}` }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${barWidth}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}

        {/* Divider */}
        <div className="border-t border-white-08 my-2" />

        {/* Risks */}
        {risks.map((text, i) => {
          const barWidth = ((i + 1) / maxBars) * 100;
          return (
            <motion.div key={`risk-${i}`} variants={fadeInUp} className="flex items-start gap-3">
              <p className="text-xs text-white-70 leading-relaxed flex-1 min-w-0 py-0.5">{text}</p>
              <div className="w-[120px] md:w-[180px] shrink-0 flex items-center pt-0.5">
                <motion.div
                  className="h-3 rounded-r-sm"
                  style={{ backgroundColor: "#EF444480", borderLeft: "2px solid #EF4444" }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${barWidth}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
