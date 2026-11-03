"use server";

import { headers } from "next/headers";

import { overLimit } from "@/lib/auth/guard";
import { normalizeEmail, normalizeUsername, passwordProblem, usernameProblem } from "@/lib/auth/identity";
import { usernameTaken } from "@/lib/auth/lookup";
import { safeNext } from "@/lib/auth/next-path";
import { requestOrigin } from "@/lib/auth/origin";
import type { SignUpField, SignUpState } from "@/lib/auth/sign-up-state";
import { logSecurityEvent } from "@/lib/security/events";
import { accountsConfigured, sessionClient } from "@/lib/supabase/server";

/**
 * Makes an account with a password. Supabase then emails a link that lands
 * on /auth/confirm. An address that already has an account gets the same
 * "check your email" as a new one (Supabase answers both the same way), so
 * the form never says which addresses are taken. Usernames are different:
 * the person has to pick a free one, so a taken one is said plainly.
 */
export async function signUp(prev: SignUpState, form: FormData): Promise<SignUpState> {
  const next = safeNext(String(form.get("next") ?? ""));
  const rawEmail = String(form.get("email") ?? "");
  const rawUsername = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const base: SignUpState = { next, sent: null, values: { email: rawEmail, username: rawUsername }, errors: {}, error: null };
  if (form.get("intent") === "restart") return { ...base, values: { email: "", username: "" } };

  const errors: Partial<Record<SignUpField, string>> = {};
  const email = normalizeEmail(rawEmail);
  if (!email) errors.email = "Enter your email address.";
  const usernameIssue = rawUsername ? usernameProblem(rawUsername) : null;
  if (usernameIssue) errors.username = usernameIssue;
  const passwordIssue = passwordProblem(password);
  if (passwordIssue) errors.password = passwordIssue;
  if (Object.keys(errors).length > 0 || !email) return { ...base, errors };

  if (!accountsConfigured()) {
    console.error("[accounts] SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set for sign up");
    return { ...base, error: "Making an account is not available right now. Try again later." };
  }
  const head = await headers();
  if (await overLimit(head, email)) return { ...base, error: "Too many tries. Wait a few minutes and try again." };

  const username = rawUsername ? normalizeUsername(rawUsername) : null;
  if (username && (await usernameTaken(username))) return { ...base, errors: { username: "That username is taken." } };

  const client = await sessionClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${requestOrigin(head)}${next}`, data: username ? { username } : {} },
  });
  if (error) {
    console.error("sign up refused", error.code ?? error.status);
    if (error.code === "weak_password") return { ...base, errors: { password: "Pick a stronger password." } };
    if (error.status === 429 || error.code === "over_email_send_rate_limit") {
      return { ...base, error: "We just sent you an email. Wait a minute before trying again." };
    }
    return { ...base, error: "We could not make the account. Try again in a minute." };
  }
  await logSecurityEvent("sign_up", { userId: data.user?.id ?? null, headers: head });
  return { ...base, sent: email };
}
