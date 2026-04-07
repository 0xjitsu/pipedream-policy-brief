import dynamic from "next/dynamic";
import { Nav } from "@/components/layout/Nav";
import { Ticker } from "@/components/ui/Ticker";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { Footer } from "@/components/layout/Footer";
import { CrisisOverview } from "@/components/sections/CrisisOverview";
import { SupplyCountdown } from "@/components/ui/SupplyCountdown";
import { AudienceProvider } from "@/contexts/AudienceContext";
import { AudienceMain } from "@/components/layout/AudienceMain";
import { BackToTop } from "@/components/ui/BackToTop";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { ReadingGuide } from "@/components/ui/ReadingGuide";
import { ExecutiveSummary } from "@/components/ui/ExecutiveSummary";
import { KeyInsight } from "@/components/ui/KeyInsight";
import { INSIGHTS } from "@/data/insights";
import { ShareBar } from "@/components/ui/ShareBar";

const EconomicScenarios = dynamic(
  () => import("@/components/sections/EconomicScenarios").then((m) => ({ default: m.EconomicScenarios })),
  { loading: () => <div className="min-h-[500px] animate-pulse bg-white-05 rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-12" /> }
);
const DistributionChannels = dynamic(
  () => import("@/components/sections/DistributionChannels").then((m) => ({ default: m.DistributionChannels })),
  { loading: () => <div className="min-h-[400px] animate-pulse bg-white-05 rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-12" /> }
);
const PolicyPillars = dynamic(
  () => import("@/components/sections/PolicyPillars").then((m) => ({ default: m.PolicyPillars })),
  { loading: () => <div className="min-h-[400px] animate-pulse bg-white-05 rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-12" /> }
);
const AntiRecommendations = dynamic(
  () => import("@/components/sections/AntiRecommendations").then((m) => ({ default: m.AntiRecommendations })),
  { loading: () => <div className="min-h-[400px] animate-pulse bg-white-05 rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-12" /> }
);
const ActionTimeline = dynamic(
  () => import("@/components/sections/ActionTimeline").then((m) => ({ default: m.ActionTimeline })),
  { loading: () => <div className="min-h-[400px] animate-pulse bg-white-05 rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-12" /> }
);
const Infrastructure = dynamic(
  () => import("@/components/sections/Infrastructure").then((m) => ({ default: m.Infrastructure })),
  { loading: () => <div className="min-h-[500px] animate-pulse bg-white-05 rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-12" /> }
);
const StationTracker = dynamic(
  () => import("@/components/sections/StationTracker").then((m) => ({ default: m.StationTracker })),
  { loading: () => <div className="min-h-[500px] animate-pulse bg-white-05 rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-12" /> }
);
const NewsFeed = dynamic(
  () => import("@/components/sections/NewsFeed").then((m) => ({ default: m.NewsFeed })),
  { loading: () => <div className="min-h-[300px] animate-pulse bg-white-05 rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-12" /> }
);
const References = dynamic(
  () => import("@/components/sections/References").then((m) => ({ default: m.References })),
  { loading: () => <div className="min-h-[300px] animate-pulse bg-white-05 rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-12" /> }
);
const PublicRoadmap = dynamic(
  () => import("@/components/sections/PublicRoadmap").then((m) => ({ default: m.PublicRoadmap })),
  { loading: () => <div className="min-h-[300px] animate-pulse bg-white-05 rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-12" /> }
);
const PersonaImpact = dynamic(
  () => import("@/components/sections/PersonaImpact").then((m) => ({ default: m.PersonaImpact })),
  { loading: () => <div className="min-h-[300px] animate-pulse bg-white-05 rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-12" /> }
);
const LegislativeTracker = dynamic(
  () => import("@/components/sections/LegislativeTracker").then((m) => ({ default: m.LegislativeTracker })),
  { loading: () => <div className="min-h-[300px] animate-pulse bg-white-05 rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-12" /> }
);

export default function Home() {
  return (
    <AudienceProvider>
      <a
        href="#crisis"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-navy focus:text-white focus:border focus:border-white-20 focus:text-sm"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Nav />
      <Ticker />

      {/* Hero header */}
      <header className="pt-[88px] pb-8 md:pt-[96px] md:pb-12 border-b border-white-08">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-white-50 mb-4">
            Pipedream · Policy Brief
          </p>
          <SupplyCountdown />
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            The Philippines Has 45 Days of Fuel Left
          </h1>
          <p className="mt-4 text-base md:text-lg text-white-70 max-w-2xl mx-auto">
            98% import-dependent. One refinery. No strategic reserve. Here&apos;s what must happen before supply runs out.
          </p>
          <p className="mt-3 text-xs text-white-30 font-mono">
            Published March 30, 2026 · Prepared by Pipedream
          </p>
        </div>
      </header>

      <AudienceMain>
          <div data-audience="analyst">
            <ReadingGuide />
          </div>

          <div data-audience="analyst executive public">
            <ExecutiveSummary />
          </div>

          <script
            type="application/ld+json"
            // skipcq: JS-0440 — static JSON-LD structured data, no user input
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Report",
                name: "Pipedream Policy Brief — Navigating the Energy Emergency",
                description: "Interactive policy dashboard for the Philippine fuel crisis with live market data, economic scenarios, and policy recommendations.",
                datePublished: "2026-03-30",
                url: "https://pipedream-policy-brief.vercel.app",
                inLanguage: "en",
                license: "https://www.gnu.org/licenses/agpl-3.0.html",
                isAccessibleForFree: true,
                author: { "@type": "Organization", name: "Pipedream", url: "https://github.com/0xjitsu/pipedream-policy-brief" },
                publisher: { "@type": "Organization", name: "Pipedream", url: "https://github.com/0xjitsu" },
                mainEntityOfPage: { "@type": "WebPage", "@id": "https://pipedream-policy-brief.vercel.app" },
                keywords: ["Philippine energy crisis", "fuel supply", "policy brief", "oil prices", "fuel subsidy", "PriceLOCQ"],
                about: {
                  "@type": "Event",
                  name: "Philippine Energy Crisis 2026",
                  location: { "@type": "Country", name: "Philippines" },
                },
              }),
            }}
          />

          {/* === PROBLEM BLOCK === */}
          <div data-audience="analyst executive public">
            <CrisisOverview />
          </div>
          <div data-audience="analyst executive public">
            <KeyInsight {...INSIGHTS.crisisOverview} />
          </div>
          <div className="border-t border-white-08" />
          <div data-audience="analyst public">
            <PersonaImpact />
          </div>
          <SectionDivider variant="solution" prose="The crisis is quantified. Here's what the evidence says works." />
          <div data-audience="analyst executive">
            <EconomicScenarios />
          </div>
          <div data-audience="analyst executive">
            <KeyInsight {...INSIGHTS.economicScenarios} />
          </div>

          {/* === SOLUTION BLOCK === */}
          <div className="border-t border-white-08" />
          <div data-audience="analyst executive">
            <DistributionChannels />
          </div>
          <div data-audience="analyst executive">
            <KeyInsight {...INSIGHTS.distributionChannels} />
          </div>
          <div className="border-t border-white-08" />
          <div data-audience="analyst executive">
            <PolicyPillars />
          </div>
          <div className="border-t border-white-08" />
          <div data-audience="analyst executive">
            <AntiRecommendations />
          </div>
          <div className="border-t border-white-08" />
          <div data-audience="analyst executive public">
            <LegislativeTracker />
          </div>

          {/* === EXECUTION BLOCK === */}
          <SectionDivider variant="execution" prose="Policy without implementation is theater. Here's the operational plan." />
          <div data-audience="analyst executive">
            <ActionTimeline />
          </div>
          <div className="border-t border-white-08" />
          <div data-audience="analyst">
            <Infrastructure />
          </div>
          <div className="border-t border-white-08" />
          <div data-audience="analyst public">
            <StationTracker />
          </div>
          <div className="border-t border-white-08" />
          <div data-audience="analyst public">
            <NewsFeed />
          </div>
          <div className="border-t border-white-08" />
          <div data-audience="analyst">
            <References />
          </div>
          <div className="border-t border-white-08" />
          <div data-audience="analyst executive public">
            <PublicRoadmap />
          </div>
        </AudienceMain>

      <ShareBar />
      <BackToTop />
      <Footer />
    </AudienceProvider>
  );
}
