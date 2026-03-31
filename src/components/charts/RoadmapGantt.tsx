"use client";

import { motion } from "framer-motion";
import { staggerContainer, slideInLeft } from "@/lib/motion";

interface RoadmapItem {
  week: string;
  task: string;
}

interface RoadmapGanttProps {
  items: RoadmapItem[];
  accentColor: string;
}

// Parse week string into grid column start/end
function parseWeekRange(week: string): { start: number; end: number } {
  const lower = week.toLowerCase();

  if (lower.includes("ongoing")) return { start: 5, end: 6 };

  // Match patterns like "Week 1", "Week 2-3", "Week 2–3", "Week 3-4"
  const rangeMatch = lower.match(/week\s*(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) {
    return { start: parseInt(rangeMatch[1]), end: parseInt(rangeMatch[2]) + 1 };
  }

  const singleMatch = lower.match(/week\s*(\d+)/);
  if (singleMatch) {
    const n = parseInt(singleMatch[1]);
    return { start: n, end: n + 1 };
  }

  return { start: 1, end: 2 };
}

// Opacity gradient: earlier phases lighter, later phases bolder
function getOpacity(start: number): string {
  if (start <= 1) return "60";
  if (start <= 2) return "80";
  if (start <= 3) return "A0";
  if (start <= 4) return "C0";
  return "90"; // ongoing
}

export function RoadmapGantt({ items, accentColor }: RoadmapGanttProps) {
  const columns = ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Ongoing"];

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-white-50 mb-3">Implementation Roadmap</h4>

      {/* Desktop: Gantt chart */}
      <div className="hidden md:block">
        {/* Column headers */}
        <div className="grid grid-cols-5 gap-1 mb-2">
          {columns.map((col) => (
            <div key={col} className="text-[10px] font-mono text-white-30 text-center uppercase">
              {col}
            </div>
          ))}
        </div>

        {/* Task bars */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-1.5"
        >
          {items.map((item, i) => {
            const { start, end } = parseWeekRange(item.week);
            const opacity = getOpacity(start);

            return (
              <motion.div key={i} variants={slideInLeft} className="grid grid-cols-5 gap-1 items-center">
                {/* Empty cells before the bar */}
                {start > 1 && <div style={{ gridColumn: `1 / ${start}` }} />}

                {/* The bar */}
                <div
                  className="rounded px-2 py-1.5 min-h-[28px] flex items-center"
                  style={{
                    gridColumn: `${start} / ${end}`,
                    backgroundColor: accentColor + opacity,
                    borderLeft: `2px solid ${accentColor}`,
                  }}
                >
                  <span className="text-[10px] text-white leading-tight line-clamp-2">
                    {item.task}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Mobile: vertical timeline (existing pattern) */}
      <div className="md:hidden space-y-0">
        {items.map((step, i) => (
          <div key={i} className="flex gap-4 pb-4 relative">
            {i < items.length - 1 && (
              <div
                className="absolute left-[7px] top-[18px] w-0.5 h-full opacity-30"
                style={{ backgroundColor: accentColor }}
              />
            )}
            <div
              className="w-4 h-4 rounded-full shrink-0 mt-0.5 relative z-10 border-2"
              style={{
                borderColor: accentColor,
                backgroundColor: accentColor + "33",
              }}
            />
            <div>
              <div className="text-xs font-semibold font-mono" style={{ color: accentColor }}>
                {step.week}
              </div>
              <div className="text-sm text-white-70 mt-0.5">{step.task}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
