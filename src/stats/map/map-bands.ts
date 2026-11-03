import type { CountryStat } from "@/lib/analytics/types";

/**
 * Five steps of Coere's blue, light to dark, for the country shading. One hue
 * getting darker, never a rainbow, because a rainbow implies categories where
 * there is only more and less. The steps are the tokens in stats.css.
 *
 * Countries with no visits keep --color-map-land, a pale neutral rather than
 * the lightest step: "nobody came from here" and "a few people did" must not
 * look like neighbours on the same scale.
 */
export const SCALE = [
  "var(--color-map-1)",
  "var(--color-map-2)",
  "var(--color-map-3)",
  "var(--color-map-4)",
  "var(--color-map-5)",
];

/**
 * Break the country totals into five bands.
 *
 * Quantiles over the countries that HAVE traffic, not equal-width bins over the
 * range. Web traffic is heavily skewed, one home market and a long tail, and
 * equal-width bins put that one country in the top band and every other country
 * in the bottom one, producing a map with two colours on it. Quantiles spend the
 * ramp where the countries actually are.
 */
export function buildBands(countries: CountryStat[]): number[] {
  const values = countries
    .filter((c) => c.code && c.views > 0)
    .map((c) => c.views)
    .sort((a, b) => a - b);
  if (values.length === 0) return [];
  const at = (q: number) => values[Math.min(values.length - 1, Math.floor(q * values.length))]!;
  // Deduped: with only two or three countries the quantiles collapse onto the
  // same number, and a legend with "1 to 1" twice is worse than a shorter one.
  return [...new Set([at(0.2), at(0.4), at(0.6), at(0.8), values.at(-1)!])];
}

/** The step a country's views fall in, or null for a country nobody came from. */
export function bandColor(views: number, bands: number[]): string | null {
  if (views <= 0 || bands.length === 0) return null;
  for (let i = 0; i < bands.length; i++) {
    if (views <= bands[i]!) return SCALE[Math.min(i, SCALE.length - 1)]!;
  }
  return SCALE.at(-1)!;
}
