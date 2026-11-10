import "server-only";

import { logSecurityEvent } from "@/lib/security/events";
import { sessionClient } from "@/lib/supabase/server";

import { overLimit, wrongAnswerDelay } from "./guard";
import { markSignedIn } from "./hint-cookie";
import { normalizeUsername } from "./identity";
import { emailForUsername } from "./lookup";
import { isWrongLogin } from "./password-refusal";
import type { SignInState } from "./sign-in-state";

/**
 * Signing in with a username and a password. The try counts against the
 * limits first, then the username turns into its account's placeholder
 * email with the secret key, and the password is checked with the person's
 * own session client. A success answers null, and the action then
 * redirects; anything else answers the next form state.
 *
 * A username nobody has and a wrong password get the same words and about
 * the same wait, so the form never says which usernames exist.
 */

export const TOO_MANY = "Too many tries. Wait a few minutes and try again.";
const WRONG_LOGIN = "That username or password is wrong.";
const UNAVAILABLE = "Signing in is not available right now. Try again in a minute.";

export async function passwordSignIn(prev: SignInState, rawUsername: unknown, rawPassword: unknown, headers: Headers): Promise<SignInState | null> {
  const startedAt = Date.now();
  const typed = typeof rawUsername === "string" ? rawUsername.slice(0, 64) : "";
  const failed: SignInState = { ...prev, username: typed, error: WRONG_LOGIN, field: null };
  const password = typeof rawPassword === "string" ? rawPassword : "";
  if (!typed.trim() || !password) {
    return { ...failed, error: "Enter your username and your password.", field: typed.trim() ? "password" : "username" };
  }
  // A name that breaks the username rule has no account, but it still counts and waits like one that does.
  const username = normalizeUsername(typed);
  if (await overLimit(headers, username ?? `bad:${typed.trim().toLowerCase()}`)) return { ...failed, error: TOO_MANY };

  let email: string | null;
  try {
    email = username ? await emailForUsername(username) : null;
  } catch {
    console.error("sign in lookup failed");
    return { ...failed, error: UNAVAILABLE };
  }
  if (!email) {
    await logSecurityEvent("sign_in_failed", { headers });
    await wrongAnswerDelay(startedAt);
    return failed;
  }

  const client = await sessionClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    // Supabase's own refusals (its shared sign in limit, an outage) read as wrong to the person, like every other failure, but the operator sees the code.
    if (error && !isWrongLogin(error.code)) console.error("sign in refused", error.code ?? error.status ?? "unknown");
    await logSecurityEvent("sign_in_failed", { headers });
    await wrongAnswerDelay(startedAt);
    return failed;
  }
  await markSignedIn();
  await logSecurityEvent("sign_in", { userId: data.user.id, headers });
  return null;
}
