export interface InsightData {
  text: string;
  source: string;
  sourceUrl?: string;
}

export const INSIGHTS: Record<string, InsightData> = {
  crisisOverview: {
    text: "At current burn rate, the Philippines crosses the DOE minimum reserve threshold by mid-May 2026.",
    source: "DOE Weekly Supply Monitoring Report",
    sourceUrl: "https://legacy.doe.gov.ph/downstream-oil/lfro-with-valid-coc-lfo",
  },
  economicScenarios: {
    text: "Every $10/bbl increase in crude costs the Philippine economy ₱42B in additional import spending annually.",
    source: "BSP Monetary Policy Report",
    sourceUrl: "https://www.bsp.gov.ph/SitePages/Statistics/ExchangeRate.aspx",
  },
  distributionChannels: {
    text: "PriceLOCQ reaches 4.2M registered users — more than any government fuel subsidy program in Philippine history.",
    source: "Phoenix Petroleum Investor Relations",
  },
};
