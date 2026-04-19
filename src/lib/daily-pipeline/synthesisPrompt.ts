import type { DailySnapshot } from "@/data/types";

interface PromptInputs {
  snapshot: DailySnapshot;
  previous: DailySnapshot | null;
  recentHeadlines: string[];
}

/**
 * Builds the prompt for daily narrative synthesis.
 *
 * Hard constraints:
 * - Output MUST reference only numbers from the input JSON
 * - No speculation about causes unless mentioned in recentHeadlines
 * - 2-4 sentences, 400 chars max
 * - Must return valid JSON shape defined below
 */
export function buildSynthesisPrompt({
  snapshot,
  previous,
  recentHeadlines,
}: PromptInputs): string {
  const facts = {
    date: snapshot.snapshotDate,
    pumpPrice: snapshot.pumpPrice,
    pumpPriceYesterday: previous?.pumpPrice ?? null,
    supplyDays: snapshot.supplyDays,
    supplyDaysYesterday: previous?.supplyDays ?? null,
    stationsClosed: snapshot.stations?.closed,
    stationsTotal: snapshot.stations?.total,
    aseanRank: snapshot.aseanPrices.find((a) => a.country === "Philippines")?.rank,
  };

  return `You are writing a 2-4 sentence daily brief for the Philippine energy crisis policy dashboard.

Rules:
1. Only use numbers from the FACTS JSON below. Never invent figures.
2. If a news headline is relevant, reference it in one phrase (no direct quotes longer than 5 words).
3. Tone: factual, concise, no hyperbole.
4. 400 characters max total for headline + body combined.

FACTS (JSON):
${JSON.stringify(facts, null, 2)}

RECENT HEADLINES (last 24h):
${recentHeadlines.slice(0, 6).map((h) => `- ${h}`).join("\n") || "- (no headlines available)"}

Return a JSON object with EXACTLY this shape (no markdown fences, no commentary):
{
  "headline": "One sentence, under 80 chars.",
  "body": "2-3 sentences of body, under 320 chars total.",
  "signals": [
    { "metric": "crude", "direction": "up" | "down" | "stable" },
    { "metric": "peso", "direction": "up" | "down" | "stable" },
    { "metric": "pump", "direction": "up" | "down" | "stable" },
    { "metric": "supply", "direction": "up" | "down" | "stable" }
  ]
}`;
}
