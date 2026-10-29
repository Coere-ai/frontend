/**
 * Abstract blue backgrounds for heroes and demo panels, in the spirit of
 * the artwork on the product cards, saved at three widths for SizedPhoto
 * (Coere's own art keeps its full size as the two larger ones). Flow, dune,
 * ribbons, tangle, prism and blocks are Coere's own artwork; the rest are
 * from Unsplash, free to use under the Unsplash License. Each page uses a
 * different mix, so no one background shows everywhere.
 */
export type Background = { src: string; by: string };

const at = (name: string, by: string): Background => ({ src: `/preview/images/backgrounds/${name}.webp`, by });

export const backgrounds = {
  /** Deep blue layered waves, dark at the top. */
  waves: at("waves", "Martin Martz"),
  /** A pale blue curl on near black. */
  curl: at("curl", "Tiago Wolf"),
  /** Blue glass up close. */
  glass: at("glass", "Simon Nilsen"),
  /** Light blue folds, the brightest of the set. */
  light: at("light", "Tridimensi Pro"),
  /** Coere's own: bright blue ribbons crossing on deep blue. */
  flow: at("flow", "Coere"),
  /** Coere's own: wide blue dunes with a violet edge of light. */
  dune: at("dune", "Coere"),
  /** Coere's own: glass ribbons looping over faceted blue. */
  ribbons: at("ribbons", "Coere"),
  /** Coere's own: a dense knot of glass bands, darker in the middle. */
  tangle: at("tangle", "Coere"),
  /** Coere's own: straight glass beams crossing over a dark prism. */
  prism: at("prism", "Coere"),
  /** Coere's own: glass blocks and beams at right angles. */
  blocks: at("blocks", "Coere"),
} satisfies Record<string, Background>;
