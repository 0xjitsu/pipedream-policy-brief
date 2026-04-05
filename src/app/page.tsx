import dynamic from "next/dynamic";
import { Nav } from "@/components/layout/Nav";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { Footer } from "@/components/layout/Footer";

const CrisisOverview = dynamic(() =>
  import("@/components/sections/CrisisOverview").then((m) => ({ default: m.CrisisOverview }))
);
const EconomicScenarios = dynamic(() =>
  import("@/components/sections/EconomicScenarios").then((m) => ({ default: m.EconomicScenarios }))
);
const DistributionChannels = dynamic(() =>
  import("@/components/sections/DistributionChannels").then((m) => ({ default: m.DistributionChannels }))
);
const PolicyPillars = dynamic(() =>
  import("@/components/sections/PolicyPillars").then((m) => ({ default: m.PolicyPillars }))
);
const AntiRecommendations = dynamic(() =>
  import("@/components/sections/AntiRecommendations").then((m) => ({ default: m.AntiRecommendations }))
);
const ActionTimeline = dynamic(() =>
  import("@/components/sections/ActionTimeline").then((m) => ({ default: m.ActionTimeline }))
);
const Infrastructure = dynamic(() =>
  import("@/components/sections/Infrastructure").then((m) => ({ default: m.Infrastructure }))
);
const StationTracker = dynamic(() =>
  import("@/components/sections/StationTracker").then((m) => ({ default: m.StationTracker }))
);
const NewsFeed = dynamic(() =>
  import("@/components/sections/NewsFeed").then((m) => ({ default: m.NewsFeed }))
);
const References = dynamic(() =>
  import("@/components/sections/References").then((m) => ({ default: m.References }))
);

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Nav />

      {/* Hero header */}
      <header className="pt-24 pb-8 md:pt-28 md:pb-12 border-b border-white-08">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-white-50 mb-4">
            Pipedream · Policy Brief
          </p>
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Navigating the Energy Emergency
          </h1>
          <p className="mt-4 text-base md:text-lg text-white-50 max-w-2xl mx-auto">
            Supply security, market stability, and targeted relief for the Philippine fuel crisis
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
        <div className="border-t border-white-08" />
        <StationTracker />
        <div className="border-t border-white-08" />
        <NewsFeed />
        <div className="border-t border-white-08" />
        <References />
      </main>

      <Footer />
    </>
  );
}
