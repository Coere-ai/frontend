import "server-only";

import { isSignedIn } from "@/lib/auth/session";
import { supabaseConfigured } from "@/lib/supabase";

/**
 * The shape of every admin write. Each server action checks the admin
 * session itself, since a server action is a public endpoint whatever page
 * it sits on. A failure answers fixed words and logs the error's code only.
 */

export type AdminResult = { ok: true; notice: string } | { ok: false; error: string };

export const UNAVAILABLE = "That did not work. Try again in a minute.";
export const done = (notice: string): AdminResult => ({ ok: true, notice });
export const refused = (error: string): AdminResult => ({ ok: false, error });

export async function adminAction(label: string, run: () => Promise<AdminResult>): Promise<AdminResult> {
  if (!(await isSignedIn())) return refused("You were signed out. Reload the page to sign in again.");
  if (!supabaseConfigured()) return refused("Storage is not configured.");
  try {
    return await run();
  } catch (err) {
    console.error(`[admin] ${label} failed:`, err instanceof Error ? err.message : "unknown");
    return refused(UNAVAILABLE);
  }
}

/** A Supabase error, thrown with its code only, which names no person. */
export function check(error: { code?: string } | null, what: string): void {
  if (error) throw new Error(`${what}: ${error.code ?? "unknown"}`);
}
