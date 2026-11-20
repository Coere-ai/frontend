"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { parseDisplayName } from "@/lib/account/display-name";
import { currentPasswordRefusal, newPasswordProblem, passwordRefusal, UNAVAILABLE } from "@/lib/account/password-change";
import { setUsername } from "@/lib/account/username";
import { checkCurrentPassword } from "@/lib/auth/current-password";
import { normalizeUsername, usernameProblem } from "@/lib/auth/identity";
import { getUser } from "@/lib/auth/user";
import { logSecurityEvent } from "@/lib/security/events";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { accountsConfigured, sessionClient } from "@/lib/supabase/server";

/**
 * The /account writes for how a person shows and signs in: their display
 * name, their username and their password (docs/accounts.md 3.1 and 7).
 * Each checks the web session again; a device token never reaches these.
 * The username and the password, how the account signs in, change only
 * with the current password typed again, so a browser someone left signed
 * in cannot be used to lock its owner out.
 */

/** A one field form's answer. `value` puts back what was typed, since React resets the form after each submit. */
export interface FieldState {
  error: string | null;
  notice: string | null;
  value?: string;
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
  return { error: null, notice: parsed.name ? "Name saved." : "Name cleared. Your organization sees your username.", value: parsed.name ?? "" };
}

/**
 * Changes the username, the name the person signs in with, checked unique
 * on the server with the secret key, after the current password. The
 * account's placeholder email stays as it was: sign in finds the email
 * through the username.
 */
export async function saveUsername(_prev: FieldState, form: FormData): Promise<FieldState> {
  const raw = String(form.get("username") ?? "").slice(0, 64);
  const user = await getUser();
  if (!user) return { error: SIGNED_OUT, notice: null, value: raw };
  const name = normalizeUsername(raw);
  if (!name) return { error: usernameProblem(raw) ?? "Use only letters, numbers and underscores.", notice: null, value: raw };
  if (!supabaseConfigured()) return { error: UNAVAILABLE, notice: null, value: raw };
  const head = await headers();
  const refused = currentPasswordRefusal(await checkCurrentPassword(user, String(form.get("currentPassword") ?? ""), head));
  if (refused) return { error: refused, notice: null, value: raw };
  const done = await setUsername(user.id, name).catch(() => null);
  if (!done) return { error: UNAVAILABLE, notice: null, value: raw };
  if (done === "taken") return { error: "That username is taken.", notice: null, value: raw };
  if (done === "unchanged") return { error: null, notice: `${name} is already your username.`, value: name };
  await logSecurityEvent("username_set", { userId: user.id, headers: head });
  revalidatePath("/account");
  return { error: null, notice: `Your username is ${name}. Sign in with it from now on.`, value: name };
}

/**
 * Changes the password with `auth.updateUser` on the person's own session,
 * after the current password. Supabase's Secure password change is off (docs/launch.md 4), so nothing
 * is emailed; should Supabase still want a recent sign in, the form says to
 * sign in again.
 */
export async function savePassword(_prev: FieldState, form: FormData): Promise<FieldState> {
  const user = await getUser();
  if (!user) return { error: SIGNED_OUT, notice: null };
  if (!accountsConfigured()) return { error: UNAVAILABLE, notice: null };
  const password = String(form.get("password") ?? "");
  const problem = newPasswordProblem(password, String(form.get("confirm") ?? ""));
  if (problem) return { error: problem, notice: null };
  const head = await headers();
  const refused = currentPasswordRefusal(await checkCurrentPassword(user, String(form.get("currentPassword") ?? ""), head));
  if (refused) return { error: refused, notice: null };

  const { error } = await (await sessionClient()).auth.updateUser({ password });
  if (error) return { error: passwordRefusal(error.code), notice: null };
  await logSecurityEvent("password_set", { userId: user.id, headers: head });
  return { error: null, notice: "Password changed. Use it the next time you sign in." };
}
