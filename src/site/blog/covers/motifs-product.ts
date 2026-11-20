import type { Motif } from "./frame";
import { mark, markGradient, placeLogo, r1, seeded } from "./shapes";

/**
 * The product covers: the AIs around one memory for Coere Connect, a team's
 * memory graph for Coere Solutions, and code between braces for Coere Forge.
 */

/** The AIs the Connect cover rings the mark with, as file names in /public. */
export const CONNECT_LOGOS = ["openai.svg", "claude-color.svg", "gemini-color.svg", "perplexity-color.svg", "grok.svg", "deepseek-color.svg", "copilot-color.svg", "meta-color.svg"] as const;

const MARK_FILL = markGradient("m-mark", [[0, "#ffffff"], [0.45, "#c6cfff"], [1, "#5267f7"]]);

/** The mark in the middle, the AIs on a ring round it, a line from each to the mark. */
export function connectMotif(logos: Record<string, string>): Motif {
  const placed: string[] = [];
  const lines: string[] = [];
  CONNECT_LOGOS.forEach((file, i) => {
    const angle = (i / CONNECT_LOGOS.length) * Math.PI * 2 - Math.PI / 2 + Math.PI / CONNECT_LOGOS.length;
    const x = 800 + Math.cos(angle) * 560;
    const y = 450 + Math.sin(angle) * 300;
    lines.push(`<line x1="800" y1="450" x2="${r1(x)}" y2="${r1(y)}"/>`);
    placed.push(`<circle cx="${r1(x)}" cy="${r1(y)}" r="104" fill="#0b0f2a"/>`);
    placed.push(placeLogo(logos[file] ?? "", x, y, 128, `m-l${i}-`));
  });
  const ring = `<ellipse cx="800" cy="450" rx="560" ry="300" fill="none" stroke="#5267f7" stroke-width="6" opacity="0.5"/>`;
  return {
    defs: `${MARK_FILL}
<radialGradient id="m-line" gradientUnits="userSpaceOnUse" cx="800" cy="450" r="640"><stop offset="0" stop-color="#a3b0fd"/><stop offset="1" stop-color="#5267f7" stop-opacity="0.2"/></radialGradient>`,
    lit: `${ring}<g stroke="url(#m-line)" stroke-width="6" opacity="0.7">${lines.join("")}</g><circle cx="800" cy="450" r="170" fill="#0b0f2a"/><circle cx="800" cy="450" r="170" fill="none" stroke="#7f8bfa" stroke-width="8"/>${mark(800, 450, 210, "url(#m-mark)")}${placed.join("")}`,
    glow: `${ring}${mark(800, 450, 210, "#5267f7")}<circle cx="800" cy="450" r="170" fill="none" stroke="#5267f7" stroke-width="30"/>`,
  };
}

/** The colors of the graph's groups: company, clients, people and work, as on the memory page. */
const GROUP_COLORS = ["#7f8bfa", "#38d0f5", "#c86bff", "#ffffff", "#5267f7"];

/** A memory graph: the team's center, five groups round it, each with its own memories. */
export function solutionsMotif(): Motif {
  const rand = seeded(26);
  const edges: string[] = [];
  const nodes: string[] = [];
  GROUP_COLORS.forEach((color, g) => {
    const angle = (g / GROUP_COLORS.length) * Math.PI * 2 - Math.PI / 2 + 0.3;
    const gx = 800 + Math.cos(angle) * 470;
    const gy = 450 + Math.sin(angle) * 270;
    edges.push(`<line x1="800" y1="450" x2="${r1(gx)}" y2="${r1(gy)}" stroke="${color}" stroke-width="7" opacity="0.6"/>`);
    const leaves = 6 + Math.floor(rand() * 3);
    for (let l = 0; l < leaves; l++) {
      const a = angle + (l / leaves - 0.5) * 2.6 + (rand() - 0.5) * 0.3;
      const d = 120 + rand() * 70;
      const lx = gx + Math.cos(a) * d * 1.2;
      const ly = gy + Math.sin(a) * d;
      edges.push(`<line x1="${r1(gx)}" y1="${r1(gy)}" x2="${r1(lx)}" y2="${r1(ly)}" stroke="${color}" stroke-width="4" opacity="0.45"/>`);
      nodes.push(`<circle cx="${r1(lx)}" cy="${r1(ly)}" r="${r1(12 + rand() * 10)}" fill="${color}" opacity="0.85"/>`);
    }
    nodes.push(`<circle cx="${r1(gx)}" cy="${r1(gy)}" r="44" fill="${color}"/>`);
  });
  const center = `<circle cx="800" cy="450" r="96" fill="#3f4ceb"/>${mark(800, 450, 120, "#ffffff")}`;
  return {
    lit: `${edges.join("")}${nodes.join("")}${center}`,
    glow: `${nodes.join("")}<circle cx="800" cy="450" r="110" fill="#5267f7"/>`,
    bloom: { x: 0.5, y: 0.5, color: "#3f6cf7" },
  };
}

/** A curly brace `h` tall and `w` wide, its point at (x, y), facing left; `flip` turns it to face right. */
function brace(x: number, y: number, h: number, w: number, flip: boolean): string {
  const top = y - h / 2;
  const bot = y + h / 2;
  const q = w / 2;
  const d = `M ${x + w} ${top} Q ${x + q} ${top} ${x + q} ${top + q} L ${x + q} ${y - q} Q ${x + q} ${y} ${x} ${y} Q ${x + q} ${y} ${x + q} ${y + q} L ${x + q} ${bot - q} Q ${x + q} ${bot} ${x + w} ${bot}`;
  return `<path d="${d}"${flip ? ` transform="translate(${2 * x + w} 0) scale(-1 1)"` : ""}/>`;
}

/** Lines of code as bars: indent in steps and length in canvas units, then a color. */
const CODE: [number, number, string][] = [
  [0, 240, "#c86bff"],
  [1, 380, "#a3b0fd"],
  [1, 300, "#ffffff"],
  [2, 260, "#38d0f5"],
  [1, 420, "#a3b0fd"],
  [0, 180, "#c86bff"],
];

/** Code between two large braces, with a cursor at the end. */
export function forgeMotif(): Motif {
  const bars = CODE.map(([indent, length, color], i) => `<rect x="${560 + indent * 70}" y="${222 + i * 82}" width="${length}" height="40" rx="20" fill="${color}" opacity="${color === "#ffffff" ? 0.9 : 0.8}"/>`).join("");
  const cursor = `<rect x="${560 + 180 + 30}" y="${222 + 5 * 82 - 6}" width="40" height="56" rx="6" fill="#ffffff"/>`;
  const braces = `<g fill="none" stroke="url(#m-brace)" stroke-width="46" stroke-linecap="round" stroke-linejoin="round">${brace(300, 450, 560, 150, false)}${brace(1150, 450, 560, 150, true)}</g>`;
  return {
    defs: `<linearGradient id="m-brace" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#7f8bfa"/><stop offset="1" stop-color="#3f4ceb"/></linearGradient>`,
    lit: `${braces}${bars}${cursor}`,
    glow: `${braces.replace("url(#m-brace)", "#5267f7")}${bars}`,
    bloom: { x: 0.5, y: 0.5, color: "#4f5af0" },
  };
}
