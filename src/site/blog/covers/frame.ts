/**
 * The frame every blog cover shares, so the covers read as one set: a near
 * black LED wall like the Coere Solutions hero, a soft Coere blue bloom, and
 * a motif that lights the wall's cells. A motif is plain SVG drawn on a
 * 1600 by 900 canvas; the frame shows it twice, once through the grid of
 * cells (the lit pixels) and once blurred behind them (their glow).
 */

export const COVER_WIDTH = 1600;
export const COVER_HEIGHT = 900;

/** The wall's cell pitch and the lit square inside each cell, in canvas units. */
const PITCH = 10;
const CELL = 7;

export type Motif = {
  /** Gradients and other defs the motif's shapes refer to. Ids must start with "m-". */
  defs?: string;
  /** Shapes drawn through the LED grid. */
  lit: string;
  /** Shapes drawn as a soft glow behind the lit cells; the lit shapes by default. */
  glow?: string;
  /** Shapes drawn under everything, unmasked and unblurred, such as a faint beam. */
  under?: string;
  /** The bloom's center as fractions of the canvas, and its color. */
  bloom?: { x: number; y: number; color: string };
};

/** One cover as a complete SVG document. */
export function frame(motif: Motif, title: string): string {
  const bloom = motif.bloom ?? { x: 0.5, y: 0.5, color: "#5267f7" };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${COVER_WIDTH} ${COVER_HEIGHT}" width="${COVER_WIDTH}" height="${COVER_HEIGHT}" role="img">
<title>${escapeXml(title)}</title>
<defs>
<pattern id="f-cells" width="${PITCH}" height="${PITCH}" patternUnits="userSpaceOnUse"><rect x="1.5" y="1.5" width="${CELL}" height="${CELL}" rx="1.5" fill="#fff"/></pattern>
<mask id="f-grid" maskUnits="userSpaceOnUse" x="0" y="0" width="${COVER_WIDTH}" height="${COVER_HEIGHT}"><rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="url(#f-cells)"/></mask>
<radialGradient id="f-bloom" cx="${bloom.x}" cy="${bloom.y}" r="0.62"><stop offset="0" stop-color="${bloom.color}" stop-opacity="0.42"/><stop offset="0.45" stop-color="${bloom.color}" stop-opacity="0.12"/><stop offset="1" stop-color="${bloom.color}" stop-opacity="0"/></radialGradient>
<radialGradient id="f-vignette" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#04050b" stop-opacity="0"/><stop offset="1" stop-color="#04050b" stop-opacity="0.85"/></radialGradient>
<filter id="f-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="22"/></filter>
${motif.defs ?? ""}
</defs>
<rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="#04050b"/>
<rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="url(#f-bloom)"/>
<rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="url(#f-cells)" opacity="0.07"/>
${motif.under ?? ""}
<g filter="url(#f-glow)" opacity="0.5">${motif.glow ?? motif.lit}</g>
<g mask="url(#f-grid)">${motif.lit}</g>
<rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="url(#f-vignette)"/>
</svg>`;
}

/** Text placed inside the SVG's title, made safe for XML. */
export function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
