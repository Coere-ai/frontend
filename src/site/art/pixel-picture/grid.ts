/** Small helpers over a grid of cells, one or more values a cell, row by row. */

/** The value below which `share` of the list falls, read from a histogram (to a thousandth of the range), which is far quicker than a sort. */
export function percentile(values: Float32Array, share: number): number {
  let top = 0;
  for (let i = 0; i < values.length; i++) if (values[i] > top) top = values[i];
  if (top <= 0) return 0;
  const bins = new Uint32Array(1024);
  const k = 1023 / top;
  for (let i = 0; i < values.length; i++) bins[Math.max(0, Math.round(values[i] * k))]++;
  const want = share * values.length;
  let seen = 0;
  for (let b = 0; b < 1024; b++) {
    seen += bins[b];
    if (seen >= want) return b / k;
  }
  return top;
}

/** One running box sum along a line of `len` values `step` apart, from `src` into `dst`. */
function boxLine(src: Float32Array, dst: Float32Array, start: number, step: number, len: number, r: number) {
  const last = start + (len - 1) * step;
  let sum = src[start] * (r + 1);
  for (let i = 1; i <= r; i++) sum += src[start + Math.min(i, len - 1) * step];
  const norm = 1 / (2 * r + 1);
  for (let i = 0, p = start; i < len; i++, p += step) {
    dst[p] = sum * norm;
    const add = i + r + 1 < len ? start + (i + r + 1) * step : last;
    const drop = i - r > 0 ? start + (i - r) * step : start;
    sum += src[add] - src[drop];
  }
}

/** A box blur over a grid of `channels` values a cell, run twice so it reads as a soft gaussian. */
export function blur(src: Float32Array, cols: number, rows: number, radius: number, channels = 1): Float32Array {
  const r = Math.max(1, Math.round(radius));
  let a = Float32Array.from(src);
  let b = new Float32Array(src.length);
  for (let pass = 0; pass < 2; pass++) {
    for (let ch = 0; ch < channels; ch++) {
      for (let y = 0; y < rows; y++) boxLine(a, b, y * cols * channels + ch, channels, cols, r);
    }
    [a, b] = [b, a];
    for (let ch = 0; ch < channels; ch++) {
      for (let x = 0; x < cols; x++) boxLine(a, b, x * channels + ch, cols * channels, rows, r);
    }
    [a, b] = [b, a];
  }
  return a;
}
