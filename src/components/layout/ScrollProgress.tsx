"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="scroll-progress fixed top-0 left-0 right-0 z-[60] h-0.5">
      <div
        className="h-full bg-gradient-to-r from-info via-strategic to-important transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
