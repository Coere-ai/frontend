import type { SpentLimit } from "./gate-types";

/**
 * Which spend limit, if any, stops a metered call (docs/accounts.md 8.10).
 * Every limit and its spend arrive already resolved from device_auth, which
 * reads them from spend_state(). The lifetime limit applies always. Until
 * the first memory build has finished, the first build allowance applies in
 * place of the monthly and daily limits. After it, the monthly limit applies
 * to the month's spend after the first build, and the daily limit too when
 * the operator set one (null means none, the default). They are named in
 * the order they last: a spent lifetime limit waits for the operator, and so
 * does a spent first build allowance; a spent month waits for the next month
 * and a spent day for the next UTC day. So a refusal never sends the person
 * waiting for a day that will not help.
 */

export interface Spend {
  monthlyLimitMicros: number;
  /** This UTC month's spend after the first build; 0 while it runs. */
  monthCostMicros: number;
  /** Null means no lifetime limit. */
  lifetimeLimitMicros: number | null;
  lifetimeCostMicros: number;
  /** Null means no daily limit, the default on every plan. */
  dailyLimitMicros: number | null;
  /** This UTC day's spend after the first build; 0 while it runs. */
  dayCostMicros: number;
  firstBuildDone: boolean;
  firstBuildLimitMicros: number;
  /** What the first build has spent so far; 0 once it is done. */
  firstBuildCostMicros: number;
}

export function spentLimit(s: Spend): SpentLimit | null {
  if (s.lifetimeLimitMicros !== null && s.lifetimeCostMicros >= s.lifetimeLimitMicros) return "lifetime";
  if (!s.firstBuildDone) return s.firstBuildCostMicros >= s.firstBuildLimitMicros ? "first_build" : null;
  if (s.monthCostMicros >= s.monthlyLimitMicros) return "monthly";
  if (s.dailyLimitMicros !== null && s.dayCostMicros >= s.dailyLimitMicros) return "daily";
  return null;
}

const count = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const countOrNull = (v: unknown): number | null => (v === null || v === undefined ? null : count(v));

/**
 * A spend_state() row (or the same columns of device_auth or
 * admin_top_accounts) as a Spend. A missing or broken number reads as 0, a
 * missing lifetime or daily limit as none.
 */
export function toSpend(r: Record<string, unknown>): Spend {
  return {
    monthlyLimitMicros: count(r.monthly_limit_micros),
    monthCostMicros: count(r.month_cost_micros),
    lifetimeLimitMicros: countOrNull(r.lifetime_limit_micros),
    lifetimeCostMicros: count(r.lifetime_cost_micros),
    dailyLimitMicros: countOrNull(r.daily_limit_micros),
    dayCostMicros: count(r.day_cost_micros),
    firstBuildDone: r.first_build_done === true,
    firstBuildLimitMicros: count(r.first_build_limit_micros),
    firstBuildCostMicros: count(r.first_build_cost_micros),
  };
}

/** Seconds until the first day of next month in UTC, for a spent month's retry-after. */
export function secondsToNextMonth(now = new Date()): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000));
}

/** Seconds until the next UTC midnight, when a spent day starts again. */
export function secondsToNextDay(now = new Date()): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000));
}

/**
 * How long a caller should wait before trying again. A spent month comes back
 * on the first of the next and a spent day at the next UTC midnight. A spent
 * lifetime limit or first build allowance comes back only when the operator
 * acts, so the answer is the hour the extension's runtime waits anyway.
 */
export function spendRetryAfter(limit: SpentLimit, now = new Date()): number {
  if (limit === "monthly") return secondsToNextMonth(now);
  if (limit === "daily") return secondsToNextDay(now);
  return 3600;
}

/** reserve_spend names the limit that refused it; anything else reads as the month, as before. */
export function refusedLimit(word: string | null | undefined): SpentLimit {
  return word === "lifetime" || word === "daily" || word === "first_build" ? word : "monthly";
}
