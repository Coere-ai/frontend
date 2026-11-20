import type { Messages } from "@/site/i18n/messages/types";
import type { FilmKey } from "../films";

/** One part of Coere Agents the hero plays: its tab, the film that shows it, and its line. */
export type ReelPart = { name: string; film: FilmKey; line: string };

/** The films the hero plays in turn, live, each one's own showcase one after another. */
const reelFilms: FilmKey[] = ["workers", "actionsAnywhere", "actionsGmail", "actionsCalendar", "coriRewrite", "coriChat"];

/** What the hero plays, in a language (productPages.agents.reel). */
export function agentsReelIn(words: Messages["productPages"]["agents"]): ReelPart[] {
  return words.reel.map((part, i) => ({ ...part, film: reelFilms[i] }));
}
