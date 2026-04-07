"use client";

interface SectionCTAProps {
  text: string;
  href: string;
  variant?: "link" | "share";
}

const SITE_URL = "https://pipedream-policy-brief.vercel.app";

export function SectionCTA({ text, href, variant = "link" }: SectionCTAProps) {
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Pipedream Policy Brief",
        text: "The Philippines has 45 days of fuel left.",
        url: SITE_URL,
      }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(SITE_URL);
    }
  };

  if (variant === "share") {
    return (
      <div className="flex justify-center mt-6">
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white-70 rounded-full glass glass-hover hover:text-white transition-colors min-h-[40px]"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 6.5L8 3.5l3 3M8 3.5V11M3 13h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {text}
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-6">
      <a
        href={href}
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white-70 rounded-full glass glass-hover hover:text-white transition-colors min-h-[40px]"
      >
        {text}
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </a>
    </div>
  );
}
