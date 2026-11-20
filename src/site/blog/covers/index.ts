import { type Motif, sceneSvg } from "./frame";
import { markMotif, ventureMotif, yearMotif } from "./motifs-company";
import { CONNECT_LOGOS, connectMotif, forgeMotif, solutionsMotif } from "./motifs-product";

/**
 * Every blog cover is drawn here as SVG, from the brand alone: the Coere
 * mark, the AI logos and the LED wall of the Coere Solutions hero. A post
 * names its kind of cover; one without a kind gets the plain mark.
 */
export type CoverKind = "venture" | "connect" | "solutions" | "forge" | "year" | "mark";

/** The logo files a cover kind draws, so the caller can read just those from /public. */
export function logosFor(kind: CoverKind): readonly string[] {
  return kind === "connect" ? CONNECT_LOGOS : [];
}

/**
 * One post's cover scene as an SVG document, before it goes through the
 * wall's grid (pixelate.ts). `logos` maps a file name in /public to its
 * text; `year` is the year a "year" cover shows.
 */
export function coverScene(kind: CoverKind, logos: Record<string, string> = {}, year = "26"): string {
  const motifs: Record<CoverKind, () => Motif> = {
    venture: ventureMotif,
    connect: () => connectMotif(logos),
    solutions: solutionsMotif,
    forge: forgeMotif,
    year: () => yearMotif(year),
    mark: markMotif,
  };
  return sceneSvg(motifs[kind]());
}
