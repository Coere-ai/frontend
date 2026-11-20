import { type MatrixLogo, prepareSvg } from "./logos";

/** Each cell averages this many pixels a side, so edges get partial brightness. */
export const SUPERSAMPLE = 4;

const svgText = new Map<string, Promise<string>>();

/** The logo's SVG text, fetched once per page however many walls use it. */
function loadSvg(src: string): Promise<string> {
  let text = svgText.get(src);
  if (!text) {
    text = src.startsWith("data:") ? Promise.resolve(decodeURIComponent(src.slice(src.indexOf(",") + 1))) : fetch(src).then((r) => (r.ok ? r.text() : Promise.reject(new Error(`logo ${r.status}`))));
    svgText.set(src, text);
  }
  return text;
}

/**
 * Draws one logo onto a small canvas, `grid` cells a side at
 * `SUPERSAMPLE` pixels a cell, and returns its pixels. The mark is set a
 * little inside the square so the bevel and glow have room at the edges.
 */
export async function rasterizeLogo(logo: MatrixLogo, grid: number): Promise<Uint8ClampedArray> {
  const side = grid * SUPERSAMPLE;
  const inner = Math.round(side * 0.9);
  const blob = new Blob([prepareSvg(await loadSvg(logo.src), inner)], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image(inner, inner);
    img.decoding = "async";
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = side;
    canvas.height = side;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("no 2d context");
    const pad = (side - inner) / 2;
    ctx.drawImage(img, pad, pad, inner, inner);
    return ctx.getImageData(0, 0, side, side).data;
  } finally {
    URL.revokeObjectURL(url);
  }
}
