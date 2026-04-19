import { NextResponse } from "next/server";

/**
 * POST /api/weekly/refresh
 *
 * Scheduled weekly via Vercel Cron (Mondays 06:00 PHT). Currently a
 * placeholder — exists to claim the second cron slot. Future: refresh
 * legislative tracker statuses via a curated feed or admin endpoint.
 */
export async function POST(request: Request): Promise<Response> {
  const authHeader = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    runAt: new Date().toISOString(),
    note: "Legislative refresh placeholder — no-op until curation layer lands.",
  });
}

export const GET = POST;
