import "server-only";

import { supabase } from "@/lib/supabase";

import { windowStart } from "./by-day";
import { costBy, costSince, sumFromDay, type UsageCostRow } from "./cost";
import { personName } from "./memory-view";
import { storageMonthMicros } from "./money";
import { readAll } from "./read-all";
import { STAT_DAYS } from "./statistics";
import { readStorageUsage } from "./storage-usage";
import { dailySeries, type DailyTotalsRow } from "./totals";
import type { CostPayload } from "./types";
import { monthKey } from "./user-rows";

/**
 * /admin/cost. Spend by day comes from daily_totals, which keeps a deleted
 * account's spend. By model, by account and the last 24 hours come from
 * the last BREAKDOWN_DAYS of usage_events. Storage is priced from the
 * buckets' own size.
 */
const BREAKDOWN_DAYS = 30;
const MAX_EVENTS = 200_000;

export async function loadCost(): Promise<CostPayload> {
  const db = supabase();
  const [days, events, storage] = await Promise.all([
    readAll<DailyTotalsRow>((a, b) => db.from("daily_totals").select("day, cost_micros").gte("day", windowStart(STAT_DAYS).slice(0, 10)).order("day").range(a, b), 1000),
    readAll<UsageCostRow>(
      (a, b) => db.from("usage_events").select("user_id, model, cost_micros, created_at").gte("created_at", windowStart(BREAKDOWN_DAYS)).order("created_at", { ascending: false }).range(a, b),
      MAX_EVENTS + 1,
    ),
    readStorageUsage(),
  ]);
  const rows = events.slice(0, MAX_EVENTS);
  const daily = dailySeries(days, STAT_DAYS).map((d) => ({ date: d.date, count: d.costMicros }));
  const byAccount = costBy(rows, (r) => r.user_id);
  const ids = byAccount.map((b) => b.key).filter((k): k is string => !!k);
  const { data: people } = ids.length ? await db.from("profiles").select("id, display_name, username, email").in("id", ids) : { data: [] };
  const name = new Map((people ?? []).map((p) => [p.id as string, p.email ?? personName(p)]));
  const storageBytes = storage.filter((r) => r.folder === null).reduce((s, r) => s + r.bytes, 0);

  return {
    daily,
    monthMicros: sumFromDay(daily, monthKey()),
    last24hMicros: costSince(rows, new Date(Date.now() - 86_400_000).toISOString()),
    breakdownDays: BREAKDOWN_DAYS,
    breakdownCapped: events.length > MAX_EVENTS,
    byModel: costBy(rows, (r) => r.model).map((b) => ({ model: b.key ?? "Unknown", costMicros: b.costMicros, requests: b.requests })),
    byAccount: byAccount.map((b) => ({ id: b.key, name: b.key ? (name.get(b.key) ?? "A deleted account") : "Deleted accounts", costMicros: b.costMicros, requests: b.requests })),
    storageBytes,
    storageMonthMicros: storageMonthMicros(storageBytes),
  };
}
