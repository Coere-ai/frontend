import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The one Supabase client, server-side only.
 *
 * `server-only` at the top makes importing this from a client component a build
 * error rather than a runtime leak: this module holds the secret key, which
 * bypasses Row Level Security and must never reach a browser.
 *
 * Both analytics tables have RLS enabled with no policies, so this key is the
 * only thing on earth that can read or write them.
 */
let cached: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SECRET_KEY must be set. See the README.",
    );
  }

  cached = createClient(url, key, {
    auth: {
      // There are no Supabase users here; nothing should be persisted or
      // refreshed, and this client runs where there is no browser storage.
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: { headers: { "x-application-name": "coere-site-analytics" } },
  });
  return cached;
}

/** True when the analytics database is configured at all. */
export function supabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}
