"use client";

import { useId } from "react";
import { TOOLTIPS } from "@/data/tooltips";

interface MetricTooltipProps {
  term: string;
  children: React.ReactNode;
}

export function MetricTooltip({ term, children }: MetricTooltipProps) {
  const id = useId();
  const explanation = TOOLTIPS[term];
  if (!explanation) return <>{children}</>;

  const popoverId = `tooltip-${id}`;

  return (
    <span className="inline-flex items-center gap-1">
      {children}
      <button
        popoverTarget={popoverId}
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white-10 text-white-30 text-[8px] font-bold hover:bg-white-20 hover:text-white-50 transition-colors cursor-help"
        aria-label={`More info about ${term}`}
      >
        ?
      </button>
      <div
        id={popoverId}
        popover="auto"
        className="glass p-3 max-w-[240px] text-xs text-white-70 leading-relaxed rounded-lg"
      >
        {explanation}
      </div>
    </span>
  );
}
