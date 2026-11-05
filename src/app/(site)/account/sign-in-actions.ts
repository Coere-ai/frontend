"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { parseDisplayName } from "@/lib/account/display-name";
import { codeSendRefusal, newPasswordProblem, passwordRefusal, UNAVAILABLE } from "@/lib/account/password-change";
import { setUsername } from "@/lib/account/username";
import { overLimit, wrongAnswerDelay } from "@/lib/auth/guard";
import { normalizeCode, normalizeUsername, usernameProblem } from "@/lib/auth/identity";
import { getUser } from "@/lib/auth/user";
import { logSecurityEvent } from "@/lib/security/events";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { sessionClient } from "@/lib/supabase/server";

/**
 * The /account writes for how a person shows and signs in: their display
 * name, their username and their password (docs/accounts.md 3.1 and 7).
 * A person who came in by an emailed code sets the last two here to get
 * another way in. Each checks the web session again; a device token never
 * reaches these.
 */

/** A one field form's answer. `value` puts back what was typed, since React resets the form after each submit. */
export interface FieldState {
  error: string | null;
  notice: string | null;
  value?: string;
}

/** The password form's answer. `needsCode` shows the emailed code box. */
export interface PasswordState {
  error: string | null;
  notice: string | null;
  needsCode: boolean;
}

const SIGNED_OUT = "You were signed out. Reload the page to sign in again.";

/** Sets the name an organization sees. An empty box clears it. Written with the secret key, like the page's other profile writes. */
export async function saveDisplayName(_prev: FieldState, form: FormData): Promise<FieldState> {
  const raw = form.get("displayName");
  const typed = typeof raw === "string" ? raw.slice(0, 200) : "";
  const user = await getUser();
  if (!user) return { error: SIGNED_OUT, notice: null, value: typed };
  const parsed = parseDisplayName(raw);
  if (!parsed.ok) return { error: parsed.problem, notice: null, value: typed };
  if (!supabaseConfigured()) return { error: UNAVAILABLE, notice: null, value: typed };
  const { data, error } = await supabase()
    .from("profiles")
    .update({ display_name: parsed.name, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("id");
  if (error || !data?.length) return { error: UNAVAILABLE, notice: null, value: typed };
  revalidatePath("/account");
  return { error: null, notice: parsed.name ? "Name saved." : "Name cleared. Your organization sees your username or email.", value: parsed.name ?? "" };
}

/** Sets or changes the username, checked unique on the server with the secret key. */
export async function saveUsername(_prev: FieldState, form: FormData): Promise<FieldState> {
  const raw = String(form.get("username") ?? "").slice(0, 64);
  const user = await getUser();
  if (!user) return { error: SIGNED_OUT, notice: null, value: raw };
  const name = normalizeUsername(raw);
  if (!name) return { error: usernameProblem(raw) ?? "Use only letters, numbers and underscores.", notice: null, value: raw };
  if (!supabaseConfigured()) return { error: UNAVAILABLE, notice: null, value: raw };
  const done = await setUsername(user.id, name).catch(() => null);
  if (!done) return { error: UNAVAILABLE, notice: null, value: raw };
  if (done === "taken") return { error: "That username is taken.", notice: null, value: raw };
  if (done === "unchanged") return { error: null, notice: `${name} is already your username.`, value: name };
  await logSecurityEvent("username_set", { userId: user.id, headers: await headers() });
  revalidatePath("/account");
  return { error: null, notice: `Your username is ${name}. With a password, you can sign in with it.`, value: name };
}

/**
 * Sets or changes the password with `auth.updateUser` on the person's own
 * session. The form's `intent=code` button instead emails a code for
 * Supabase's recent sign in check; once asked for, the code goes in as the
 * update's `nonce`. A typed code counts against the sign in limits, and a
 * wrong one waits like a wrong sign in code.
 */
export async function savePassword(prev: PasswordState, form: FormData): Promise<PasswordState> {
  const user = await getUser();
  if (!user) return { error: SIGNED_OUT, notice: null, needsCode: prev.needsCode };
  if (!supabaseConfigured()) return { error: UNAVAILABLE, notice: null, needsCode: prev.needsCode };
  const client = await sessionClient();

  if (form.get("intent") === "code") {
    const { error } = await client.auth.reauthenticate();
    if (error) return { error: codeSendRefusal(error.code), notice: null, needsCode: true };
    return { error: null, notice: `We emailed a 6 digit code to ${user.email}. Type it below with your new password.`, needsCode: true };
  }

  const password = String(form.get("password") ?? "");
  const problem = newPasswordProblem(password, String(form.get("confirm") ?? ""));
  if (problem) return { error: problem, notice: null, needsCode: prev.needsCode };

  let nonce: string | undefined;
  if (prev.needsCode) {
    const code = normalizeCode(form.get("code"));
    if (!code) return { error: "Type the 6 digit code from the email.", notice: null, needsCode: true };
    const hdrs = await headers();
    if (await overLimit(hdrs, user.email)) return { error: "Too many tries. Wait a few minutes, then try again.", notice: null, needsCode: true };
    nonce = code;
  }

  const startedAt = Date.now();
  const { error } = await client.auth.updateUser(nonce ? { password, nonce } : { password });
  if (error) {
    const refusal = passwordRefusal(error.code);
    if (nonce && refusal.needsCode) await wrongAnswerDelay(startedAt);
    return { error: refusal.message, notice: null, needsCode: refusal.needsCode || prev.needsCode };
  }
  await logSecurityEvent("password_set", { userId: user.id, headers: await headers() });
  return { error: null, notice: "Password saved. You can sign in with it from now on.", needsCode: false };
}
