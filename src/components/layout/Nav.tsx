"use client";

import { useState } from "react";
import { useScrollSpy } from "@/hooks/useScrollSpy";

const sections = [
  { id: "crisis", label: "Crisis Overview" },
  { id: "scenarios", label: "Scenarios" },
  { id: "channels", label: "Distribution Channels" },
  { id: "pillars", label: "Policy Pillars" },
  { id: "anti-recs", label: "Not Recommended" },
  { id: "timeline", label: "Action Timeline" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "tracker", label: "Station Tracker" },
  { id: "news", label: "Live News" },
  { id: "references", label: "References" },
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
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeId === s.id
                    ? "bg-white-10 text-white"
                    : "text-white-70 hover:text-white-90 hover:bg-white-05"
                }`}
              >
                {s.label}
              </a>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] text-white-70 hover:text-white flex items-center justify-center"
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

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white-08 bg-navy/95 backdrop-blur-md">
          <div className="px-4 py-2 space-y-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-3 text-sm rounded-md ${
                  activeId === s.id ? "bg-white-10 text-white" : "text-white-70"
                }`}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
