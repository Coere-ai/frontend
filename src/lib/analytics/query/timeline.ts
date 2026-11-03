import {
  HOURLY_WINDOW_DAYS,
  dayKeyOf,
  fillHourly,
  hourKeyOf,
  hourKeyWindow,
  localCarrier,
  type HourlySeries,
} from "@/lib/time-series";

import type { SiteDailyPoint, SiteHourlyPoint } from "../types";

import type { VisitRow } from "./rows";
import { groupBy, mean, uniques } from "./stats";

// Traffic over time, bucketed in the viewer's timezone.

const DAY_MS = 86_400_000;

export type HourlyTraffic = {
  views: HourlySeries;
  uniques: HourlySeries;
  conversions: HourlySeries;
  /** A MEAN, not a sum. Nothing that plots it may cumulate it. */
  avgSeconds: HourlySeries;
};

const converted = (rows: VisitRow[]) => rows.filter((r) => r.converted).length;
const avgSeconds = (rows: VisitRow[]) =>
  Math.round(mean(rows.map((r) => r.duration_seconds)));

/** One point per day of the window, oldest first, zero-filled. */
export function dailySeries(visits: VisitRow[], days: number, tz: string, now: Date): SiteDailyPoint[] {
  const byDay = groupBy(visits, (v) => dayKeyOf(localCarrier(new Date(v.created_at), tz)));
  const out: SiteDailyPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = dayKeyOf(localCarrier(new Date(now.getTime() - i * DAY_MS), tz));
    const rows = byDay.get(key) ?? [];
    out.push({
      date: key,
      views: rows.length,
      uniques: uniques(rows),
      conversions: converted(rows),
      avgSeconds: avgSeconds(rows),
    });
  }
  return out;
}

/** Today, hour by hour. Always 24 entries. */
export function todayByHour(visits: VisitRow[], tz: string, now: Date): SiteHourlyPoint[] {
  const todayKey = dayKeyOf(localCarrier(now, tz));
  const today = visits.filter(
    (v) => dayKeyOf(localCarrier(new Date(v.created_at), tz)) === todayKey,
  );
  const byHour = groupBy(today, (v) =>
    hourKeyOf(localCarrier(new Date(v.created_at), tz)).slice(11, 13),
  );
  return Array.from({ length: 24 }, (_, hour) => {
    const rows = byHour.get(String(hour).padStart(2, "0")) ?? [];
    return { hour, views: rows.length, uniques: uniques(rows), conversions: converted(rows) };
  });
}

/** The 31-day hourly bundle behind the traffic chart's day, week and month views. */
export function hourlyTraffic(visits: VisitRow[], tz: string, now: Date): HourlyTraffic {
  const keys = hourKeyWindow(HOURLY_WINDOW_DAYS, tz, now);
  const byHour = groupBy(visits, (v) => hourKeyOf(localCarrier(new Date(v.created_at), tz)));
  const series = (value: (rows: VisitRow[]) => number): HourlySeries =>
    fillHourly([...byHour].map(([k, rows]) => [k, value(rows)] as const), keys);
  return {
    views: series((rows) => rows.length),
    uniques: series(uniques),
    conversions: series(converted),
    avgSeconds: series(avgSeconds),
  };
}
