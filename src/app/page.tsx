import dynamic from "next/dynamic";
import { Nav } from "@/components/layout/Nav";
import { Ticker } from "@/components/ui/Ticker";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { Footer } from "@/components/layout/Footer";
import { CrisisOverview } from "@/components/sections/CrisisOverview";

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

export default function Home() {
  return (
    <>
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
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Navigating the Energy Emergency
          </h1>
          <p className="mt-4 text-base md:text-lg text-white-70 max-w-2xl mx-auto">
            Supply security, market stability, and targeted relief for the Philippine fuel crisis
          </p>
          <p className="mt-3 text-xs text-white-30 font-mono">
            Published March 30, 2026 · Prepared by Pipedream
          </p>
        </div>
      </header>

      <main>
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
