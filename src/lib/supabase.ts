import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client for the pipedream-policy-brief project.
 *
 * Uses the anon/publishable key. RLS allows public read + permissive write on
 * the single `daily_snapshot` table. The cron endpoint guards writes via
 * CRON_SECRET at the API-route level.
 */

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  }
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return client;
}
