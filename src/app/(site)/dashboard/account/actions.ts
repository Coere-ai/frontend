"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { deleteAccount } from "@/lib/account/delete-account";
import { clearSignedIn } from "@/lib/auth/hint-cookie";
import { normalizeEmail, normalizeUsername, passwordProblem, usernameProblem } from "@/lib/auth/identity";
import { getUser } from "@/lib/auth/user";
import { deleteMemory } from "@/lib/memory/user-memory";
import { readMembership } from "@/lib/org/membership";
import { logSecurityEvent } from "@/lib/security/events";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { sessionClient } from "@/lib/supabase/server";

/**
 * The account page's writes. Each checks the session again and changes
 * only the signed in person's own rows.
 */

export interface FormState {
  error: string | null;
  notice: string | null;
}

const UNAVAILABLE = "That did not work. Try again in a minute.";
const SIGNED_OUT = "You were signed out. Reload the page to sign in again.";
const failed = (error: string): FormState => ({ error, notice: null });

export async function setUsername(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return failed(SIGNED_OUT);
  const raw = String(form.get("username") ?? "");
  const name = normalizeUsername(raw);
  if (!name) return failed(usernameProblem(raw) ?? "Use only letters, numbers and underscores.");
  if (!supabaseConfigured()) return failed(UNAVAILABLE);
  const db = supabase();
  const { data: taken } = await db.from("profiles").select("id").eq("username", name).neq("id", user.id).maybeSingle();
  if (taken) return failed("That username is taken.");
  const { error } = await db.from("profiles").update({ username: name, updated_at: new Date().toISOString() }).eq("id", user.id);
  if (error) return failed(error.code === "23505" ? "That username is taken." : UNAVAILABLE);
  await logSecurityEvent("username_set", { userId: user.id, headers: await headers() });
  return { error: null, notice: `Your username is ${name}. You can sign in with it and your password.` };
}

export async function setPassword(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return failed(SIGNED_OUT);
  const password = String(form.get("password") ?? "");
  const problem = passwordProblem(password);
  if (problem) return failed(problem);
  if (password !== String(form.get("confirm") ?? "")) return failed("The two passwords are not the same.");
  const { error } = await (await sessionClient()).auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") return failed("That is already your password.");
    if (error.code === "weak_password") return failed("Choose a password that is harder to guess.");
    if (error.code === "reauthentication_needed") return failed("Sign out, sign in again with an emailed code, then set your password.");
    return failed(UNAVAILABLE);
  }
  await logSecurityEvent("password_set", { userId: user.id, headers: await headers() });
  return { error: null, notice: "Password saved. You can sign in with it from now on." };
}

/** Revokes one of the person's own browsers; a device id that is not theirs changes nothing. */
export async function revokeDevice(deviceId: string): Promise<{ ok: boolean }> {
  const user = await getUser();
  if (!user || typeof deviceId !== "string" || !supabaseConfigured()) return { ok: false };
  const { data, error } = await supabase()
    .from("devices")
    .update({ revoked_at: new Date().toISOString(), revoked_reason: "user" })
    .eq("id", deviceId)
    .eq("user_id", user.id)
    .is("revoked_at", null)
    .select("id");
  if (error) return { ok: false };
  if (data && data.length > 0) await logSecurityEvent("device_revoked", { userId: user.id, headers: await headers() });
  return { ok: true };
}

/** Deletes the stored memory copy. With the backup on, Coere uploads a new one at its next push. */
export async function deleteMemoryCopy(): Promise<{ ok: boolean }> {
  const user = await getUser();
  if (!user || !supabaseConfigured()) return { ok: false };
  try {
    const membership = await readMembership(user.id);
    await deleteMemory(user.id, membership?.orgId ?? null);
    await logSecurityEvent("memory_deleted", { userId: user.id, orgId: membership?.orgId ?? null, headers: await headers() });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/** Deletes the account once the person has typed their own email, then signs this browser out. */
export async function deleteAccountAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return failed(SIGNED_OUT);
  if (normalizeEmail(form.get("email")) !== user.email.toLowerCase()) return failed("Type your email exactly as it shows above.");
  if (!supabaseConfigured()) return failed(UNAVAILABLE);
  const done = await deleteAccount(user.id);
  if (!done.ok) {
    return failed(
      done.reason === "last_admin" ? "You are the only admin of your organization. Make another member an admin first, then delete your account." : UNAVAILABLE,
    );
  }
  const hdrs = await headers();
  await (await sessionClient()).auth.signOut({ scope: "local" }).catch(() => undefined);
  await clearSignedIn();
  await logSecurityEvent("account_deleted", { headers: hdrs });
  redirect("/");
}
