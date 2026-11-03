import "server-only";

import { logSecurityEvent } from "@/lib/security/events";
import { sessionClient } from "@/lib/supabase/server";

import { overLimit, wrongAnswerDelay } from "./guard";
import { markSignedIn } from "./hint-cookie";
import { normalizeCode, normalizeEmail, parseLogin } from "./identity";
import { emailForUsername } from "./lookup";
import { requestOrigin } from "./origin";
import type { SignInState } from "./sign-in-state";

/**
 * The three things the sign in form asks the server to do. Each one counts
 * against the limits first, makes its one Supabase call with the person's
 * own session client, and writes a security event. A success answers null,
 * and the action then redirects; anything else answers the next form state.
 */

const TOO_MANY = "Too many tries. Wait a few minutes and try again.";
const WRONG_LOGIN = "That email, username or password is wrong.";

export async function sendCode(prev: SignInState, rawEmail: unknown, headers: Headers): Promise<SignInState> {
  const email = normalizeEmail(rawEmail);
  const typed = typeof rawEmail === "string" ? rawEmail : "";
  if (!email) return { ...prev, step: "email", email: typed, error: "Enter your email address.", field: "email", notice: null };
  if (await overLimit(headers, email)) return { ...prev, email: typed, error: TOO_MANY, field: null, notice: null };

  const client = await sessionClient();
  const { error } = await client.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: `${requestOrigin(headers)}${prev.next}` },
  });
  if (error) {
    const busy = error.status === 429 || error.code === "over_email_send_rate_limit";
    console.error("sign in code not sent", error.code ?? error.status);
    return {
      ...prev,
      email: typed,
      error: busy ? "We just sent you an email. Wait a minute before asking for another." : "We could not send the email. Try again in a minute.",
      field: null,
      notice: null,
    };
  }
  await logSecurityEvent("code_sent", { headers });
  return { ...prev, step: "code", email, error: null, field: null, notice: `We sent a code to ${email}.` };
}

export async function verifyCode(prev: SignInState, rawEmail: unknown, rawCode: unknown, headers: Headers): Promise<SignInState | null> {
  const startedAt = Date.now();
  const email = normalizeEmail(rawEmail);
  if (!email) return { ...prev, step: "email", error: "Enter your email address.", field: "email", notice: null };
  const code = normalizeCode(rawCode);
  if (!code) return { ...prev, step: "code", email, error: "Enter the 6 digit code from the email.", field: "code", notice: null };
  if (await overLimit(headers, email)) return { ...prev, step: "code", email, error: TOO_MANY, field: null, notice: null };

  const client = await sessionClient();
  const { data, error } = await client.auth.verifyOtp({ email, token: code, type: "email" });
  if (error || !data.user) {
    await logSecurityEvent("sign_in_failed", { headers });
    await wrongAnswerDelay(startedAt);
    return { ...prev, step: "code", email, error: "That code is wrong or has expired.", field: "code", notice: null };
  }
  await markSignedIn();
  await logSecurityEvent("sign_in", { userId: data.user.id, headers });
  return null;
}

export async function passwordSignIn(prev: SignInState, rawLogin: unknown, rawPassword: unknown, headers: Headers): Promise<SignInState | null> {
  const startedAt = Date.now();
  const typed = typeof rawLogin === "string" ? rawLogin : "";
  const failed = { ...prev, step: "password" as const, login: typed, error: WRONG_LOGIN, field: null, notice: null };
  const login = parseLogin(rawLogin);
  const password = typeof rawPassword === "string" ? rawPassword : "";
  if (!login || !password) {
    return { ...failed, error: "Enter your email or username, and your password.", field: login ? "password" : "login" };
  }
  if (await overLimit(headers, "email" in login ? login.email : `username:${login.username}`)) {
    return { ...failed, error: TOO_MANY };
  }
  const email = "email" in login ? login.email : await emailForUsername(login.username);
  if (!email) {
    // The same words and about the same wait as a wrong password, so this says nothing about which usernames exist.
    await logSecurityEvent("sign_in_failed", { headers });
    await wrongAnswerDelay(startedAt);
    return failed;
  }

  const client = await sessionClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error?.code === "email_not_confirmed") {
    return { ...failed, error: "Confirm your email first. Open the link we sent when you made the account." };
  }
  if (error || !data.user) {
    await logSecurityEvent("sign_in_failed", { headers });
    await wrongAnswerDelay(startedAt);
    return failed;
  }
  await markSignedIn();
  await logSecurityEvent("sign_in", { userId: data.user.id, headers });
  return null;
}
