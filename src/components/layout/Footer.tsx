// src/components/layout/Footer.tsx
"use client";

import { useState } from "react";
import { useMarketData } from "@/hooks/useMarketData";

const SITE_URL = "https://pipedream-policy-brief.vercel.app";
const SHARE_TEXT = "The Philippines has 45 days of fuel left. This policy brief explains what must happen next.";

export function Footer() {
  const { lastUpdated } = useMarketData();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SITE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SITE_URL)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`;

  return (
    <footer className="border-t border-white-08 py-10 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Left — info */}
            <div className="space-y-2">
              <p className="text-sm text-white-70 font-medium">Research &amp; data by Pipedream</p>
              <p className="text-xs text-white-30">Published March 30, 2026</p>
              {lastUpdated && (
                <p className="text-xs text-white-30">
                  Data as of{" "}
                  {lastUpdated.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{" "}
                  {lastUpdated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} PHT
                </p>
              )}
              <div className="flex items-center gap-3 pt-1">
                <a
                  href="mailto:hello@pipedream.ph"
                  className="text-xs text-white-40 hover:text-white-70 underline underline-offset-2 decoration-white-20 transition-colors"
                >
                  hello@pipedream.ph
                </a>
                <span className="text-white-10">·</span>
                <a
                  href="https://github.com/0xjitsu/pipedream-policy-brief/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white-40 hover:text-white-70 underline underline-offset-2 decoration-white-20 transition-colors"
                >
                  Discussions
                </a>
              </div>
            </div>

            {/* Right — links + share */}
            <div className="space-y-3 md:text-right">
              {/* Share row */}
              <div className="flex items-center gap-2 md:justify-end">
                <span className="text-[10px] uppercase tracking-wider text-white-30 mr-1">Share</span>
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Twitter/X"
                  className="w-8 h-8 rounded-md bg-white-05 border border-white-08 flex items-center justify-center text-white-40 hover:text-white hover:bg-white-10 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on LinkedIn"
                  className="w-8 h-8 rounded-md bg-white-05 border border-white-08 flex items-center justify-center text-white-40 hover:text-white hover:bg-white-10 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
                <button
                  onClick={handleCopy}
                  aria-label="Copy link"
                  className="w-8 h-8 rounded-md bg-white-05 border border-white-08 flex items-center justify-center text-white-40 hover:text-white hover:bg-white-10 transition-colors"
                >
                  {copied ? (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8l3 3 7-7" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-2M8 12V8m0 0l-2.5 2.5M8 8l2.5 2.5M14 7V3a1 1 0 00-1-1h-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                </button>
              </div>

              {/* Existing links */}
              <div className="flex items-center gap-3 text-xs text-white-30 md:justify-end">
                <a
                  href="https://github.com/0xjitsu/pipedream-policy-brief"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white-50 transition-colors"
                >
                  Source
                </a>
                <span className="text-white-10">·</span>
                <span>AGPL-3.0</span>
                <span className="text-white-10">·</span>
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white-50 transition-colors"
                >
                  llms.txt
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
