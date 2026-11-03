/**
 * Day buckets for the admin charts. Every day is a UTC date ("2026-11-03"),
 * because daily_totals is keyed by the UTC day, and every series is zero
 * filled so a quiet day still takes its place on the axis. Pure.
 */

export interface DayPoint {
  date: string;
  count: number;
}

const DAY_MS = 86_400_000;

/** The UTC day of a timestamp, or null when it is not one. */
export function utcDay(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : new Date(t).toISOString().slice(0, 10);
}

/** The `days` UTC days ending with the day of `now`, oldest first. */
export function dayKeys(days: number, now: number = Date.now()): string[] {
  const end = Math.floor(now / DAY_MS) * DAY_MS;
  const out: string[] = [];
  for (let i = Math.max(1, days) - 1; i >= 0; i--) out.push(new Date(end - i * DAY_MS).toISOString().slice(0, 10));
  return out;
}

/** Adds each row's value into its day. Rows outside the window are left out. */
export function sumByDay<T>(rows: readonly T[], dayOf: (r: T) => string | null, value: (r: T) => number, days: number, now: number = Date.now()): DayPoint[] {
  const keys = dayKeys(days, now);
  const sums = new Map(keys.map((k) => [k, 0]));
  for (const r of rows) {
    const k = dayOf(r);
    if (k !== null && sums.has(k)) sums.set(k, (sums.get(k) ?? 0) + (Number(value(r)) || 0));
  }
  return keys.map((date) => ({ date, count: sums.get(date) ?? 0 }));
}

/** How many of the timestamps fall on each day. */
export function countByDay(isos: readonly (string | null)[], days: number, now: number = Date.now()): DayPoint[] {
  return sumByDay(isos, (iso) => utcDay(iso), () => 1, days, now);
}

/** The ISO time `days` whole UTC days before today's midnight, the start of a window that `dayKeys` names. */
export function windowStart(days: number, now: number = Date.now()): string {
  const end = Math.floor(now / DAY_MS) * DAY_MS;
  return new Date(end - (Math.max(1, days) - 1) * DAY_MS).toISOString();
}
