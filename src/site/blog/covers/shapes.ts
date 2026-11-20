import { LOGO_BLADE } from "@/components/logo";

/**
 * Small drawing helpers the cover motifs share: the Coere mark, an AI's logo
 * placed from its own SVG file, and a seeded random source so a cover is
 * the same on every build.
 */

/**
 * The mark's second blade: the first turned half way round, worked out
 * here instead of with a rotate transform, so a gradient fill runs the same
 * way down both blades.
 */
const TURNED_BLADE = LOGO_BLADE.replace(/(\d+) (\d+)/g, (_, x: string, y: string) => `${512 - Number(x)} ${512 - Number(y)}`);

/**
 * A top to bottom fill for the mark, in the mark's own 512 unit space so
 * both blades share it. `id` must start with "m-".
 */
export function markGradient(id: string, stops: [number, string][]): string {
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="40" x2="0" y2="472">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;
}

/** The Coere mark centered on (x, y), `size` across, filled with `fill`. */
export function mark(x: number, y: number, size: number, fill: string): string {
  const s = size / 512;
  const at = `translate(${x - size / 2} ${y - size / 2}) scale(${s})`;
  return `<g transform="${at}" fill="${fill}"><path d="${LOGO_BLADE}"/><path d="${TURNED_BLADE}"/></g>`;
}

/**
 * An AI's logo, from the text of its file in /public, centered on (x, y)
 * and `size` across. The files are written as 1em icons that fill with
 * currentColor, which means nothing inside an image, so currentColor
 * becomes `ink`. Their gradient ids get `prefix` in front, so two logos on
 * one cover never share an id.
 */
export function placeLogo(svg: string, x: number, y: number, size: number, prefix: string, ink = "#ffffff"): string {
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1] ?? "0 0 24 24";
  const open = svg.indexOf(">", svg.indexOf("<svg"));
  const inner = svg
    .slice(open + 1, svg.lastIndexOf("</svg>"))
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(/currentColor/g, ink)
    .replace(/id="([^"]+)"/g, `id="${prefix}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${prefix}$1"`);
  const fillRule = /fill-rule="([^"]+)"/.exec(svg.slice(0, open))?.[1];
  return `<svg x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" viewBox="${viewBox}"${fillRule ? ` fill-rule="${fillRule}"` : ""} fill="${ink}">${inner}</svg>`;
}

/** A small seeded random source (mulberry32), so every build draws the same cover. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A number written short, so a cover's SVG stays small. */
export const r1 = (n: number) => Math.round(n * 10) / 10;
