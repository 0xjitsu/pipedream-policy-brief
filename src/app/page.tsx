"use client";

import { Nav } from "@/components/layout/Nav";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { Footer } from "@/components/layout/Footer";
import { CrisisOverview } from "@/components/sections/CrisisOverview";
import { EconomicScenarios } from "@/components/sections/EconomicScenarios";
import { DistributionChannels } from "@/components/sections/DistributionChannels";
import { PolicyPillars } from "@/components/sections/PolicyPillars";
import { AntiRecommendations } from "@/components/sections/AntiRecommendations";
import { ActionTimeline } from "@/components/sections/ActionTimeline";
import { Infrastructure } from "@/components/sections/Infrastructure";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Nav />

      {/* Hero header */}
      <header className="pt-24 pb-8 md:pt-28 md:pb-12 border-b border-white-08">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-white-50 mb-4">
            Makati Business Club · Policy Brief
          </p>
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Navigating the Energy Emergency
          </h1>
          <p className="mt-4 text-base md:text-lg text-white-50 max-w-2xl mx-auto">
            Policy recommendations for the Philippine fuel crisis
          </p>
          <p className="mt-3 text-xs text-white-20 font-mono">
            March 30, 2026 · Submitted to UPLIFT Committee, DOE, and DOF
          </p>
        </div>
      </header>

      <main>
        <CrisisOverview />
        <div className="border-t border-white-08" />
        <EconomicScenarios />
        <div className="border-t border-white-08" />
        <DistributionChannels />
        <div className="border-t border-white-08" />
        <PolicyPillars />
        <div className="border-t border-white-08" />
        <AntiRecommendations />
        <div className="border-t border-white-08" />
        <ActionTimeline />
        <div className="border-t border-white-08" />
        <Infrastructure />
      </main>

      <Footer />
    </>
  );
}
