"use client";

import { useAudience, type AudienceMode } from "@/contexts/AudienceContext";

const MODES: { key: AudienceMode; icon: string; label: string; accent: string }[] = [
  { key: "executive", icon: "👔", label: "Exec", accent: "#F59E0B" },
  { key: "analyst", icon: "📊", label: "Analyst", accent: "#3B82F6" },
  { key: "public", icon: "🏠", label: "Public", accent: "#10B981" },
];

export function AudienceToggle() {
  const { mode, setMode } = useAudience();

  const activeIndex = MODES.findIndex((m) => m.key === mode);
  const activeAccent = MODES[activeIndex]?.accent ?? "#3B82F6";

  return (
    <div
      className="audience-toggle"
      role="radiogroup"
      aria-label="Content detail level"
      style={{ "--toggle-accent": activeAccent, "--toggle-index": activeIndex } as React.CSSProperties}
    >
      {/* Sliding pill — CSS-only positioning via --toggle-index */}
      <div
        className="audience-toggle-pill"
        aria-hidden="true"
        style={{
          background: `linear-gradient(135deg, ${activeAccent}25, ${activeAccent}12)`,
          borderColor: `${activeAccent}50`,
          boxShadow: `0 0 16px ${activeAccent}20, inset 0 1px 0 ${activeAccent}15`,
        }}
      />

      {MODES.map((m) => {
        const isActive = mode === m.key;
        return (
          <button
            key={m.key}
            role="radio"
            aria-checked={isActive}
            aria-label={`Switch to ${m.label} view`}
            onClick={() => setMode(m.key)}
            className={`audience-toggle-btn ${isActive ? "audience-toggle-btn--active" : ""}`}
            style={isActive ? { color: m.accent } : undefined}
          >
            <span aria-hidden="true" className="audience-toggle-icon">{m.icon}</span>
            <span className="audience-toggle-label">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
