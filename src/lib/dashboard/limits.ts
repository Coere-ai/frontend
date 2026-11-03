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
