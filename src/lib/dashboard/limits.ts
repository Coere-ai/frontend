import { percent } from "./format";

/**
 * The spend limits the dashboard shows, resolved the way device_auth does
 * (docs/accounts.md 8.10): the person's own when the operator set one, else
 * the plan's. The page reads the rows through the person's session, so it
 * resolves them itself instead of calling the server only function. Pure,
 * so the rule is pinned by a test and cannot drift from the database's.
 */

export interface Limits {
  monthlyMicros: number;
  /** Null means no lifetime limit. */
  lifetimeMicros: number | null;
  /** True when the operator set this person's monthly limit, so the page does not credit the plan. */
  ownMonthly: boolean;
}

export function resolveLimits(
  own: { monthlyLimitMicros: number | null; lifetimeLimitMicros: number | null } | null,
  plan: { monthlyLimitMicros: number; lifetimeLimitMicros: number | null },
): Limits {
  const ownMonthly = own?.monthlyLimitMicros ?? null;
  return {
    monthlyMicros: ownMonthly ?? plan.monthlyLimitMicros,
    lifetimeMicros: own?.lifetimeLimitMicros ?? plan.lifetimeLimitMicros,
    ownMonthly: ownMonthly !== null,
  };
}

/** The share of a limit spent, in whole percent. A limit of zero is spent, unlike a plain ratio. */
export function spentShare(used: number, limit: number): number {
  return limit <= 0 ? 100 : percent(used, limit);
}

/**
 * True only while the daily limit is reached: the free first build is done
 * and today's spend is at the limit. A spent first build allowance is not
 * "until tomorrow", so it reads false, as does a missing row.
 */
export function pausedToday(row: { daily_limit_micros?: unknown; day_cost_micros?: unknown; first_build_done?: unknown } | null | undefined): boolean {
  if (!row || row.first_build_done !== true) return false;
  const limit = Number(row.daily_limit_micros);
  const spent = Number(row.day_cost_micros);
  return Number.isFinite(limit) && Number.isFinite(spent) && spent >= limit;
}
