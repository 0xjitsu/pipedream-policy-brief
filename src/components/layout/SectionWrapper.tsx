"use client";

import { FadeInOnView } from "@/components/ui/FadeInOnView";
import { FreshnessBadge } from "@/components/ui/FreshnessBadge";
import type { FreshnessTier } from "@/data/freshness";

interface SectionWrapperProps {
  id: string;
  title: string;
  icon?: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  tier?: FreshnessTier;
  tierTimestamp?: Date | string | null;
}

export function SectionWrapper({
  id,
  title,
  icon,
  subtitle,
  children,
  className = "",
  tier,
  tierTimestamp,
}: SectionWrapperProps) {
  return (
    <section id={id} className={`scroll-mt-32 py-12 md:py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInOnView className="mb-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white">
              {icon && (
                <span className="mr-3" aria-hidden="true">
                  {icon}
                </span>
              )}
              {title}
            </h2>
            {tier && (
              <FreshnessBadge tier={tier} timestamp={tierTimestamp} size="sm" />
            )}
          </div>
          {subtitle && (
            <p className="mt-2 text-white-50 text-sm md:text-base">{subtitle}</p>
          )}
        </FadeInOnView>
        {children}
      </div>
    </section>
  );
}
