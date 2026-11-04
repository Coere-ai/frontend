import "server-only";

import { supabase, supabaseConfigured } from "@/lib/supabase";
import { toSpend } from "@/lib/v1/spend";

import { pauseOf, type Pause } from "./limits";

/**
 * Whether the person's AI use is paused, for the one line the dashboard may
 * show. The limits are hidden: a signed in session cannot read them, so this
 * asks spend_state() with the server's key for the one account the page
 * already checked, and answers only which pause, never a number. Any failure
 * reads as not paused, so the page never claims a pause that is not there.
 */
export async function readPause(userId: string): Promise<Pause | null> {
  if (!supabaseConfigured()) return null;
  try {
    const { data, error } = await supabase().rpc("spend_state", { p_user: userId });
    if (error) return null;
    const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
    return row ? pauseOf(toSpend(row)) : null;
  } catch {
    return null;
  }
}
