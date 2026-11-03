import { dayKeys, utcDay } from "./by-day";

/**
 * The security log added up for /admin/security: sign ins and failures by
 * UTC day, and how many of each kind there were in the window. Pure, so
 * the tests pin which kinds land in which line.
 */

export interface SecurityEventRow {
  kind: string;
  created_at: string;
}

export interface SecurityDay {
  date: string;
  signIns: number;
  failures: number;
  adminFailures: number;
}

/** Which line each kind adds to. Admin sign ins are the operator's own and stay apart from the accounts'. */
const LINE: Record<string, keyof Omit<SecurityDay, "date">> = {
  sign_in: "signIns",
  sign_in_failed: "failures",
  admin_sign_in_failed: "adminFailures",
};

export function summarizeSecurity(rows: readonly SecurityEventRow[], days: number, now: number = Date.now()): { daily: SecurityDay[]; counts: Record<string, number> } {
  const daily = dayKeys(days, now).map((date) => ({ date, signIns: 0, failures: 0, adminFailures: 0 }));
  const byDate = new Map(daily.map((d) => [d.date, d]));
  const counts: Record<string, number> = {};
  for (const r of rows) {
    const d = byDate.get(utcDay(r.created_at) ?? "");
    if (!d) continue;
    counts[r.kind] = (counts[r.kind] ?? 0) + 1;
    const line = LINE[r.kind];
    if (line) d[line] += 1;
  }
  return { daily, counts };
}
