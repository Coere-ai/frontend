"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { safeNext } from "@/lib/auth/next-path";
import type { SignInState } from "@/lib/auth/sign-in-state";
import { passwordSignIn, sendCode, verifyCode } from "@/lib/auth/sign-in-steps";
import { accountsConfigured } from "@/lib/supabase/server";

/**
 * The sign in form's one action. Every button posts here with its own
 * `intent`, so the steps also work before the page's scripts load. Switching
 * between the code and the password way is an intent too, and touches
 * nothing but the form state.
 */
export async function signInStep(prev: SignInState, form: FormData): Promise<SignInState> {
  const next = safeNext(String(form.get("next") ?? ""));
  const state: SignInState = { ...prev, next, error: null, field: null, notice: null };
  const intent = form.get("intent");

  if (intent === "use-password") return { ...state, step: "password" };
  if (intent === "use-code" || intent === "restart") return { ...state, step: "email", email: "" };
  if (!accountsConfigured()) {
    console.error("[accounts] SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set for sign in");
    return { ...state, error: "Signing in is not available right now. Try again later." };
  }

  const head = await headers();
  if (intent === "send" || intent === "resend") return sendCode(state, form.get("email"), head);
  if (intent === "verify") {
    const failed = await verifyCode(state, form.get("email"), form.get("code"), head);
    if (failed) return failed;
    redirect(next);
  }
  if (intent === "password") {
    const failed = await passwordSignIn(state, form.get("login"), form.get("password"), head);
    if (failed) return failed;
    redirect(next);
  }
  return state;
}
