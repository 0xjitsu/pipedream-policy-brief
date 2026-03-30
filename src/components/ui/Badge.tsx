import type { Urgency } from "@/data/types";

const urgencyStyles: Record<Urgency, string> = {
  critical: "bg-critical-bg text-critical border-critical/30",
  urgent: "bg-urgent-bg text-urgent border-urgent/30",
  important: "bg-important-bg text-important border-important/30",
  info: "bg-info-bg text-info border-info/30",
  strategic: "bg-strategic-bg text-strategic border-strategic/30",
};

const urgencyLabels: Record<Urgency, string> = {
  critical: "Critical",
  urgent: "Urgent",
  important: "Important",
  info: "Important",
  strategic: "Strategic",
};

export function Badge({ urgency, label }: { urgency: Urgency; label?: string }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${urgencyStyles[urgency]}`}>
      {label ?? urgencyLabels[urgency]}
    </span>
  );
}
