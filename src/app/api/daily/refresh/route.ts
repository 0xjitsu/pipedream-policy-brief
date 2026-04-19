import { NextResponse } from "next/server";
import { runDailyPipeline } from "@/lib/daily-pipeline";

export const maxDuration = 120;

/**
 * POST /api/daily/refresh
 *
 * Triggered by Vercel Cron. Auth via CRON_SECRET Bearer header.
 * Runs the full daily pipeline and upserts the snapshot.
 */
export async function POST(request: Request): Promise<Response> {
  const authHeader = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await runDailyPipeline();
    return NextResponse.json({
      ok: true,
      snapshotDate: snapshot.snapshotDate,
      generatedAt: snapshot.generatedAt,
      fields: {
        pumpPrice: snapshot.pumpPrice !== null,
        aseanPrices: snapshot.aseanPrices.length,
        stations: snapshot.stations !== null,
        supplyDays: snapshot.supplyDays !== null,
        narrative: snapshot.narrative !== null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[daily/refresh] pipeline failed:", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// Accept GET so Vercel Cron's default GET trigger works
export const GET = POST;
