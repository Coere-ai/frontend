import "server-only";

import { supabase } from "@/lib/supabase";

import { windowStart } from "./by-day";
import { parseCostRange, rangeStart, sumFromDay, toAccountUsage, toModelUsage, totalUsage } from "./cost";
import { storageMonthMicros } from "./money";
import { readAll } from "./read-all";
import { STAT_DAYS } from "./statistics";
import { readStorageUsage } from "./storage-usage";
import { dailySeries, type DailyTotalsRow } from "./totals";
import type { CostPayload } from "./types";
import { monthKey } from "./user-rows";

/**
 * /admin/cost. Spend by day comes from daily_totals, which keeps a deleted
 * account's spend. The split by model and the top accounts come from two
 * functions that add the range up in the database (admin_usage_by_model,
 * admin_top_accounts), so a busy month never means reading every call.
 * Storage is priced from the buckets' own size.
 */

/** How many accounts the database sends for each of cost, tokens and requests. */
const TOP_ACCOUNTS = 50;

export async function loadCost(rawRange: string | null): Promise<CostPayload> {
  const db = supabase();
  const range = parseCostRange(rawRange);
  const from = rangeStart(range);
  const [days, models, accounts, storage] = await Promise.all([
    readAll<DailyTotalsRow>((a, b) => db.from("daily_totals").select("day, cost_micros").gte("day", windowStart(STAT_DAYS).slice(0, 10)).order("day").range(a, b), 1000),
    db.rpc("admin_usage_by_model", { p_from: from }),
    db.rpc("admin_top_accounts", { p_from: from, p_limit: TOP_ACCOUNTS }),
    readStorageUsage(),
  ]);
  if (models.error) throw new Error(`admin_usage_by_model failed: ${models.error.code}`);
  if (accounts.error) throw new Error(`admin_top_accounts failed: ${accounts.error.code}`);
  const daily = dailySeries(days, STAT_DAYS).map((d) => ({ date: d.date, count: d.costMicros }));
  const byModel = toModelUsage((models.data ?? []) as Record<string, unknown>[]);
  const storageBytes = storage.filter((r) => r.folder === null).reduce((s, r) => s + r.bytes, 0);

  return {
    range,
    from,
    daily,
    monthMicros: sumFromDay(daily, monthKey()),
    todayMicros: daily.at(-1)?.count ?? 0,
    byModel,
    total: totalUsage(byModel),
    accounts: toAccountUsage((accounts.data ?? []) as Record<string, unknown>[]),
    storageBytes,
    storageMonthMicros: storageMonthMicros(storageBytes),
  };
}
