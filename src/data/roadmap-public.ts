export interface Deliverable {
  icon: string;
  title: string;
  description: string;
  cost: string;
  costType: "monetary" | "engineering" | "partnership";
  partnership: string;
}

export interface CTACard {
  icon: string;
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
}

export const deliverables: Deliverable[] = [
  {
    icon: "📋",
    title: "DOE Price Integration",
    description:
      "Automated weekly fuel price scraping from DOE monitoring reports — real pump prices per region, not estimates.",
    cost: "Engineering time",
    costType: "engineering",
    partnership: "DOE data sharing agreement",
  },
  {
    icon: "📍",
    title: "Station Status Verification",
    description:
      "Ground-truth open/closed status for 10,469 stations via Google Places API. Alternative: community-sourced reports.",
    cost: "~$246 one-time",
    costType: "monetary",
    partnership: "Google Cloud credits or community volunteers",
  },
  {
    icon: "📈",
    title: "Historical Price Database",
    description:
      "Daily Brent crude, USD/PHP, and diesel price snapshots powering 30-day trend charts and week-over-week deltas.",
    cost: "Free tier (Supabase)",
    costType: "engineering",
    partnership: "Academic researchers needing historical energy data",
  },
  {
    icon: "🇵🇭",
    title: "Filipino Translation",
    description:
      "Full i18n support (EN/FIL) so 115 million Filipino readers can access the brief in their language.",
    cost: "~$500 contracted or volunteer",
    costType: "monetary",
    partnership: "UP linguistics, translation communities, DLSU",
  },
  {
    icon: "📄",
    title: "PDF Policy Brief Export",
    description:
      "Downloadable, print-ready PDF with cover page, executive summary, charts, and recommendations for committee circulation.",
    cost: "Engineering time",
    costType: "engineering",
    partnership: "UPLIFT Committee, Senate Energy Committee",
  },
  {
    icon: "🧩",
    title: "Embeddable Widgets",
    description:
      "iframe-ready supply gauge, price ticker, and station map that news outlets can embed directly in their coverage.",
    cost: "Engineering time",
    costType: "engineering",
    partnership: "Inquirer, Rappler, ABS-CBN, GMA News",
  },
  {
    icon: "🎛️",
    title: "Interactive Scenario Builder",
    description:
      "Adjustable oil price, exchange rate, and supply duration sliders with real-time GDP and inflation impact modeling.",
    cost: "Engineering time",
    costType: "engineering",
    partnership: "DOF, NEDA, and academic economists",
  },
  {
    icon: "🤖",
    title: "Automated Intelligence Briefs",
    description:
      "AI-generated daily and weekly email summaries delivered to institutional subscribers at 5am PHT.",
    cost: "~$20/mo (Resend + AI)",
    costType: "monetary",
    partnership: "Institutional subscribers (DOE, DOF, LGUs)",
  },
];

export const partnershipPitch = {
  headline: "This dashboard is a public good — and it needs partners to reach its full potential.",
  points: [
    "115 million Filipinos affected by the energy crisis",
    "Already presented to UPLIFT Committee, DOE, and DOF",
    "Key data upgrades cost $250–$500 total — high impact, low barrier",
    "Open source (AGPL-3.0) with commercial license available",
    "Agent-optimized: llms.txt, open APIs, JSON-LD, semantic HTML",
  ],
};

export const ctaCards: CTACard[] = [
  {
    icon: "🏛️",
    title: "Organizations",
    description:
      "Become a data partner, provide API access, or sponsor infrastructure. Your logo goes in the dashboard and README.",
    linkText: "Open a partnership discussion",
    linkUrl: "https://github.com/0xjitsu/pipedream-policy-brief/issues/new?labels=partnership&template=partnership.md&title=Partnership+Inquiry",
  },
  {
    icon: "👩‍💻",
    title: "Developers",
    description:
      "Contribute code, fix bugs, add translations, or integrate new data sources. Good first issues available.",
    linkText: "Read the contributor guide",
    linkUrl: "https://github.com/0xjitsu/pipedream-policy-brief/blob/main/CONTRIBUTING.md",
  },
  {
    icon: "🔬",
    title: "Researchers",
    description:
      "Access open APIs (no auth required), cite our data, or propose analytical collaborations.",
    linkText: "Explore the API",
    linkUrl: "https://pipedream-policy-brief.vercel.app/llms-full.txt",
  },
];
