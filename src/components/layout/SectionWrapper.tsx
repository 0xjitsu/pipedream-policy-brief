"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";

interface SectionWrapperProps {
  id: string;
  title: string;
  icon?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionWrapper({ id, title, icon, subtitle, children, className = "" }: SectionWrapperProps) {
  return (
    <section id={id} className={`scroll-mt-24 py-12 md:py-16 ${className}`}>
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
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-white">
            {icon && <span className="mr-3" aria-hidden="true">{icon}</span>}
            {title}
          </h2>
          {subtitle && <p className="mt-2 text-white-50 text-sm md:text-base">{subtitle}</p>}
        </motion.div>
        {children}
      </motion.div>
    </section>
  );
}
