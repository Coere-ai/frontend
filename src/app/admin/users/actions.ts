"use server";

import { headers } from "next/headers";

import { adminAction, check, done, refused, type AdminResult } from "@/lib/admin/action";
import { isUuid } from "@/lib/admin/http";
import { LIMIT_COLUMNS, LIMIT_KINDS, readAccountLimits } from "@/lib/admin/limit-input";
import { passwordProblem } from "@/lib/auth/identity";
import { logSecurityEvent } from "@/lib/security/events";
import { supabase } from "@/lib/supabase";

/**
 * What the operator changes on an account: its plan, its own dollar
 * limits (daily, first build, monthly and lifetime), its free first build,
 * suspend or restore, revoking every device, and a new password for a
 * person who forgot theirs. Each re-checks the admin
 * session and writes only the one account it names.
 */

const NO_ACCOUNT = "That account is gone. Reload the page.";

export async function setPlan(userId: string, form: FormData): Promise<AdminResult> {
  return adminAction("setPlan", async () => {
    const plan = String(form.get("plan") ?? "");
    if (!isUuid(userId) || !/^[a-z0-9_-]{1,40}$/.test(plan)) return refused(NO_ACCOUNT);
    const db = supabase();
    const { data: known } = await db.from("plans").select("id").eq("id", plan).maybeSingle();
    if (!known) return refused("That plan does not exist.");
    const { data, error } = await db.from("profiles").update({ plan_id: plan, updated_at: new Date().toISOString() }).eq("id", userId).select("id");
    check(error, "profiles update");
    return data?.length ? done("Plan changed.") : refused(NO_ACCOUNT);
  });
}

/** Blank stores null, which means the plan's limit. */
export async function setLimits(userId: string, form: FormData): Promise<AdminResult> {
  return adminAction("setLimits", async () => {
    if (!isUuid(userId)) return refused(NO_ACCOUNT);
    const input = readAccountLimits((name) => form.get(name));
    if (!input.ok) return refused(input.error);
    const row: Record<string, number | string | null> = { updated_at: new Date().toISOString() };
    for (const kind of LIMIT_KINDS) row[LIMIT_COLUMNS[kind]] = input.limits[kind];
    const { data, error } = await supabase().from("profiles").update(row).eq("id", userId).select("id");
    check(error, "profiles update");
    return data?.length ? done("Limits saved.") : refused(NO_ACCOUNT);
  });
}

/**
 * Gives the account its free first build again: the daily limit waits for
 * its next finished memory build, and the first build allowance counts only
 * what it spends from now on (reset_first_build).
 */
export async function resetFirstBuild(userId: string): Promise<AdminResult> {
  return adminAction("resetFirstBuild", async () => {
    if (!isUuid(userId)) return refused(NO_ACCOUNT);
    const { data, error } = await supabase().rpc("reset_first_build", { p_user: userId });
    check(error, "reset_first_build");
    return data === true ? done("The free first build is available again.") : refused(NO_ACCOUNT);
  });
}

/** A suspended account's devices stop working at their next request; restoring lets them back. */
export async function setStatus(userId: string, status: string): Promise<AdminResult> {
  return adminAction("setStatus", async () => {
    if (!isUuid(userId) || (status !== "active" && status !== "suspended")) return refused(NO_ACCOUNT);
    const { data, error } = await supabase().from("profiles").update({ status, updated_at: new Date().toISOString() }).eq("id", userId).select("id");
    check(error, "profiles update");
    if (!data?.length) return refused(NO_ACCOUNT);
    return done(status === "suspended" ? "Account suspended." : "Account restored.");
  });
}

export async function revokeAllDevices(userId: string): Promise<AdminResult> {
  return adminAction("revokeAllDevices", async () => {
    if (!isUuid(userId)) return refused(NO_ACCOUNT);
    const { data, error } = await supabase()
      .from("devices")
      .update({ revoked_at: new Date().toISOString(), revoked_reason: "admin" })
      .eq("user_id", userId)
      .is("revoked_at", null)
      .select("id");
    check(error, "devices update");
    const count = data?.length ?? 0;
    if (count > 0) await logSecurityEvent("device_revoked", { userId, headers: await headers() });
    return done(count === 0 ? "No device was connected." : `Revoked ${count} ${count === 1 ? "device" : "devices"}.`);
  });
}

/**
 * Sets a new password for a person who forgot theirs and asked through the
 * contact email: coere.ai sends no reset email. The operator tells the
 * person the password some other way, and the person changes it on
 * /account. Written with the secret key; the event names the account.
 */
export async function setPassword(userId: string, form: FormData): Promise<AdminResult> {
  return adminAction("setPassword", async () => {
    if (!isUuid(userId)) return refused(NO_ACCOUNT);
    const password = String(form.get("password") ?? "");
    const problem = passwordProblem(password);
    if (problem) return refused(problem);
    const { error } = await supabase().auth.admin.updateUserById(userId, { password });
    if (error?.status === 404 || error?.code === "user_not_found") return refused(NO_ACCOUNT);
    if (error?.code === "weak_password") return refused("Pick a stronger password.");
    check(error, "auth password update");
    await logSecurityEvent("password_set", { userId, headers: await headers() });
    return done("Password set. Tell the person, and ask them to change it on their account page.");
  });
}
