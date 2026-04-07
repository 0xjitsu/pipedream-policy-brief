"use client";

import { useAudience, type AudienceMode } from "@/contexts/AudienceContext";

const MODES: { key: AudienceMode; icon: string; label: string }[] = [
  { key: "executive", icon: "👔", label: "Exec" },
  { key: "analyst", icon: "📊", label: "Analyst" },
  { key: "public", icon: "🏠", label: "Public" },
];

export function AudienceToggle() {
  const { mode, setMode } = useAudience();

  return (
    <div
      className="inline-flex items-center rounded-lg bg-white-05 border border-white-08 p-0.5"
      role="radiogroup"
      aria-label="Content detail level"
    >
      {MODES.map((m) => (
        <button
          key={m.key}
          role="radio"
          aria-checked={mode === m.key}
          onClick={() => setMode(m.key)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-200 min-h-[32px] ${
            mode === m.key
              ? "bg-white-10 text-white shadow-sm"
              : "text-white-50 hover:text-white-70"
          }`}
        >
          <span aria-hidden="true" className="text-xs leading-none">{m.icon}</span>
          <span className="hidden sm:inline">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
