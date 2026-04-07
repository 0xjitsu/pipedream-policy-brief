"use client";

import { useEffect, useRef, useState } from "react";
import { metrics } from "@/data/crisis-overview";

const SUPPLY = metrics[0]; // Days of Supply metric

export function SupplyCountdown() {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const target = SUPPLY.gaugeValue ?? 45;
  const max = SUPPLY.gaugeMax ?? 65;
  const pct = Math.round((target / max) * 100);

  // Determine color based on severity
  const color = target <= 20 ? "#EF4444" : target <= 40 ? "#F97316" : "#F59E0B";

  useEffect(() => {
    // Respect reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setCount(target);
      return;
    }

    let start: number | null = null;
    const duration = 1500; // 1.5s

    function animate(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    }

    // Use IntersectionObserver to trigger on visibility
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="mb-6">
      {/* Large countdown number */}
      <div className="flex items-baseline justify-center gap-2">
        <span
          className="font-mono text-6xl md:text-8xl lg:text-9xl font-bold leading-none"
          style={{ color, fontVariantNumeric: "tabular-nums" }}
        >
          {count}
        </span>
      </div>

      {/* Label */}
      <p className="text-sm md:text-base text-white-50 font-mono uppercase tracking-[0.2em] mt-2">
        days of fuel left
      </p>

      {/* Progress bar */}
      <div className="mt-4 mx-auto max-w-xs">
        <div className="h-1.5 rounded-full bg-white-08 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${pct}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] font-mono text-white-30">
          <span>0 days</span>
          <span>DOE min: 15</span>
          <span>{max} days</span>
        </div>
      </div>
    </div>
  );
}
