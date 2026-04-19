"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface FadeInOnViewProps {
  children: ReactNode;
  /** Extra className passthrough */
  className?: string;
  /** Scroll root margin for the observer (default "-80px") */
  rootMargin?: string;
}

/**
 * Lightweight fade-in-on-scroll wrapper. Uses CSS transitions + a single
 * IntersectionObserver — zero animation-library overhead.
 *
 * Respects prefers-reduced-motion via the CSS media query on .fade-in-view.
 */
export function FadeInOnView({
  children,
  className = "",
  rootMargin = "-80px",
}: FadeInOnViewProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={`fade-in-view ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
