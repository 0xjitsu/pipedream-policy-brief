"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";
import { FreshnessBadge } from "@/components/ui/FreshnessBadge";
import type { FreshnessTier } from "@/data/freshness";

interface SectionWrapperProps {
  id: string;
  title: string;
  icon?: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Data freshness tier — renders a small badge next to the section title */
  tier?: FreshnessTier;
  /** Timestamp of last update (used by FreshnessBadge for relative time) */
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
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white">
              {icon && <span className="mr-3" aria-hidden="true">{icon}</span>}
              {title}
            </h2>
            {tier && (
              <FreshnessBadge tier={tier} timestamp={tierTimestamp} size="sm" />
            )}
          </div>
          {subtitle && <p className="mt-2 text-white-50 text-sm md:text-base">{subtitle}</p>}
        </motion.div>
        {children}
      </motion.div>
    </section>
  );
}
