import type {
  DailyNarrativePayload,
  DailyNarrativeSignal,
  DailySnapshot,
} from "@/data/types";
import { buildSynthesisPrompt } from "./synthesisPrompt";

const HF_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct";
const HF_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

interface SynthesizeInputs {
  snapshot: DailySnapshot;
  previous: DailySnapshot | null;
  recentHeadlines: string[];
}

/**
 * Generates a 2-4 sentence daily narrative.
 *
 * Primary path: HuggingFace Inference API (free tier). Falls back to a
 * deterministic template synthesizer if HF is unavailable, rate-limited,
 * or returns malformed JSON — so the dashboard never shows empty content.
 */
export async function synthesizeNarrative(
  inputs: SynthesizeInputs,
): Promise<DailyNarrativePayload> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (apiKey) {
    const hfResult = await tryHuggingFace(inputs, apiKey);
    if (hfResult) {
      const validated = validateNarrative(hfResult, inputs);
      if (validated) return validated;
    }
  }
  return templateFallback(inputs);
}

async function tryHuggingFace(
  inputs: SynthesizeInputs,
  apiKey: string,
): Promise<DailyNarrativePayload | null> {
  try {
    const prompt = buildSynthesisPrompt(inputs);
    const res = await fetch(HF_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.3,
          return_full_text: false,
        },
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const text =
      (Array.isArray(data) ? data[0]?.generated_text : data?.generated_text) ??
      "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as DailyNarrativePayload;
    if (typeof parsed.headline !== "string" || typeof parsed.body !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Deterministic template-based fallback. Uses the raw numbers to produce
 * a predictable narrative. Never fails.
 */
function templateFallback({
  snapshot,
  previous,
}: SynthesizeInputs): DailyNarrativePayload {
  const date = new Date(snapshot.snapshotDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const parts: string[] = [];
  const signals: DailyNarrativeSignal[] = [];

  if (snapshot.pumpPrice) {
    const delta = snapshot.pumpPrice.delta ? ` (${snapshot.pumpPrice.delta})` : "";
    parts.push(`Diesel pump price is ₱${snapshot.pumpPrice.value}/L${delta}.`);
    const prev = previous?.pumpPrice?.value ?? 0;
    signals.push({
      metric: "pump",
      direction:
        !prev
          ? "stable"
          : snapshot.pumpPrice.value > prev
            ? "up"
            : snapshot.pumpPrice.value < prev
              ? "down"
              : "stable",
    });
  } else {
    signals.push({ metric: "pump", direction: "stable" });
  }

  if (snapshot.supplyDays) {
    const d = snapshot.supplyDays.delta;
    const deltaStr = d !== 0 ? ` (${d > 0 ? "+" : ""}${d} vs yesterday)` : "";
    parts.push(`Days of supply: ${snapshot.supplyDays.value}${deltaStr}.`);
    signals.push({
      metric: "supply",
      direction: d > 0 ? "up" : d < 0 ? "down" : "stable",
    });
  } else {
    signals.push({ metric: "supply", direction: "stable" });
  }

  if (snapshot.stations) {
    parts.push(
      `${snapshot.stations.closed.toLocaleString()} of ${snapshot.stations.total.toLocaleString()} stations tracked as closed.`,
    );
  }

  const phRank = snapshot.aseanPrices.find((a) => a.country === "Philippines")?.rank;
  if (phRank) {
    parts.push(`PH ranks #${phRank} in ASEAN for diesel affordability.`);
  }

  // Crude and peso deltas aren't in the snapshot — neutral defaults.
  signals.push({ metric: "crude", direction: "stable" });
  signals.push({ metric: "peso", direction: "stable" });

  return {
    headline: `Energy crisis brief — ${date}`,
    body:
      parts.slice(0, 3).join(" ") ||
      "Snapshot data unavailable; refer to live market metrics and the static brief below.",
    signals,
  };
}

/**
 * Sanity-checks an LLM-produced narrative. Rejects numbers that aren't
 * present in the source snapshot — reduces hallucination risk. Returns
 * null if the narrative should be discarded (caller falls back to template).
 */
function validateNarrative(
  n: DailyNarrativePayload,
  { snapshot }: SynthesizeInputs,
): DailyNarrativePayload | null {
  const allowed = new Set<string>();
  if (snapshot.pumpPrice) allowed.add(String(snapshot.pumpPrice.value));
  if (snapshot.supplyDays) allowed.add(String(snapshot.supplyDays.value));
  if (snapshot.stations) {
    allowed.add(String(snapshot.stations.closed));
    allowed.add(String(snapshot.stations.total));
  }
  snapshot.aseanPrices.forEach((a) => allowed.add(String(a.rank)));

  const numbers = (n.body + " " + n.headline).match(/\d+(?:\.\d+)?/g) ?? [];
  const hallucinated = numbers.filter(
    (num) => !allowed.has(num) && !["24", "1", "2", "3", "4"].includes(num),
  );

  if (hallucinated.length > 0) return null;
  return n;
}
