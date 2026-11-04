import type { SpentLimit } from "./gate-types";

/**
 * Which spend limit, if any, stops a metered call (docs/accounts.md 8.10).
 * Every limit arrives already resolved from device_auth. They are named in
 * the order they last: a spent lifetime limit waits for the operator, and so
 * does a spent first build allowance (unless the build finishes); a spent
 * month waits for the next month and a spent day for the next UTC day. So a
 * refusal never sends the person waiting for a day that will not help.
 */

export interface Spend {
  monthlyLimitMicros: number;
  /** Null means no lifetime limit. */
  lifetimeLimitMicros: number | null;
  monthCostMicros: number;
  lifetimeCostMicros: number;
  /** The daily limit, or the first build allowance while `firstBuildDone` is false. */
  dailyLimitMicros: number;
  /** Today's spend (UTC), or the first build's spend so far while it runs. */
  dayCostMicros: number;
  firstBuildDone: boolean;
}

export function spentLimit(s: Spend): SpentLimit | null {
  const dayOver = s.dayCostMicros >= s.dailyLimitMicros;
  if (s.lifetimeLimitMicros !== null && s.lifetimeCostMicros >= s.lifetimeLimitMicros) return "lifetime";
  if (!s.firstBuildDone && dayOver) return "first_build";
  if (s.monthCostMicros >= s.monthlyLimitMicros) return "monthly";
  if (s.firstBuildDone && dayOver) return "daily";
  return null;
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
