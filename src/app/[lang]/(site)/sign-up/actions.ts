"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { newPasswordProblem } from "@/lib/account/password-change";
import { createAccount, type Created } from "@/lib/auth/create-account";
import { overLimit } from "@/lib/auth/guard";
import { markSignedIn } from "@/lib/auth/hint-cookie";
import { normalizeUsername, passwordProblem, usernameProblem } from "@/lib/auth/identity";
import { usernameTaken } from "@/lib/auth/lookup";
import { safeNext } from "@/lib/auth/next-path";
import type { SignUpField, SignUpState } from "@/lib/auth/sign-up-state";
import { logSecurityEvent } from "@/lib/security/events";
import { supabaseConfigured } from "@/lib/supabase";
import { accountsConfigured, sessionClient } from "@/lib/supabase/server";

/**
 * Makes an account from a username and a password, then signs the person
 * in and goes on to `next`. No email is asked for and none is sent: the
 * server makes the Supabase user already confirmed (create-account.ts).
 * The person has to pick a free username, so a taken one is said plainly.
 */
export async function signUp(_prev: SignUpState, form: FormData): Promise<SignUpState> {
  const next = safeNext(String(form.get("next") ?? ""));
  const rawUsername = String(form.get("username") ?? "").trim().slice(0, 64);
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  const base: SignUpState = { next, username: rawUsername, errors: {}, error: null };

  const errors: Partial<Record<SignUpField, string>> = {};
  const usernameIssue = rawUsername ? usernameProblem(rawUsername) : "Pick a username.";
  if (usernameIssue) errors.username = usernameIssue;
  const passwordIssue = passwordProblem(password);
  if (passwordIssue) errors.password = passwordIssue;
  else {
    const confirmIssue = newPasswordProblem(password, confirm);
    if (confirmIssue) errors.confirm = confirmIssue;
  }
  const username = normalizeUsername(rawUsername);
  if (Object.keys(errors).length > 0 || !username) return { ...base, errors };

  if (!accountsConfigured() || !supabaseConfigured()) {
    console.error("[accounts] SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and SUPABASE_SECRET_KEY must be set for sign up");
    return { ...base, error: "Making an account is not available right now. Try again later." };
  }
  const head = await headers();
  if (await overLimit(head, username)) return { ...base, error: "Too many tries. Wait a few minutes and try again." };

  let made: Created;
  try {
    made = (await usernameTaken(username)) ? { ok: false, reason: "taken" } : await createAccount(username, password);
  } catch {
    made = { ok: false, reason: "unavailable" };
  }
  if (!made.ok) {
    if (made.reason === "taken") return { ...base, errors: { username: "That username is taken." } };
    if (made.reason === "weak_password") return { ...base, errors: { password: "Pick a stronger password." } };
    return { ...base, error: "We could not make the account. Try again in a minute." };
  }
  await logSecurityEvent("sign_up", { userId: made.userId, headers: head });

  const { error } = await (await sessionClient()).auth.signInWithPassword({ email: made.email, password });
  if (error) {
    console.error("new account not signed in", error.code ?? error.status);
    return { ...base, error: "Your account is ready, but signing in did not work. Sign in with it now." };
  }
  await markSignedIn();
  await logSecurityEvent("sign_in", { userId: made.userId, headers: head });
  redirect(next);
}
