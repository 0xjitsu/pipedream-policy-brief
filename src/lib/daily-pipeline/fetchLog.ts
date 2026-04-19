import { getSupabase } from "@/lib/supabase";

type Source = "doe" | "gpp" | "osm";
type Strategy = "primary" | "firecrawl" | "mirror";

interface LogEntry {
  source: Source;
  strategy: Strategy;
  success: boolean;
  durationMs: number;
  errorMessage?: string | null;
}

/**
 * Fire-and-forget append to the fetch_log table. Falls back to console.log
 * (visible in Vercel Function logs) if the table isn't available. Swallows
 * its own errors so logging failures never cascade into pipeline failures.
 */
export async function logFetch(entry: LogEntry): Promise<void> {
  try {
    const db = getSupabase();
    const { error } = await db.from("fetch_log").insert({
      source: entry.source,
      strategy: entry.strategy,
      success: entry.success,
      duration_ms: entry.durationMs,
      error_message: entry.errorMessage ?? null,
    });
    if (error) {
      // Table may not exist yet; fall back to console
      console.log(
        `[fetch_log fallback] ${entry.source}/${entry.strategy} success=${entry.success} ${entry.durationMs}ms${entry.errorMessage ? ` (${entry.errorMessage})` : ""}`,
      );
    }
  } catch {
    /* swallow — diagnostics must not break the pipeline */
  }
}
