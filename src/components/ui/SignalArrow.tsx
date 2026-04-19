interface SignalArrowProps {
  direction: "up" | "down" | "stable";
  /** Flip semantics: "up" is bad (e.g. for pump price, oil cost). Default false. */
  upIsBad?: boolean;
  label?: string;
}

/**
 * Small arrow + label showing the trajectory of a metric today.
 * Color coded by whether "up" is good or bad for the semantic metric.
 */
export function SignalArrow({ direction, upIsBad = false, label }: SignalArrowProps) {
  const isNeutral = direction === "stable";
  const isBad = !isNeutral && (direction === "up") === upIsBad;
  const color = isNeutral
    ? "text-white-60"
    : isBad
      ? "text-critical"
      : "text-strategic";

  const glyph = direction === "up" ? "↑" : direction === "down" ? "↓" : "→";

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-mono ${color}`}
      aria-label={`${label ?? "Metric"} trending ${direction}`}
    >
      <span aria-hidden="true">{glyph}</span>
      {label && <span className="text-white-70">{label}</span>}
    </span>
  );
}
