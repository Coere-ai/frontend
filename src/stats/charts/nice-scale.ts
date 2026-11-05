/**
 * The top of a chart's axis and its step, so the five ticks read as round
 * numbers (0, 50, 100, 150, 200) and never as 153.75. A step is 1, 2 or 5
 * times a power of ten. Counts are whole, so their step never drops below
 * 1; money may go to cents. Pure, so the tests pin it.
 */
export function niceScale(max: number, { whole = true, steps = 4 }: { whole?: boolean; steps?: number } = {}): { top: number; step: number } {
  const raw = Math.max(Number.isFinite(max) ? max : 0, 0) / steps;
  if (raw <= 0) return { top: whole ? steps : 1, step: whole ? 1 : 1 / steps };
  const power = 10 ** Math.floor(Math.log10(raw));
  const step0 = [1, 2, 5, 10].map((m) => m * power).find((s) => s >= raw - 1e-12) ?? 10 * power;
  const step = whole ? Math.max(1, Math.ceil(step0)) : Math.max(0.01, step0);
  return { top: step * steps, step };
}
