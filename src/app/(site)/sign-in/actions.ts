"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { safeNext } from "@/lib/auth/next-path";
import type { SignInState } from "@/lib/auth/sign-in-state";
import { passwordSignIn } from "@/lib/auth/sign-in-steps";
import { supabaseConfigured } from "@/lib/supabase";
import { accountsConfigured } from "@/lib/supabase/server";

/** The sign in form's one action: a username and a password, then on to `next`. */
export async function signIn(prev: SignInState, form: FormData): Promise<SignInState> {
  const next = safeNext(String(form.get("next") ?? ""));
  const state: SignInState = { ...prev, next, error: null, field: null };
  if (!accountsConfigured() || !supabaseConfigured()) {
    console.error("[accounts] SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and SUPABASE_SECRET_KEY must be set for sign in");
    // Give back what was typed, since the form resets after every action.
    const username = form.get("username");
    return { ...state, username: typeof username === "string" ? username.slice(0, 64) : "", error: "Signing in is not available right now. Try again later." };
  }
  const failed = await passwordSignIn(state, form.get("username"), form.get("password"), await headers());
  if (failed) return failed;
  redirect(next);
}
