/**
 * The sizes Dither Wave draws at, kept pure so the tests run them in Node.
 */

/**
 * One dither pixel in whole device pixels: `css` CSS pixels at the ratio
 * the canvas draws at, rounded, and never under one. Whole device pixels
 * keep every square the same size and its edges sharp.
 */
export function cellPixels(css: number, dpr: number): number {
  const size = Number.isFinite(css) && css > 0 ? css : 1;
  const ratio = Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
  return Math.max(1, Math.round(size * ratio));
}

/**
 * How many CSS pixels one unit of the wave field spans, so a laptop shows
 * about four bands across and a phone about two, as in the demo. `scale`
 * above 1 makes the bands larger.
 */
export function fieldUnit(width: number, height: number, scale = 1): number {
  const span = Math.min(Math.max(width, 1), Math.max(height, 1) * 1.6) / 2.6;
  return Math.min(Math.max(span, 240), 440) * (scale > 0 ? scale : 1);
}
