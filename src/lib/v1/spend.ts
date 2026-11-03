import type { SpentLimit } from "./gate-types";

/**
 * Which spend limit, if any, stops a metered call (docs/accounts.md 8.10).
 * Both limits arrive already resolved from device_auth. The lifetime limit
 * is checked first: when it is spent, a new month does not help, so naming
 * the month would send the person waiting for nothing.
 */

export interface Spend {
  monthlyLimitMicros: number;
  /** Null means no lifetime limit. */
  lifetimeLimitMicros: number | null;
  monthCostMicros: number;
  lifetimeCostMicros: number;
}

export function spentLimit(s: Spend): SpentLimit | null {
  if (s.lifetimeLimitMicros !== null && s.lifetimeCostMicros >= s.lifetimeLimitMicros) return "lifetime";
  if (s.monthCostMicros >= s.monthlyLimitMicros) return "monthly";
  return null;
}

/** Seconds until the first day of next month in UTC, for a spent month's retry-after. */
export function secondsToNextMonth(now = new Date()): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000));
}

/**
 * How long a caller should wait before trying again. A spent month comes back
 * on the first of the next; a spent lifetime only when the operator raises
 * it, so the answer is the hour the extension's runtime waits anyway.
 */
export function spendRetryAfter(limit: SpentLimit, now = new Date()): number {
  return limit === "monthly" ? secondsToNextMonth(now) : 3600;
}
