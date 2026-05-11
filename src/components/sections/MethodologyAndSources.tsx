"use client";

import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { FRESHNESS_TIERS, type FreshnessTier } from "@/data/freshness";
import { METHODOLOGY_SOURCES, type MethodologySource } from "@/data/methodology";

const TIER_ORDER: FreshnessTier[] = ["live", "daily", "weekly", "static"];

const SOURCE_TYPE_ICON: Record<MethodologySource["type"], string> = {
  api: "🛰",
  rss: "📡",
  scrape: "🕸",
  computed: "🧮",
  llm: "🤖",
};

export function MethodologyAndSources() {
  return (
    <div data-audience="analyst">
      <SectionWrapper
        id="methodology"
        title="Methodology & Sources"
        icon="🔬"
        tier="static"
        subtitle="How every number on this page is sourced, refreshed, and verified."
      >
        {/* 1. Freshness tier legend */}
        <div className="glass p-5 mb-6">
          <h3 className="font-serif text-base font-semibold text-white mb-1">
            Data freshness tiers
          </h3>
          <p className="text-sm text-white-70 mb-4">
            Every metric on this page is tagged with one of four tiers. The
            dot color next to a value reflects how recently it was refreshed.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {TIER_ORDER.map((id) => {
              const tier = FRESHNESS_TIERS[id];
              return (
                <div key={id} className="flex items-start gap-3 p-3 rounded-lg bg-white-05">
                  <span
                    className={`mt-1 shrink-0 w-2.5 h-2.5 rounded-full ${tier.dotClass}`}
                    aria-hidden="true"
                  />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-sm font-semibold ${tier.textClass}`}>
                        {tier.label}
                      </span>
                      <span className="text-[10px] font-mono text-white-60">
                        {tier.cadence}
                      </span>
                    </div>
                    <p className="text-xs text-white-70 mt-1 leading-relaxed">
                      {tier.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Source matrix */}
        <div className="glass p-5 mb-6 overflow-x-auto">
          <h3 className="font-serif text-base font-semibold text-white mb-1">
            Data sources
          </h3>
          <p className="text-sm text-white-70 mb-4">
            Where each tier&apos;s data comes from, how often it refreshes,
            and what happens when a source is unavailable.
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-white-50">
                <th scope="col" className="pb-2 pr-3 font-semibold">Source</th>
                <th scope="col" className="pb-2 pr-3 font-semibold">Tier</th>
                <th scope="col" className="pb-2 pr-3 font-semibold">Cadence</th>
                <th scope="col" className="pb-2 pr-3 font-semibold">Provides</th>
                <th scope="col" className="pb-2 font-semibold">Fallback</th>
              </tr>
            </thead>
            <tbody>
              {METHODOLOGY_SOURCES.map((s) => {
                const tier = FRESHNESS_TIERS[s.tier];
                return (
                  <tr key={s.name} className="border-t border-white-08 align-top">
                    <td className="py-2 pr-3">
                      <span className="mr-1.5" aria-hidden="true">
                        {SOURCE_TYPE_ICON[s.type]}
                      </span>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white-90 hover:text-white underline underline-offset-2 decoration-white-20 hover:decoration-white-50"
                      >
                        {s.name}
                      </a>
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`inline-flex items-center gap-1 ${tier.textClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${tier.dotClass}`} aria-hidden="true" />
                        {tier.label}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-white-70 text-xs">{s.cadence}</td>
                    <td className="py-2 pr-3 text-white-70 text-xs">{s.provides}</td>
                    <td className="py-2 text-white-60 text-xs">{s.fallback}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 3. AI synthesis explainer */}
        <div className="glass p-5 mb-6 border-l-3 border-l-[#38BDF8]">
          <h3 className="font-serif text-base font-semibold text-white mb-2">
            AI narrative synthesis
          </h3>
          <p className="text-sm text-white-70 leading-relaxed mb-3">
            The brief at the top of the page (above Crisis Overview) is
            generated daily by{" "}
            <a
              href="https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 decoration-white-30 hover:text-white"
            >
              Meta&apos;s Llama-3-8B-Instruct
            </a>{" "}
            on HuggingFace&apos;s free Inference API. Input: the day&apos;s
            snapshot (pump price, supply days, station counts, ASEAN ranking)
            plus the six most recent news headlines.
          </p>
          <p className="text-sm text-white-70 leading-relaxed mb-3">
            A validator rejects any narrative containing numbers that aren&apos;t
            in the source snapshot — if hallucination is detected, the
            pipeline falls back to a deterministic template that uses the
            snapshot numbers verbatim. The narrative never fabricates a value.
          </p>
          <p className="text-xs text-white-60">
            To verify: cross-check every numeric claim in the narrative against
            the metric cards in Crisis Overview below.
          </p>
        </div>

        {/* 4. Contribute */}
        <div className="glass p-5">
          <h3 className="font-serif text-base font-semibold text-white mb-2">
            Contribute
          </h3>
          <p className="text-sm text-white-70 leading-relaxed mb-3">
            This brief is open source under AGPL v3. Accuracy fixes, citation
            updates, design improvements, and pipeline robustness are all
            welcome.
          </p>
          <ul className="text-sm text-white-70 space-y-1.5">
            <li>
              <a
                href="https://github.com/0xjitsu/pipedream-policy-brief"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline underline-offset-2"
              >
                GitHub repository →
              </a>
            </li>
            <li>
              <a
                href="https://github.com/0xjitsu/pipedream-policy-brief/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline underline-offset-2"
              >
                Contributing guide (for humans) →
              </a>
            </li>
            <li>
              <a
                href="https://github.com/0xjitsu/pipedream-policy-brief/blob/main/AGENTS.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline underline-offset-2"
              >
                Agent contribution guide (for AI tools) →
              </a>
            </li>
            <li>
              <a
                href="https://github.com/0xjitsu/pipedream-policy-brief/blob/main/docs/RUNBOOK.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline underline-offset-2"
              >
                Operational runbook →
              </a>
            </li>
            <li>
              <a
                href="https://github.com/0xjitsu/pipedream-policy-brief/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline underline-offset-2"
              >
                Open issues →
              </a>
            </li>
          </ul>
        </div>
      </SectionWrapper>
    </div>
  );
}
