/**
 * Abstract blue backgrounds for heroes and demo panels, in the spirit of
 * the artwork on the product cards. Each is from Unsplash, free to use
 * under the Unsplash License, and saved at 960, 1920 and 3840 wide for
 * SizedPhoto. To use our own artwork instead, save it at those widths
 * under the same names.
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
} satisfies Record<string, Background>;
