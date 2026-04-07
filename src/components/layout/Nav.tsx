"use client";

import { useState } from "react";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { AudienceToggle } from "@/components/ui/AudienceToggle";

const sections = [
  { id: "crisis", label: "Crisis Overview", short: "Crisis", icon: "🚨" },
  { id: "impact", label: "Human Impact", short: "Impact", icon: "👤" },
  { id: "scenarios", label: "Scenarios", short: "Scenarios", icon: "📊" },
  { id: "channels", label: "Distribution Channels", short: "Channels", icon: "🛢️" },
  { id: "pillars", label: "Policy Pillars", short: "Pillars", icon: "🏛️" },
  { id: "anti-recs", label: "Not Recommended", short: "Don'ts", icon: "⛔" },
  { id: "legislation", label: "Legislative Tracker", short: "Bills", icon: "⚖️" },
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
    <nav
      aria-label="Primary navigation"
      className="fixed top-0 left-0 right-0 z-50 bg-navy/90 backdrop-blur-md border-b border-white-08"
    >
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center h-14 gap-3">

          {/* ─── Logo ─── */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-2 h-2 rounded-full bg-strategic" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white-70">
              Pipedream
            </span>
            <span className="hidden sm:inline text-white-20 text-xs">|</span>
            <span className="hidden sm:inline text-[11px] text-white-50">Policy Brief</span>

            {/* LIVE badge */}
            <span className="hidden sm:inline-flex items-center gap-1.5 ml-1 rounded-md border border-[#10B981]/20 bg-[#10B981]/10 px-1.5 py-0.5 text-[9px] font-mono tracking-wider text-[#10B981]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              </span>
              LIVE
            </span>
          </div>

          {/* ─── Separator ─── */}
          <div className="hidden lg:block w-px h-6 bg-white-10 shrink-0" />

          {/* ─── Audience toggle (desktop) ─── */}
          <div className="hidden md:block shrink-0">
            <AudienceToggle />
          </div>

          {/* ─── Separator ─── */}
          <div className="hidden xl:block w-px h-6 bg-white-10 shrink-0" />

          {/* ─── Section links (desktop — scrollable) ─── */}
          <div className="hidden xl:flex nav-sections flex-1 min-w-0">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`nav-link ${activeId === s.id ? "nav-link--active" : ""}`}
              >
                <span aria-hidden="true" className="nav-link-icon">{s.icon}</span>
                {s.short}
              </a>
            ))}
          </div>

          {/* ─── Spacer (pushes hamburger right) ─── */}
          <div className="flex-1 xl:hidden" />

          {/* ─── Mobile hamburger ─── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="xl:hidden p-2.5 min-h-[44px] min-w-[44px] text-white-70 hover:text-white flex items-center justify-center rounded-lg hover:bg-white-05 transition-colors"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
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

      {/* ─── Mobile/tablet dropdown ─── */}
      {mobileOpen && (
        <div className="xl:hidden border-t border-white-08 bg-navy/95 backdrop-blur-md max-h-[70vh] overflow-y-auto relative z-50">
          {/* Audience toggle (mobile) */}
          <div className="px-4 pt-3 pb-2 border-b border-white-08">
            <p className="text-[10px] font-mono uppercase tracking-widest text-white-50 mb-2">View Mode</p>
            <AudienceToggle />
          </div>

          {/* Section links */}
          <div className="px-3 py-2 space-y-0.5">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  activeId === s.id
                    ? "bg-white-10 text-white border-l-2 border-strategic"
                    : "text-white-60 hover:text-white-90 hover:bg-white-05 border-l-2 border-transparent"
                }`}
              >
                <span aria-hidden="true" className="text-sm leading-none">{s.icon}</span>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
