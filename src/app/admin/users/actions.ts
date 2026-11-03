"use server";

import { headers } from "next/headers";

import { adminAction, check, done, refused, type AdminResult } from "@/lib/admin/action";
import { isUuid } from "@/lib/admin/http";
import { parseDollars } from "@/lib/admin/money";
import { logSecurityEvent } from "@/lib/security/events";
import { supabase } from "@/lib/supabase";

/**
 * What the operator changes on an account: its plan, its own dollar
 * limits, suspend or restore, and revoking every device. Each re-checks the
 * admin session and writes only the one account it names.
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
    const monthly = parseDollars(form.get("monthly"));
    if (!monthly.ok) return refused(`Monthly limit: ${monthly.error}`);
    const lifetime = parseDollars(form.get("lifetime"));
    if (!lifetime.ok) return refused(`Lifetime limit: ${lifetime.error}`);
    const { data, error } = await supabase()
      .from("profiles")
      .update({ monthly_limit_micros: monthly.micros, lifetime_limit_micros: lifetime.micros, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select("id");
    check(error, "profiles update");
    return data?.length ? done("Limits saved.") : refused(NO_ACCOUNT);
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
