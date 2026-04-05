"use client";

import { useState } from "react";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { useNewsFeed } from "@/hooks/useNewsFeed";
import type { NewsSeverity, NewsSourceType } from "@/data/types";

const SEVERITY_COLORS: Record<NewsSeverity, string> = {
  red: "bg-[#EF4444]",
  yellow: "bg-[#F59E0B]",
  green: "bg-[#10B981]",
};

const SEVERITY_GLOW: Record<NewsSeverity, string> = {
  red: "shadow-[0_0_8px_rgba(239,68,68,0.5)]",
  yellow: "shadow-[0_0_8px_rgba(245,158,11,0.4)]",
  green: "shadow-[0_0_8px_rgba(16,185,129,0.4)]",
};

const SOURCE_COLORS: Record<NewsSourceType, string> = {
  news: "text-blue-400",
  government: "text-emerald-400",
  social: "text-purple-400",
  market: "text-yellow-400",
};

const SOURCE_BG: Record<NewsSourceType, string> = {
  news: "bg-blue-400/10 border-blue-400/20",
  government: "bg-emerald-400/10 border-emerald-400/20",
  social: "bg-purple-400/10 border-purple-400/20",
  market: "bg-yellow-400/10 border-yellow-400/20",
};

type SeverityFilter = "all" | NewsSeverity;
type SourceFilter = "all" | NewsSourceType;

const SEVERITY_FILTERS: { key: SeverityFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "red", label: "Critical" },
  { key: "yellow", label: "Watch" },
  { key: "green", label: "Positive" },
];

const SOURCE_FILTERS: { key: SourceFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "news", label: "News" },
  { key: "government", label: "Gov" },
  { key: "social", label: "Social" },
  { key: "market", label: "Market" },
];

export function NewsFeed() {
  const { events, isLive, lastUpdated } = useNewsFeed();
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const filtered = events.filter((e) => {
    if (severityFilter !== "all" && e.severity !== severityFilter) return false;
    if (sourceFilter !== "all" && e.sourceType !== sourceFilter) return false;
    return true;
  });

  return (
    <SectionWrapper
      id="news"
      title="Live News Feed"
      subtitle="Real-time energy crisis headlines from Philippine and global sources"
    >
      {/* Status + Filters */}
      <div className="mb-6 space-y-3">
        {/* Live status */}
        <div className="flex items-center gap-2 text-xs text-white-50">
          <div className={`w-2 h-2 rounded-full ${isLive ? "bg-[#10B981] animate-pulse" : "bg-white-20"}`} />
          <span>{isLive ? "Live" : "Static"}</span>
          {lastUpdated && (
            <span className="text-white-30">
              · Updated {lastUpdated.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {lastUpdated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>
          )}
          <span className="text-white-30">· {filtered.length} events</span>
        </div>

        {/* Severity filters */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-white-30 font-semibold self-center mr-1">Severity</span>
          {SEVERITY_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setSeverityFilter(f.key)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors border min-h-[44px] ${
                severityFilter === f.key
                  ? "bg-white-10 border-white-20 text-white"
                  : "border-transparent text-white-50 hover:bg-white-05 hover:text-white-70"
              }`}
            >
              {f.key !== "all" && (
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${SEVERITY_COLORS[f.key as NewsSeverity]} mr-1.5`} />
              )}
              {f.label}
            </button>
          ))}
        </div>

        {/* Source type filters */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-white-30 font-semibold self-center mr-1">Source</span>
          {SOURCE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setSourceFilter(f.key)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors border min-h-[44px] ${
                sourceFilter === f.key
                  ? "bg-white-10 border-white-20 text-white"
                  : "border-transparent text-white-50 hover:bg-white-05 hover:text-white-70"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] md:left-[19px] top-0 bottom-0 w-0.5 bg-white-08" />

        <div className="space-y-3">
          {filtered.map((event, i) => (
            <div
              key={`${event.source}-${event.date}-${i}`}
              className="relative pl-10 md:pl-12"
              style={{
                animation: `newsItemIn 0.3s ease-out ${i * 50}ms both`,
              }}
            >
              {/* Severity dot */}
              <div
                className={`absolute left-[8px] md:left-[12px] top-3 w-3 h-3 rounded-full ${SEVERITY_COLORS[event.severity]} ${SEVERITY_GLOW[event.severity]}`}
              />

              <div className="glass p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <a
                      href={event.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white-70 hover:text-white transition-colors leading-relaxed block"
                    >
                      {event.headline}
                    </a>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="font-mono text-[10px] text-white-30">{event.date}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${SOURCE_BG[event.sourceType]} ${SOURCE_COLORS[event.sourceType]}`}>
                      {event.source}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-sm text-white-30 text-center py-8">No events match the selected filters.</p>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
