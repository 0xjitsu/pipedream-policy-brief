const ROUTES = [
  { label: "For executives", target: "#pillars", icon: "👔" },
  { label: "For implementors", target: "#channels", icon: "🔧" },
  { label: "For the public", target: "#impact", icon: "🏠" },
];

export function ReadingGuide() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="glass p-5 text-center">
        <p className="text-sm text-white-70 leading-relaxed">
          This brief moves from{" "}
          <span className="font-semibold text-white">Problem</span> (crisis, impact, scenarios) to{" "}
          <span className="font-semibold text-white">Solution</span> (channels, pillars, legislation) to{" "}
          <span className="font-semibold text-white">Execution</span> (timeline, infrastructure, tracker).
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {ROUTES.map((r) => (
            <a
              key={r.target}
              href={r.target}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white-70 rounded-lg bg-white-05 border border-white-08 hover:bg-white-10 hover:text-white transition-colors min-h-[36px]"
            >
              <span aria-hidden="true">{r.icon}</span>
              {r.label} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
