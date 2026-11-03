import type { LinePoint } from "./line-point";
import {
  RANGE_DAYS,
  calendarMonthDayKeys,
  carrierOf,
  hourKeyOf,
  type HourlySeries,
} from "@/lib/time-series";

// Building a chart series from time buckets
//
// One bucket size per range, chosen so the wider the window, the coarser the
// grain, but never coarser than a DAY:
//
//   day       24 hourly points  (today, the finest grain we record)
//   week     168 hourly points  (7 days x 24, a week's SCALE, not a week's worth
//                                of days flattened to one point each)
//   month     30 daily points   (a month of hours is 720 points of detail nobody
//                                reads at that width; the day is the useful unit
//                                once the window passes a week)
//   year     every DAY of the last 12 CALENDAR months, all twelve always show,
//            including months with no data at all
//
// A DAY IS THE FLOOR. The month and year views sum their hours into daily
// totals rather than sampling or skipping, so widening the range changes the
// grain and never drops a reading: every event in the window is inside some
// point on the line. Only the AXIS thins out beyond that, via `tick`, the
// bucket that owns an axis label (midnight for the hourly views, the 1st of a
// month for the daily ones). Charts render the ticks they can fit and every
// bucket stays hoverable.
//
// Hourly buckets arrive in the compact wire form (`{start, values}`); the legacy
// 24-entry {date,count}[] that older endpoints send for "today" is still
// accepted, and ranges wider than it covers fall back to daily points.

export type Range = "day" | "week" | "month" | "year";

export interface DayPoint {
  date: string;
  count: number;
}

/** Hourly buckets in either the compact form or the legacy per-hour array. */
export type HourlyInput = HourlySeries | { date: string; count: number }[] | null | undefined;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** '2026-08-17…' becomes '8/17' (compact, for axis ticks). */
function shortMD(key: string): string {
  return `${Number(key.slice(5, 7))}/${Number(key.slice(8, 10))}`;
}

/** '2026-08-17…' becomes 'Aug 17' (roomier, for tooltips). */
function monthDay(key: string): string {
  return `${MONTHS[Number(key.slice(5, 7)) - 1] ?? key.slice(5, 7)} ${Number(key.slice(8, 10))}`;
}

function hourLabel(h: number): string {
  return `${h % 12 || 12}${h < 12 ? "am" : "pm"}`;
}

/** Accept either wire form, and reject anything that carries no buckets. */
function normalizeHourly(hourly: HourlyInput, daily: DayPoint[]): HourlySeries | null {
  if (!hourly) return null;
  if (!Array.isArray(hourly)) return hourly.values?.length ? hourly : null;
  if (hourly.length === 0) return null;
  const first = hourly[0]?.date ?? "";
  // Legacy shape: `date` is the bare hour index ('0'…'23') of TODAY, which the
  // daily array's last entry names. Newer producers send full hour keys.
  const start = first.includes("T")
    ? first
    : `${daily.at(-1)?.date ?? "1970-01-01"}T00`;
  return { start, values: hourly.map((h) => h.count) };
}

/** Hour-of-day (0-23) of the bucket at `i`. */
function hourAt(h: HourlySeries, i: number): number {
  return Number(hourKeyOf(carrierOf(h.start) + i * 3_600_000).slice(11, 13));
}

/** Hourly points from `from` for `count` buckets, zero-padded if the window
 *  runs out (the day view keeps all 24 of today's slots, including the hours
 *  that haven't happened yet). `tickEveryHour` picks the axis: the day view
 *  ticks every hour, the wider views tick each local midnight. */
function hourPoints(h: HourlySeries, from: number, count: number, tickEveryHour: boolean): LinePoint[] {
  const values: number[] = [];
  for (let i = 0; i < count; i++) values.push(h.values[from + i] ?? 0);
  let carrier = carrierOf(h.start) + from * 3_600_000;
  const points: LinePoint[] = new Array(values.length);
  for (let i = 0; i < values.length; i++) {
    const key = hourKeyOf(carrier);
    const hour = Number(key.slice(11, 13));
    points[i] = {
      label: tickEveryHour ? hourLabel(hour) : `${monthDay(key)}, ${hourLabel(hour)}`,
      value: values[i] ?? 0,
      ...(tickEveryHour
        ? { tick: hourLabel(hour) }
        : hour === 0
          ? { tick: shortMD(key) }
          : {}),
    };
    carrier += 3_600_000;
  }
  return points;
}

/** Daily points, ticking the 1st of every month so a year reads as months. */
function dayPoints(days: DayPoint[], monthTicks: boolean): LinePoint[] {
  return days.map((d) => {
    const isFirst = d.date.slice(8, 10) === "01";
    return {
      label: monthDay(d.date),
      value: d.count,
      ...(monthTicks
        ? isFirst
          ? { tick: MONTHS[Number(d.date.slice(5, 7)) - 1] ?? d.date.slice(0, 7) }
          : {}
        : { tick: shortMD(d.date) }),
    };
  });
}

/** The last 12 calendar months of daily buckets, zero-filled so every month,
 *  including the empty ones, occupies its real share of the axis. */
function calendarYear(daily: DayPoint[]): DayPoint[] {
  if (daily.length === 0) return [];
  const by = new Map(daily.map((d) => [d.date, d.count]));
  return calendarMonthDayKeys(daily.at(-1)!.date, 12).map((date) => ({
    date,
    count: by.get(date) ?? 0,
  }));
}

/** Build an ADDITIVE series (counts, sums, money) for a range. `hourly` is what
 *  gives the day and week views their per-hour resolution; without it, or when
 *  it doesn't reach back far enough, they fall back to daily points, which is
 *  the same floor the month and year views sit on anyway. */
export function buildSeries(daily: DayPoint[], range: Range, hourly?: HourlyInput): LinePoint[] {
  if (range === "year") return dayPoints(calendarYear(daily), true);
  // A month reads DAILY, from the daily buckets that already carry each day's
  // total. Not a thinning of the hourly series: these are the same sums the
  // server groups by day, so no hour is dropped on the way to the point.
  if (range === "month") return dayPoints(daily.slice(-RANGE_DAYS.month), false);

  const days = RANGE_DAYS[range];
  const h = normalizeHourly(hourly, daily);
  if (h) {
    // Buckets are CALENDAR-aligned: the window opens at midnight `days-1` days
    // back, so every completed day contributes a clean block of 24 and the axis
    // ticks land on real day boundaries. `midnight` is the index of today's 12am
    //, the last bucket is the current hour, so its hour-of-day names it.
    const last = h.values.length - 1;
    const midnight = last - hourAt(h, last);
    const from = midnight - (days - 1) * 24;
    if (range === "day") {
      // Today's 24 slots, exactly as before: the hours still to come read zero
      // rather than cropping the axis to the current hour.
      if (midnight >= 0) return hourPoints(h, midnight, 24, true);
    } else if (from >= 0) {
      // The full days x 24, exactly like the day view: the hours of today that
      // haven't happened yet read zero rather than cropping the axis, so a week
      // is ALWAYS 168 points whatever hour it is now. (Truncating at the current
      // hour instead made the width of a "week" swing between 145 and 168 points
      // over the course of a day, and left parallel series on the multi-line
      // charts index-misaligned.)
      return hourPoints(h, from, days * 24, false);
    }
  }
  return dayPoints(daily.slice(-days), false);
}

// Turn a per-bucket (ADDITIVE) series into a running total: each point becomes
// the sum of every bucket up to and including it, so the line only ever rises.
// Returns a NEW array, so a memoized caller can keep both. Only meaningful for
// additive counts, never for levels.
export function toCumulativeValues(values: number[]): number[] {
  let acc = 0;
  return values.map((v) => {
    acc += v;
    return Math.round(acc * 100) / 100;
  });
}

/** Split a built series into the parallel arrays MultiLineChart takes. */
export function seriesAxis(points: LinePoint[]): { labels: string[]; ticks: (string | undefined)[] } {
  return { labels: points.map((p) => p.label), ticks: points.map((p) => p.tick) };
}
