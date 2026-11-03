/**
 * How the dashboard writes numbers, money, sizes and dates. Pure, so every
 * page says a cost or a size the same way and the tests pin it.
 */

/** Integer micro dollars as dollars: cents under $100, whole dollars above. */
export function dollars(micros: number): string {
  const usd = (Number.isFinite(micros) ? micros : 0) / 1_000_000;
  if (usd > 0 && usd < 0.01) return "under $0.01";
  return usd < 100 ? `$${usd.toFixed(2)}` : `$${Math.round(usd).toLocaleString("en-US")}`;
}

/** A count as people read it: 950, 12.4K, 3.1M. */
export function compact(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  if (Math.abs(v) < 1000) return Math.round(v).toLocaleString("en-US");
  const [div, unit] = Math.abs(v) < 1e6 ? [1e3, "K"] : Math.abs(v) < 1e9 ? [1e6, "M"] : [1e9, "B"];
  const short = v / div;
  return `${short >= 100 ? Math.round(short) : short.toFixed(1).replace(/\.0$/, "")}${unit}`;
}

/** A whole number with separators. */
export const whole = (n: number): string => Math.round(Number.isFinite(n) ? n : 0).toLocaleString("en-US");

/** Bytes as KB, MB or GB, in steps of 1,024. */
export function bytes(n: number): string {
  const v = Number.isFinite(n) ? Math.max(0, n) : 0;
  if (v < 1024) return `${v} B`;
  const units = ["KB", "MB", "GB"];
  let size = v / 1024;
  let i = 0;
  for (; size >= 1024 && i < units.length - 1; i++) size /= 1024;
  return `${size >= 10 ? Math.round(size) : size.toFixed(1).replace(/\.0$/, "")} ${units[i]}`;
}

/** A date as "Nov 3, 2026", in UTC so the server and the page agree. Empty for none. */
export function day(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** How long ago, in the largest whole unit: "just now", "5 minutes ago", "3 days ago". */
export function ago(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return "never";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "never";
  const s = Math.max(0, Math.round((now - then) / 1000));
  const steps: Array<[number, string]> = [
    [60 * 60 * 24 * 365, "year"],
    [60 * 60 * 24 * 30, "month"],
    [60 * 60 * 24, "day"],
    [60 * 60, "hour"],
    [60, "minute"],
  ];
  for (const [size, unit] of steps) {
    const n = Math.floor(s / size);
    if (n >= 1) return `${n} ${unit}${n === 1 ? "" : "s"} ago`;
  }
  return "just now";
}

/** A share as a whole percent, kept between 0 and 100 for a meter. */
export function percent(used: number, limit: number): number {
  if (!(limit > 0)) return 0;
  return Math.min(100, Math.max(0, Math.round((used / limit) * 100)));
}

/** "1 memory", "2 memories". */
export const plural = (n: number, one: string, many = `${one}s`): string => `${whole(n)} ${n === 1 ? one : many}`;
