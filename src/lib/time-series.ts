// Time-bucket primitives shared by the API and the dashboard charts
//
// Charts get a coarser bucket the wider the range, with the DAY as the floor:
// the day and week views are per-HOUR, the month, year and lifetime views are
// per-DAY. A week is therefore 168 points, not 7, and a year keeps all ~365
// daily points instead of collapsing them into 12 monthly sums.
//
// The endpoints still SHIP HOURLY_WINDOW_DAYS of hourly buckets, more than the
// week view reads. That is deliberate slack, not an oversight: what a range
// renders is a dashboard decision, and narrowing the wire to today's widest
// hourly view would make the next one a server change too.
//
// Hourly buckets ride the wire in a compact form, one `start` key plus a bare
// number array, because a month of hourly resolution as {date,count} objects
// costs ~25KB per series, while the compact form costs ~2KB. The dashboard
// polls, so that difference is paid on every refresh.
//
// WALL-CLOCK, NOT ABSOLUTE TIME. Buckets are the viewer's LOCAL calendar hours,
// so every day has exactly 24 of them, always. We carry a naive local timestamp
// inside a Date whose UTC fields hold the local wall-clock fields, UTC never
// shifts, so stepping it by 3_600_000ms walks the wall clock cleanly across a
// DST boundary. (On a spring-forward day the skipped local hour simply reads
// zero; on a fall-back day Postgres sums the repeated hour into one bucket.)

/** Days of HOURLY resolution every time-series endpoint ships. Comfortably wider
 *  than the week view, which is the widest range that reads hourly buckets
 *  today, so a range can be re-grained in the dashboard alone. */
export const HOURLY_WINDOW_DAYS = 31;

/** How many days each range spans. `lifetime` means "everything we have". */
export const RANGE_DAYS: Record<"day" | "week" | "month", number> = {
  day: 1,
  week: 7,
  month: 30,
};

export interface HourlySeries {
  /** Wall-clock hour of values[0], 'YYYY-MM-DDTHH'. */
  start: string;
  /** One value per hour, oldest-first, contiguous, zero-filled. */
  values: number[];
}

const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));

/** 'YYYY-MM-DDTHH' for a naive wall-clock carrier (see the file header). */
export function hourKeyOf(carrierMs: number): string {
  const d = new Date(carrierMs);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}`;
}

/** 'YYYY-MM-DD' for a naive wall-clock carrier. */
export function dayKeyOf(carrierMs: number): string {
  const d = new Date(carrierMs);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

/** Parse 'YYYY-MM-DDTHH' (or 'YYYY-MM-DD', read as hour 0) back to a carrier. */
export function carrierOf(key: string): number {
  const y = Number(key.slice(0, 4));
  const m = Number(key.slice(5, 7));
  const d = Number(key.slice(8, 10));
  const h = key.length >= 13 ? Number(key.slice(11, 13)) : 0;
  return Date.UTC(y, (m || 1) - 1, d || 1, h || 0);
}

/** The wall-clock fields of `at` in `tz`, as a naive carrier. Falls back to UTC
 *  if the runtime rejects the zone. */
export function localCarrier(at: Date, tz: string): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    }).formatToParts(at);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
    return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"));
  } catch {
    return Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate(), at.getUTCHours());
  }
}

/** Wall-clock hour keys for the last `days` days in `tz`, oldest-first, ending
 *  at the CURRENT hour, exactly 24 per day. */
export function hourKeyWindow(days: number, tz: string, now: Date = new Date()): string[] {
  const total = Math.max(1, Math.round(days)) * 24;
  let cursor = localCarrier(now, tz);
  const keys = new Array<string>(total);
  for (let i = total - 1; i >= 0; i--) {
    keys[i] = hourKeyOf(cursor);
    cursor -= 3_600_000;
  }
  return keys;
}

/** Zero-fill grouped rows onto a key window, in the compact wire form.
 *
 *  Values are trimmed to 8 decimal places on the way out. A float8 sum of a
 *  bucket's costs lands on things like 0.0031240000000000003, and about a
 *  quarter of them do, which is pure binary noise, but it triples that number's
 *  size on the wire and the dashboard polls. Counts are untouched (integers
 *  round to themselves) and 1e-8 is far below any cost we bill. */
export function fillHourly(rows: Iterable<readonly [string, number]>, keys: string[]): HourlySeries {
  const by = new Map(rows);
  return {
    start: keys[0] ?? "",
    values: keys.map((k) => Math.round((by.get(k) ?? 0) * 1e8) / 1e8),
  };
}

/** The day keys of the last `months` CALENDAR months, oldest-first, ending on
 *  `endDayKey`. Used by the year view, which must show all 12 months, including
 *  the ones with no data at all, at full per-day resolution. */
export function calendarMonthDayKeys(endDayKey: string, months = 12): string[] {
  const end = carrierOf(endDayKey);
  const endDate = new Date(end);
  const startCarrier = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth() - (months - 1), 1);
  const keys: string[] = [];
  for (let c = startCarrier; c <= end; c += 86_400_000) keys.push(dayKeyOf(c));
  return keys;
}
