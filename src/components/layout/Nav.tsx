"use client";

import { useState } from "react";
import { useScrollSpy } from "@/hooks/useScrollSpy";

const sections = [
  { id: "crisis", label: "Crisis Overview", short: "Crisis", icon: "🚨" },
  { id: "scenarios", label: "Scenarios", short: "Scenarios", icon: "📊" },
  { id: "channels", label: "Distribution Channels", short: "Channels", icon: "🛢️" },
  { id: "pillars", label: "Policy Pillars", short: "Pillars", icon: "🏛️" },
  { id: "anti-recs", label: "Not Recommended", short: "Don'ts", icon: "⛔" },
  { id: "timeline", label: "Action Timeline", short: "Timeline", icon: "📅" },
  { id: "infrastructure", label: "Infrastructure", short: "Infra", icon: "🏗️" },
  { id: "tracker", label: "Station Tracker", short: "Tracker", icon: "📍" },
  { id: "news", label: "Live News", short: "News", icon: "📰" },
  { id: "references", label: "References", short: "Refs", icon: "📚" },
  { id: "roadmap", label: "What's Next", short: "Next", icon: "🗺️" },
];

export function Nav() {
  const activeId = useScrollSpy(sections.map((s) => s.id));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav aria-label="Primary navigation" className="fixed top-0 left-0 right-0 z-50 bg-navy/90 backdrop-blur-md border-b border-white-08">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-2 h-2 rounded-full bg-strategic" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-white-70">
              Pipedream
            </span>
            <span className="hidden sm:inline text-white-20">|</span>
            <span className="hidden sm:inline text-xs text-white-50">Policy Brief</span>
            {/* LIVE badge -- shows when market data is streaming */}
            <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 rounded-md border border-[#10B981]/20 bg-[#10B981]/10 px-2 py-0.5 text-[10px] font-mono tracking-wider text-[#10B981]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              </span>
              LIVE
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden xl:flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeId === s.id
                    ? "bg-white-10 text-white"
                    : "text-white-70 hover:text-white-90 hover:bg-white-05"
                }`}
              >
                <span aria-hidden="true" className="text-sm leading-none">{s.icon}</span>
                {s.short}
              </a>
            ))}
          </div>

          {/* Mobile/tablet hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="xl:hidden p-2.5 min-h-[44px] min-w-[44px] text-white-70 hover:text-white flex items-center justify-center"
            aria-label="Toggle navigation"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              {mobileOpen ? (
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M3 5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile/tablet dropdown */}
      {mobileOpen && (
        <div className="xl:hidden border-t border-white-08 bg-navy/95 backdrop-blur-md">
          <div className="px-4 py-2 space-y-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 text-sm rounded-md transition-colors ${
                  activeId === s.id
                    ? "bg-white-10 text-white border-l-2 border-strategic"
                    : "text-white-70 hover:text-white-90 hover:bg-white-05 border-l-2 border-transparent"
                }`}
              >
                <span aria-hidden="true" className="text-base leading-none">{s.icon}</span>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
