import { NextResponse } from "next/server";
import { readLatestSnapshot } from "@/lib/daily-pipeline/readSnapshot";

/**
 * GET /api/daily
 *
 * Returns the most recent snapshot from Supabase. Cached at the edge
 * for 30 minutes — fresher reads aren't useful since the cron runs daily.
 */
export async function GET(): Promise<Response> {
  try {
    const snapshot = await readLatestSnapshot();
    if (!snapshot) {
      return NextResponse.json(
        { ok: false, error: "no snapshot yet" },
        {
          status: 503,
          headers: {
            "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
          },
        },
      );
    }
    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[daily] read failed:", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
