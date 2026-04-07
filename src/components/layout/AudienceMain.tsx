"use client";

import { useAudience } from "@/contexts/AudienceContext";
import type { ReactNode } from "react";

export function AudienceMain({ children }: { children: ReactNode }) {
  const { mode } = useAudience();
  return <main data-mode={mode}>{children}</main>;
}
