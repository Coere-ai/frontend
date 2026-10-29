/**
 * Abstract blue backgrounds for heroes and demo panels, in the spirit of
 * the artwork on the product cards, saved at 960, 1920 and 3840 wide for
 * SizedPhoto. Flow and dune are Coere's own artwork; the rest are from
 * Unsplash, free to use under the Unsplash License.
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
} satisfies Record<string, Background>;
