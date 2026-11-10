import "server-only";

import { createClient } from "@supabase/supabase-js";

import { logSecurityEvent } from "@/lib/security/events";

import { overLimit, wrongAnswerDelay } from "./guard";
import { usernameOf } from "./lookup";
import { isWrongLogin } from "./password-refusal";
import type { AccountUser } from "./user";

/**
 * The current password, asked again before /account changes how the
 * person signs in (docs/accounts.md 3.1 step 4). A session cookie lives
 * 400 days and coere.ai has no email to win an account back with, so a
 * browser left signed in must not be enough to change the password or the
 * username and lock the owner out.
 *
 * The check signs in on a throwaway client that keeps its session in memory
 * only, then signs that session out again, so the browser's own session and
 * cookies are never touched. It counts against the same limits as sign in.
 */

export type CurrentPassword = "ok" | "wrong" | "limited" | "unavailable";

export async function checkCurrentPassword(user: AccountUser, password: string, headers: Headers): Promise<CurrentPassword> {
  const startedAt = Date.now();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return "unavailable";
  const username = await usernameOf(user.id).catch(() => null);
  if (await overLimit(headers, username ?? `id:${user.id}`)) return "limited";
  if (!password) {
    await wrongAnswerDelay(startedAt);
    return "wrong";
  }

  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const { data, error } = await client.auth.signInWithPassword({ email: user.email, password });
  if (error || !data.user) {
    if (error && !isWrongLogin(error.code)) {
      console.error("current password check refused", error.code ?? error.status ?? "unknown");
      return "unavailable";
    }
    await logSecurityEvent("sign_in_failed", { userId: user.id, headers });
    await wrongAnswerDelay(startedAt);
    return "wrong";
  }
  // The check's own session is not wanted: end it so no stray session stays on the account.
  await client.auth.signOut({ scope: "local" }).catch(() => undefined);
  return data.user.id === user.id ? "ok" : "wrong";
}
