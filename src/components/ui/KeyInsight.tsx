import type { InsightData } from "@/data/insights";

export function KeyInsight({ text, source, sourceUrl }: InsightData) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="glass border-l-3 border-l-important p-4 flex items-start gap-3">
        <span className="text-lg shrink-0 mt-0.5" aria-hidden="true">💡</span>
        <div>
          <p className="text-sm text-white-70 leading-relaxed">{text}</p>
          {source && (
            <p className="mt-2 text-[10px] text-white-30">
              Source:{" "}
              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 decoration-white-20 hover:text-white-50 transition-colors"
                >
                  {source}
                </a>
              ) : (
                source
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
