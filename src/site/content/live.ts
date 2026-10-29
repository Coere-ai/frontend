import type { FilmKey } from "./films";

/**
 * The films that play live, by the folder of their live demo in
 * public/preview/live (demos/films in this repo), and the part a short
 * showcase loops when a page shows the film small: chapter ids from that
 * film's script. A film missing here still plays its recording.
 */
export type LivePart = { from?: string; to?: string };

export const liveFilms: Partial<Record<FilmKey, { slug: string; showcase: LivePart }>> = {
  memory: { slug: "memory", showcase: { from: "grow" } },
  coriRewrite: { slug: "cori-rewrite", showcase: { from: "select", to: "docs" } },
};
