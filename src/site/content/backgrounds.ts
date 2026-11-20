/**
 * Abstract blue backgrounds for demo panels and cards, all Coere's own
 * AI made artwork, saved at three widths for SizedPhoto (each keeps its
 * full size as the two larger ones). The owner asked for these only: the
 * stock photos and the flat ribbon art that were here are gone. Each page
 * uses a different mix, so no one background shows everywhere.
 */
export type Background = { src: string; by: string };

const at = (name: string, by: string): Background => ({ src: `/preview/images/backgrounds/${name}.webp`, by });

export const backgrounds = {
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
