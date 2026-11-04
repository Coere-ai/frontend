import "server-only";

import { supabase, supabaseConfigured } from "@/lib/supabase";

import { pausedToday } from "./limits";

/**
 * Whether the person's AI use is paused for the rest of the UTC day. The
 * daily limit is hidden: a signed in session cannot read it, so this asks
 * daily_spend() with the server's key for the one account the page already
 * checked, and answers only yes or no. Any failure reads as not paused, so
 * the page never claims a pause that is not there.
 */
export async function readPausedToday(userId: string): Promise<boolean> {
  if (!supabaseConfigured()) return false;
  try {
    const { data, error } = await supabase().rpc("daily_spend", { p_user: userId });
    if (error) return false;
    const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
    return pausedToday(row);
  } catch {
    return false;
  }
}
