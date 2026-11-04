import { spentLimit, type Spend } from "@/lib/v1/spend";

/**
 * The spend limits that apply to one account right now, each with what it
 * has spent against it, the way the gate reads them (docs/accounts.md 8.10):
 * the first build allowance until the first memory build finishes, then the
 * month (spend after the first build) and the day when a daily limit is set,
 * and the lifetime limit when there is one. For the operator's pages only;
 * the person never sees any of it. Pure, so a test pins it to the gate.
 */

export interface LimitLine {
  label: "First build" | "This month" | "Today" | "Lifetime";
  spentMicros: number;
  limitMicros: number;
  reached: boolean;
}

const line = (label: LimitLine["label"], spentMicros: number, limitMicros: number): LimitLine => ({ label, spentMicros, limitMicros, reached: spentMicros >= limitMicros });

export function limitsInForce(s: Spend): LimitLine[] {
  const lines: LimitLine[] = [];
  if (!s.firstBuildDone) {
    lines.push(line("First build", s.firstBuildCostMicros, s.firstBuildLimitMicros));
  } else {
    lines.push(line("This month", s.monthCostMicros, s.monthlyLimitMicros));
    if (s.dailyLimitMicros !== null) lines.push(line("Today", s.dayCostMicros, s.dailyLimitMicros));
  }
  if (s.lifetimeLimitMicros !== null) lines.push(line("Lifetime", s.lifetimeCostMicros, s.lifetimeLimitMicros));
  return lines;
}

/** True while a limit stops the account's AI calls, by the gate's own rule. */
export const paused = (s: Spend): boolean => spentLimit(s) !== null;
