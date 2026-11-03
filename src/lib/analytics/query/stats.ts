// Small numeric helpers every rollup leans on.

/** Mean of a list, 0 for an empty one. */
export const mean = (xs: number[]): number =>
  xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;

/** Median of a list, 0 for an empty one. The mean alone is unreadable here: one
 *  tab left open for an hour moves it and moves nothing a reader should believe. */
export function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

/** Group rows by a key, dropping nothing: "" is a real answer ("Unknown"). */
export function groupBy<T>(rows: T[], key: (r: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>();
  for (const r of rows) {
    const k = key(r);
    const bucket = out.get(k);
    if (bucket) bucket.push(r);
    else out.set(k, [r]);
  }
  return out;
}

/** Distinct browsers in a set of rows. */
export const uniques = (rows: { visitor_id: string }[]): number =>
  new Set(rows.map((r) => r.visitor_id)).size;
