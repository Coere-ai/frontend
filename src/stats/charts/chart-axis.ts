// The pure arithmetic behind MultiLineChart's axes, kept apart so the chart
// file is only drawing.

/** 1200 as "1.2k", 3000000 as "3M": short enough for a 46px gutter. */
export function fmtCompact(v: number): string {
  const a = Math.abs(v);
  if (a >= 1_000_000) return `${(v / 1_000_000).toFixed(a % 1_000_000 === 0 ? 0 : 1)}M`;
  if (a >= 1000) return `${(v / 1000).toFixed(a % 1000 === 0 ? 0 : 1)}k`;
  return `${Math.round(v * 100) / 100}`;
}

/**
 * Which buckets get an x axis label.
 *
 * Explicit ticks when the series carries them (midnight on an hourly view, the
 * 1st of a month on a daily one), otherwise a uniform step over every bucket.
 * Both thin to what fits in `innerW` and anchor on the last candidate, so the
 * newest bucket is always named.
 */
export function labelIndexes(
  labels: string[],
  ticks: (string | undefined)[] | undefined,
  innerW: number,
): number[] {
  const n = labels.length;
  const tickIdxs: number[] = [];
  if (ticks) for (let i = 0; i < n; i++) if (ticks[i]) tickIdxs.push(i);
  const tickText = (i: number) => ticks?.[i] ?? labels[i] ?? "";
  const out: number[] = [];
  if (n === 1) out.push(0);
  else if (tickIdxs.length > 0) {
    const maxLen = Math.max(1, ...tickIdxs.map((i) => tickText(i).length));
    const fit = Math.max(1, Math.floor(innerW / (maxLen * 7.5 + 8)));
    const step = Math.max(1, Math.ceil(tickIdxs.length / fit));
    for (let j = tickIdxs.length - 1; j >= 0; j -= step) out.push(tickIdxs[j]!);
    out.reverse();
  } else if (n > 1) {
    const maxLabelLen = Math.max(1, ...labels.map((l) => l.length));
    const budget = maxLabelLen * 7.5 + 8;
    const fit = Math.min(n, Math.max(2, Math.floor(innerW / budget)));
    const step = Math.max(1, Math.ceil((n - 1) / (fit - 1)));
    for (let i = n - 1; i >= 0; i -= step) out.push(i);
    out.reverse();
  }
  return out;
}
