"use server";

import { adminAction, check, done, refused, type AdminResult } from "@/lib/admin/action";
import { checkClear, isPlanId, LIMIT_COLUMNS, LIMIT_KINDS, readDailyForAll, readPlanLimits } from "@/lib/admin/limit-input";
import { dollars } from "@/lib/dashboard/format";
import { supabase } from "@/lib/supabase";

/**
 * What the operator changes on /admin/limits: one plan's four spend limits,
 * the daily limit of every plan at once, and clearing every account's own
 * value for one limit. Each re-checks the admin session and the input
 * (limit-input.ts) before it writes, and logs nothing but an error's code.
 * The limits are read on every metered call through device_auth, so a
 * change applies from the next request.
 */

const NO_PLAN = "That plan is gone. Reload the page.";

export async function savePlanLimits(planId: string, form: FormData): Promise<AdminResult> {
  return adminAction("savePlanLimits", async () => {
    if (!isPlanId(planId)) return refused(NO_PLAN);
    const input = readPlanLimits((name) => form.get(name));
    if (!input.ok) return refused(input.error);
    const row: Record<string, number | null> = {};
    for (const kind of LIMIT_KINDS) row[LIMIT_COLUMNS[kind]] = input.limits[kind];
    const { data, error } = await supabase().from("plans").update(row).eq("id", planId).select("id");
    check(error, "plans update");
    return data?.length ? done("Plan limits saved. They apply from the next request.") : refused(NO_PLAN);
  });
}

/** The one global switch: the same daily limit on every plan, or blank for none. Accounts with their own keep it. */
export async function setDailyForAllPlans(form: FormData): Promise<AdminResult> {
  return adminAction("setDailyForAllPlans", async () => {
    const daily = readDailyForAll(form.get("daily"));
    if (!daily.ok) return refused(daily.error);
    const { data, error } = await supabase().from("plans").update({ daily_limit_micros: daily.micros }).not("id", "is", null).select("id");
    check(error, "plans update");
    const n = data?.length ?? 0;
    const now = daily.micros === null ? "off" : dollars(daily.micros);
    return done(`Every plan's daily limit is now ${now} (${n} ${n === 1 ? "plan" : "plans"}).`);
  });
}

/** Sets one limit back to the plan's on every account that has its own. */
export async function clearOverrides(kind: string, confirmed: boolean): Promise<AdminResult> {
  return adminAction("clearOverrides", async () => {
    const clear = checkClear(kind, confirmed);
    if (!clear.ok) return refused(clear.error);
    const { data, error } = await supabase()
      .from("profiles")
      .update({ [clear.column]: null, updated_at: new Date().toISOString() })
      .not(clear.column, "is", null)
      .select("id");
    check(error, "profiles update");
    const n = data?.length ?? 0;
    return done(n === 0 ? "No account had its own value." : `Cleared on ${n} ${n === 1 ? "account" : "accounts"}. They follow their plan now.`);
  });
}
