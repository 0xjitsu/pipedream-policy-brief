"use client";

import { useState, useEffect } from "react";

const SITE_URL = "https://pipedream-policy-brief.vercel.app";
const SHARE_TEXT = "The Philippines has 45 days of fuel left. This policy brief explains what must happen next.";

export function ShareBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("share-bar-dismissed") === "true") {
      setDismissed(true);
      return;
    }

    const hero = document.querySelector("header");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("share-bar-dismissed", "true");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SITE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SITE_URL)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 hidden sm:block transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="glass border-t border-white-10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-xs text-white-50">Share this brief with decision-makers</p>
          <div className="flex items-center gap-2">
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Twitter/X"
              className="px-3 py-1.5 text-xs rounded-md bg-white-05 border border-white-08 text-white-50 hover:text-white hover:bg-white-10 transition-colors min-h-[36px] inline-flex items-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              Post
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on LinkedIn"
              className="px-3 py-1.5 text-xs rounded-md bg-white-05 border border-white-08 text-white-50 hover:text-white hover:bg-white-10 transition-colors min-h-[36px] inline-flex items-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              Share
            </a>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs rounded-md bg-white-05 border border-white-08 text-white-50 hover:text-white hover:bg-white-10 transition-colors min-h-[36px] inline-flex items-center gap-1.5"
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss share bar"
              className="ml-2 text-white-30 hover:text-white-50 transition-colors p-1"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
