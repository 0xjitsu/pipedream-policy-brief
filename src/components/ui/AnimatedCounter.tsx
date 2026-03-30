"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

function parseNumeric(val: string): { prefix: string; number: number; suffix: string } | null {
  const match = val.match(/^([^\d]*?)([\d,.]+)(.*)$/);
  if (!match) return null;
  return {
    prefix: match[1],
    number: parseFloat(match[2].replace(/,/g, "")),
    suffix: match[3],
  };
}

export function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const parsedValue = parseNumeric(value);
    if (!parsedValue || animated.current) return;
    const parsed = parsedValue;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const start = performance.now();
          const duration = 1200;
          const target = parsed.number;

          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);

            // Format with same structure as original
            let formatted = current.toString();
            if (value.includes(",")) {
              formatted = current.toLocaleString();
            }
            setDisplay(`${parsed.prefix}${formatted}${parsed.suffix}`);

            if (progress < 1) {
              requestAnimationFrame(tick);
            } else {
              setDisplay(value);
            }
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className={className}>
      {display}
    </div>
  );
}
