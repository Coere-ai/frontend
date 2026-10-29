import actionsAnywhere from "./films/actions-anywhere.json";
import actionsGmail from "./films/actions-gmail.json";
import benchmarksEvals from "./films/benchmarks-evals.json";
import coriChat from "./films/cori-chat.json";
import coriRewrite from "./films/cori-rewrite.json";
import extraction from "./films/extraction.json";
import memory from "./films/memory.json";
import smartContext from "./films/smart-context.json";
import teams from "./films/teams.json";
import v2 from "./films/v2.json";
import v3 from "./films/v3.json";
import voiceMode from "./films/voice-mode.json";
import workers from "./films/workers.json";

/** One timed line of text: a chapter title or a caption, in seconds. */
export type Cue = { start: number; end: number; text: string };

/** A film recorded from the real extension, with its poster and cues. */
export type Film = {
  slug: string;
  title: string;
  src: string;
  /** The film's own first frame: a title card, right for the full player. */
  poster: string;
  /** A frame of real footage, for previews that play without their title card. */
  still: string;
  chapters: Cue[];
  captions: Cue[];
};

/** Films live under the private prefix, so only pass holders can load them. */
const BASE = "/preview/films";

function film(slug: string, title: string, cues: { chapters: Cue[]; captions: Cue[] }): Film {
  return {
    slug,
    title,
    src: `${BASE}/${slug}.mp4`,
    poster: `${BASE}/${slug}-poster.jpg`,
    still: `${BASE}/${slug}-still.jpg`,
    ...cues,
  };
}

export const films = {
  v2: film("v2", "Coere v2: memory", v2),
  v3: film("v3", "Coere v3: apps", v3),
  teams: film("teams", "Coere for Teams", teams),
  memory: film("memory", "Memory", memory),
  extraction: film("extraction", "Extraction", extraction),
  smartContext: film("smart-context", "Smart context", smartContext),
  voiceMode: film("voice-mode", "Voice mode", voiceMode),
  coriChat: film("cori-chat", "Cori chat", coriChat),
  actionsGmail: film("actions-gmail", "Actions in Gmail", actionsGmail),
  coriRewrite: film("cori-rewrite", "Cori Rewrite", coriRewrite),
  actionsAnywhere: film("actions-anywhere", "Actions on any site", actionsAnywhere),
  workers: film("workers", "Workers", workers),
  benchmarksEvals: film("benchmarks-evals", "Benchmarks and Evals", benchmarksEvals),
} satisfies Record<string, Film>;

export type FilmKey = keyof typeof films;

/**
 * Every film opens on a title card that lasts about two and a half seconds.
 * Previews start here instead, and loop back here, so they always show the
 * product.
 */
export const PREVIEW_START_SECONDS = 3;

/** How long a film runs, read from where its last cue ends. */
export function filmLength(film: Film): number {
  return Math.max(...film.chapters.map((c) => c.end), ...film.captions.map((c) => c.end));
}
