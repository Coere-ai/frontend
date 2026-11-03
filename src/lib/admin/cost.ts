import { num } from "./totals";

/**
 * AI spend added up from usage_events for /admin/cost: by model, by
 * account, and since a moment. Money stays in integer micro dollars. Pure,
 * so the tests pin the totals and the order.
 */

export interface UsageCostRow {
  user_id: string | null;
  model: string | null;
  cost_micros: unknown;
  created_at: string;
}

export interface CostBucket {
  key: string | null;
  costMicros: number;
  requests: number;
}

/** Each key's spend and request count, largest spend first, at most `n`. */
export function costBy(rows: readonly UsageCostRow[], key: (r: UsageCostRow) => string | null, n = 20): CostBucket[] {
  const sums = new Map<string | null, CostBucket>();
  for (const r of rows) {
    const k = key(r);
    const b = sums.get(k) ?? { key: k, costMicros: 0, requests: 0 };
    b.costMicros += num(r.cost_micros);
    b.requests += 1;
    sums.set(k, b);
  }
  return [...sums.values()].sort((a, b) => b.costMicros - a.costMicros || b.requests - a.requests || String(a.key).localeCompare(String(b.key))).slice(0, n);
}

/** Spend on rows at or after `sinceIso`. */
export function costSince(rows: readonly UsageCostRow[], sinceIso: string): number {
  const since = Date.parse(sinceIso);
  let total = 0;
  for (const r of rows) if (Date.parse(r.created_at) >= since) total += num(r.cost_micros);
  return total;
}

/** The total of the days on or after `fromDay` ("2026-11-01"), for this month from the daily series. */
export function sumFromDay(days: readonly { date: string; count: number }[], fromDay: string): number {
  return days.reduce((s, d) => (d.date >= fromDay ? s + d.count : s), 0);
}
