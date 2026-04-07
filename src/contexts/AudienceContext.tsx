"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type AudienceMode = "executive" | "analyst" | "public";

interface AudienceContextValue {
  mode: AudienceMode;
  setMode: (mode: AudienceMode) => void;
}

const AudienceContext = createContext<AudienceContextValue>({
  mode: "analyst",
  setMode: () => {},
});

export function AudienceProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AudienceMode>("analyst");

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("pipedream-audience-mode") as AudienceMode | null;
    if (saved && ["executive", "analyst", "public"].includes(saved)) {
      setModeState(saved);
    }
  }, []);

  const setMode = (m: AudienceMode) => {
    setModeState(m);
    localStorage.setItem("pipedream-audience-mode", m);
  };

  return (
    <AudienceContext.Provider value={{ mode, setMode }}>
      {children}
    </AudienceContext.Provider>
  );
}

export function useAudience() {
  return useContext(AudienceContext);
}
