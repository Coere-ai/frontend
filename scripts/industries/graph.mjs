/**
 * Draws a memory graph as SVG in the style of Coere's own canvas graph: the
 * person in navy at the centre, a hub per section in its colour, things
 * filed under each hub around it, and the small dots of the chats behind
 * each thing. Placement is worked out from the data alone, so the same
 * content always draws the same graph.
 *
 *   { width, height, center: [x, y], hubs: [{ label, color, angle, distance,
 *     children: [{ label, leaves }] }], focus: "a child label" }
 *
 * With `focus`, that child is ringed and its own leaves named, and the rest
 * fades, as the graph does when a thing is opened.
 */
const INK = "#080e24";
const FONT = 'font-family="Coere Geist, ui-sans-serif, system-ui, sans-serif"';

/** A small deterministic shuffle source, so leaves scatter the same way every build. */
function wobble(seed) {
  let x = 0;
  for (const c of seed) x = (x * 31 + c.charCodeAt(0)) >>> 0;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 2 ** 32;
  };
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function graphSvg({ width, height, center, hubs, focus, scale = 1 }) {
  const [cx, cy] = center;
  const lines = [];
  const dots = [];
  const labels = [];
  const faded = (on) => (focus && !on ? ' opacity="0.22"' : "");

  for (const hub of hubs) {
    const a = (hub.angle * Math.PI) / 180;
    const hx = cx + Math.cos(a) * hub.distance * scale;
    const hy = cy + Math.sin(a) * hub.distance * scale;
    const holdsFocus = hub.children.some((c) => c.label === focus);
    lines.push(`<line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="${hub.color}" stroke-opacity="0.55" stroke-width="1.4"${faded(holdsFocus)}/>`);
    const n = hub.children.length;
    const spread = hub.spread ?? Math.min(300, 40 + n * 24);
    hub.children.forEach((child, i) => {
      const t = n === 1 ? 0 : i / (n - 1) - 0.5;
      const ca = a + (t * spread * Math.PI) / 180;
      const r = (child.distance ?? hub.reach ?? 120) * scale;
      const x = hx + Math.cos(ca) * r;
      const y = hy + Math.sin(ca) * r;
      const on = child.label === focus;
      lines.push(`<line x1="${hx}" y1="${hy}" x2="${x}" y2="${y}" stroke="${hub.color}" stroke-opacity="0.5" stroke-width="1.1"${faded(on)}/>`);
      const rand = wobble(child.label);
      const leaves = child.leaves ?? 3;
      for (let k = 0; k < leaves; k++) {
        const la = ca + (rand() - 0.5) * 2.4;
        const lr = (14 + rand() * 18) * scale * (on ? 1.6 : 1);
        const lx = x + Math.cos(la) * lr;
        const ly = y + Math.sin(la) * lr;
        lines.push(`<line x1="${x}" y1="${y}" x2="${lx}" y2="${ly}" stroke="${hub.color}" stroke-opacity="0.35" stroke-width="0.8"${faded(on)}/>`);
        dots.push(`<circle cx="${lx}" cy="${ly}" r="${on ? 2.6 : 1.8}" fill="${hub.color}"${faded(on)}/>`);
      }
      dots.push(`<circle cx="${x}" cy="${y}" r="${on ? 7.5 : 4.6}" fill="${hub.color}"${faded(on)}/>`);
      if (on) dots.push(`<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="${hub.color}" stroke-width="2"/>`);
      if (child.label && !child.quiet) {
        const right = Math.cos(ca) >= -0.15;
        labels.push(`<text x="${x + (right ? 12 : -12)}" y="${y + 5}" text-anchor="${right ? "start" : "end"}" font-size="${on ? 15 : 14}" font-weight="${on ? 600 : 400}" fill="${INK}"${faded(on)}>${esc(child.label)}</text>`);
      }
    });
    dots.push(`<circle cx="${hx}" cy="${hy}" r="${11 * Math.min(1.2, 0.8 + n / 30)}" fill="${hub.color}"${faded(holdsFocus)}/>`);
    const below = Math.sin(a) > 0;
    labels.push(`<text x="${hx + (Math.cos(a) < -0.3 ? -16 : Math.cos(a) > 0.3 ? 16 : 0)}" y="${hy + (below ? -18 : 30)}" text-anchor="${Math.cos(a) < -0.3 ? "end" : Math.cos(a) > 0.3 ? "start" : "middle"}" font-size="15" font-weight="600" fill="${INK}"${faded(holdsFocus)}>${esc(hub.label)}</text>`);
  }
  dots.push(`<circle cx="${cx}" cy="${cy}" r="13" fill="${INK}"${faded(false)}/>`);
  labels.push(`<text x="${cx + 20}" y="${cy + 5}" font-size="15" font-weight="600" fill="${INK}"${faded(false)}>You</text>`);
  return `<svg class="cx-mp-canvas" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="display:block;width:100%;height:100%" role="img" aria-label="Memory graph" ${FONT}>${lines.join("")}${dots.join("")}${labels.join("")}</svg>`;
}
