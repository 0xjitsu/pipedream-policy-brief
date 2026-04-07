const BULLETS = [
  "The Philippines has ~45 days of fuel supply remaining, with no confirmed resupply beyond May 2026.",
  "Inaction risks stagflation: ₱130+/L diesel is already driving 4.2% transport-cost inflation.",
  "Recommended response: PriceLOCQ digital subsidy + Strategic Petroleum Reserve + G2G supply contracts.",
  "Read the brief. Share it with your legislator.",
];

export function ExecutiveSummary() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="glass border-l-3 border-l-important p-5 md:p-6">
        <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-important mb-3">
          TL;DR
        </h2>
        <ul className="space-y-2">
          {BULLETS.map((b, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-important font-mono text-xs mt-0.5 shrink-0">{i + 1}.</span>
              <p className={`text-sm leading-relaxed ${i === BULLETS.length - 1 ? "text-white font-semibold" : "text-white-70"}`}>
                {b}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
