/**
 * Draws a Cori for each agent from coere-v2's own Cori art, recolored:
 *
 *   npx tsx scripts/agents/build-cori.mts ../coere-v2
 *
 * Every color in Cori is the brand accent mixed toward white or toward ink
 * (tools/cori-art/palette.ts), so each one is traced back to its mix and
 * the same mix is applied to the agent's accent. The drawing is the happy
 * mood, still: happy eyes, open mouth, no effects.
 */
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const repo = process.argv[2];
if (!repo) throw new Error("usage: npx tsx scripts/agents/build-cori.mts <path to coere-v2>");
const { FULL_ART } = await import(pathToFileURL(resolve(repo, "packages/ui/src/cori/art/full.ts")).href);
const out = join(import.meta.dirname, "../../public/preview/images/agents");

/** Each agent and its accent. Keep in step with src/site/content/agents.ts. */
const agents: Record<string, string> = { general: "#5267f7", business: "#e07b24", finance: "#14a06a", tech: "#0891b2" };

type Node = { tag: string; attrs: Record<string, string>; children: Node[] | string[] };
const KEEP = { "data-eyes": "happy", "data-mouth": "open" } as Record<string, string>;
const DROP_CLASS = /\bb-(blink|dot|key|fly|spark|z|q|talk)\b/;

const ACCENT = [0x52, 0x67, 0xf7];
const WHITE = [255, 255, 255];
const INK = [0x08, 0x0e, 0x24];
const hex = (c: number[]) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const parse = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** Every color is the accent mixed toward white or ink; find the mix, then apply it to a new accent. */
function remap(color: string, accent: number[]): string {
  const c = parse(color);
  for (const to of [WHITE, INK]) {
    // Least squares over the three channels, so a channel with little room doesn't skew the mix.
    const num = c.reduce((sum, v, i) => sum + (v - ACCENT[i]) * (to[i] - ACCENT[i]), 0);
    const den = c.reduce((sum, _v, i) => sum + (to[i] - ACCENT[i]) ** 2, 0);
    const u = num / den;
    if (u >= -0.01 && u <= 1.01 && c.every((v, i) => Math.abs(ACCENT[i] + (to[i] - ACCENT[i]) * u - v) < 3)) {
      return hex(accent.map((a, i) => a + (to[i] - a) * Math.max(0, Math.min(1, u))));
    }
  }
  throw new Error(`not in Cori's family: ${color}`);
}

function emit(node: Node, accent: number[], prefix: string): string {
  for (const [k, v] of Object.entries(node.attrs)) if (k in KEEP && KEEP[k] !== v) return "";
  if ("data-fx" in node.attrs) return "";
  if (DROP_CLASS.test(node.attrs.class ?? "")) return "";
  const attrs = Object.entries(node.attrs)
    .filter(([k]) => k !== "class" || node.tag === "svg")
    .map(([k, v]) => {
      let value = v.replace(/#[0-9a-fA-F]{6}\b/g, (m) => remap(m.toLowerCase(), accent));
      if (k === "id") value = `${prefix}${value}`;
      value = value.replace(/url\(#([^)]+)\)/g, (_m, id) => `url(#${prefix}${id})`);
      if (k === "href" || k === "xlink:href") value = value.replace(/^#/, `#${prefix}`);
      if (k === "class" && node.tag === "svg") return "";
      if (k === "style" && node.tag === "svg") return "";
      return `${k}="${value}"`;
    })
    .filter(Boolean)
    .join(" ");
  const kids = (node.children as (Node | string)[]).map((c) => (typeof c === "string" ? c : emit(c, accent, prefix))).join("");
  // The happy mood shows the cheeks at 0.8, which the motion sheet would set.
  const fixed = /\bb-cheeks\b/.test(node.attrs.class ?? "") ? attrs.replace(/opacity="[^"]*"/, 'opacity="0.8"') : attrs;
  return `<${node.tag}${fixed ? " " + fixed : ""}>${kids}</${node.tag}>`;
}

for (const [name, color] of Object.entries(agents)) {
  const svg = emit(FULL_ART.svg as Node, parse(color), `${name}-`).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
  writeFileSync(`${out}/cori-${name}.svg`, svg);
  console.log(name, svg.length);
}
