import type { SceneShot } from "@/site/ui/screen-scene";
import type { FilmKey } from "./films";

/**
 * Feature showcases on the real app: saved HTML screens from the coere-v2
 * demo scripts (scripts/films/import-screens.mjs), each framed on the part
 * that matters. Views are in CSS pixels of the 1440 by 900 window the
 * screens were saved in.
 */
const at = (cut: string, n: string) => `/preview/screens/${cut}/${n}.html`;

export const scenes = {
  context: [
    { src: at("smart-context", "003"), view: { x: 400, y: 200, w: 900 }, hold: 2600 },
    { src: at("smart-context", "004"), view: { x: 430, y: 0, w: 840 }, hold: 3600 },
    { src: at("smart-context", "008"), view: { x: 620, y: 40, w: 820 } },
    { src: at("smart-context", "010"), view: { x: 400, y: 220, w: 900 } },
  ],
  writing: [
    { src: at("cori-rewrite", "003"), view: { x: 0, y: 0, w: 980 }, hold: 2400 },
    { src: at("cori-rewrite", "005"), view: { x: 0, y: 0, w: 980 } },
    { src: at("cori-rewrite", "010"), view: { x: 300, y: 330, w: 880 } },
    { src: at("cori-rewrite", "011"), view: { x: 330, y: 180, w: 820 } },
    { src: at("cori-rewrite", "015"), view: { x: 420, y: 150, w: 880 } },
  ],
} satisfies Record<string, SceneShot[]>;

export type SceneKey = keyof typeof scenes;

/** The scene that shows each film's feature, for showcases that name a film. */
export const sceneOfFilm: Partial<Record<FilmKey, SceneKey>> = {
  coriRewrite: "writing",
  smartContext: "context",
};
