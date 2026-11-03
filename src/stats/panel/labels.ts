// Turning stored values into what the dashboard prints.

/** A share as a percentage, with one decimal only below 10%. */
export function pct(v: number): string {
  if (!Number.isFinite(v) || v <= 0) return "0%";
  return `${(v * 100).toFixed(v >= 0.1 ? 0 : 1)}%`;
}

/** The country's own flag, built from its ISO code.
 *
 *  A regional-indicator pair IS the flag emoji: 'G','B' becomes the two code
 *  points the font renders as the Union Jack. So there is no image set to ship
 *  and nothing to keep in step with the country list. */
export function flagEmoji(code: string): string {
  if (!code || code.length !== 2 || !/^[A-Za-z]{2}$/.test(code)) return "";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

/** Country codes into names, using the platform's own table rather than one we
 *  ship and have to maintain. Falls back to the code, which is still readable. */
export function countryName(code: string): string {
  if (!code) return "Unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Rows the edge or the user agent could not identify.
 *
 *  Hidden from every breakdown rather than shown as a row: "Unknown" is not a
 *  country or a browser, and as the largest bar it crowds out the answers the
 *  chart exists to give. The map still reports how many views it could not
 *  place, which is where that number belongs. */
export const isKnown = <T extends { key?: string; code?: string; label?: string }>(
  r: T,
): boolean => {
  const id = r.key ?? r.code ?? "";
  return id !== "" && r.label !== "Unknown";
};
