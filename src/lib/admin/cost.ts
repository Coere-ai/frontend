import { toSpend, type Spend } from "@/lib/v1/spend";

import { num } from "./totals";

/**
 * The AI spend figures of /admin/cost, shaped from the two aggregate
 * functions (admin_usage_by_model, admin_top_accounts) that add the rows up
 * in the database. Money stays in integer micro dollars. Pure, so the tests
 * pin the ranges, the totals and the order.
 */

/** The ranges the page offers. Days are UTC, as the database keys them. */
export const COST_RANGES = [
  { value: "today", label: "Today" },
  { value: "month", label: "This month" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
] as const;

export type CostRange = (typeof COST_RANGES)[number]["value"];

/** A range from the query string; anything unknown is the last 30 days. */
export function parseCostRange(raw: string | null | undefined): CostRange {
  return COST_RANGES.some((r) => r.value === raw) ? (raw as CostRange) : "30d";
}

/** The first UTC day a range covers, as YYYY-MM-DD, or null for all time. "30d" is today and the 29 days before it. */
export function rangeStart(range: CostRange, now: number = Date.now()): string | null {
  const d = new Date(now);
  const at = (y: number, m: number, day: number) => new Date(Date.UTC(y, m, day)).toISOString().slice(0, 10);
  if (range === "today") return at(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  if (range === "month") return at(d.getUTCFullYear(), d.getUTCMonth(), 1);
  if (range === "30d") return at(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - 29);
  return null;
}

export interface TokenCounts {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  cacheWriteTokens: number;
  cacheReadTokens: number;
  costMicros: number;
}

/** One model's use in the range. `model` is "" for a charged reservation that names none. */
export interface ModelUsage extends TokenCounts {
  model: string;
}

/** One account's use in the range, with its limits and the spend against each (spend_state). */
export interface AccountUsage extends TokenCounts {
  id: string;
  email: string | null;
  /** Input plus output, as tokens used are counted everywhere else. */
  tokens: number;
  spend: Spend;
}

type Raw = Record<string, unknown>;

function counts(r: Raw): TokenCounts {
  return {
    requests: num(r.requests),
    inputTokens: num(r.input_tokens),
    outputTokens: num(r.output_tokens),
    cacheWriteTokens: num(r.cache_write_tokens),
    cacheReadTokens: num(r.cache_read_tokens),
    costMicros: num(r.cost_micros),
  };
}

/** admin_usage_by_model's rows, largest cost first, ties by requests then name. */
export function toModelUsage(rows: readonly Raw[]): ModelUsage[] {
  return rows
    .map((r) => ({ model: typeof r.model === "string" ? r.model : "", ...counts(r) }))
    .sort((a, b) => b.costMicros - a.costMicros || b.requests - a.requests || a.model.localeCompare(b.model));
}

/** Every model added up, for the table's total row. */
export function totalUsage(rows: readonly TokenCounts[]): TokenCounts {
  const t: TokenCounts = { requests: 0, inputTokens: 0, outputTokens: 0, cacheWriteTokens: 0, cacheReadTokens: 0, costMicros: 0 };
  for (const r of rows) for (const k of Object.keys(t) as (keyof TokenCounts)[]) t[k] += r[k];
  return t;
}

/** admin_top_accounts's rows. A row without an account id is dropped. */
export function toAccountUsage(rows: readonly Raw[]): AccountUsage[] {
  return rows
    .filter((r) => typeof r.user_id === "string")
    .map((r) => {
      const c = counts(r);
      return {
        id: r.user_id as string,
        email: typeof r.email === "string" ? r.email : null,
        ...c,
        tokens: c.inputTokens + c.outputTokens,
        spend: toSpend(r),
      };
    });
}

export const ACCOUNT_SORTS = [
  { value: "cost", label: "Cost" },
  { value: "tokens", label: "Tokens" },
  { value: "requests", label: "Requests" },
] as const;

export type AccountSort = (typeof ACCOUNT_SORTS)[number]["value"];

const SORT_VALUE: Record<AccountSort, (a: AccountUsage) => number> = {
  cost: (a) => a.costMicros,
  tokens: (a) => a.tokens,
  requests: (a) => a.requests,
};

/**
 * The top `n` accounts by one measure, largest first, ties by cost then id
 * so the order is stable. The database sends the top of each measure, so
 * any sort here shows the true top.
 */
export function sortAccounts(rows: readonly AccountUsage[], by: AccountSort, n = 25): AccountUsage[] {
  const value = SORT_VALUE[by];
  return [...rows].sort((a, b) => value(b) - value(a) || b.costMicros - a.costMicros || a.id.localeCompare(b.id)).slice(0, n);
}

/** The total of the days on or after `fromDay` ("2026-11-01"), for this month from the daily series. */
export function sumFromDay(days: readonly { date: string; count: number }[], fromDay: string): number {
  return days.reduce((s, d) => (d.date >= fromDay ? s + d.count : s), 0);
}
