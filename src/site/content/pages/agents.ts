import type { FilmKey } from "../films";
import type { HeroCopy } from "./types";

/** Coere Agents' page. What the agents do is what Cori does in the films. */
export const agentsHero: HeroCopy = {
  title: "One worker, infinite possibilities",
  line: "Coere Agents is Cori, an AI agent that works from your memory. Give it one task, and when the job is big it becomes as many workers as the job needs, each in a tab of its own.",
  checks: [
    "Your memory: every worker starts from what you and your team know",
    "As many as it takes: one task can run in ten tabs at once",
    "Asks first: nothing is sent or submitted without you",
  ],
};

/** One part of Coere Agents the hero plays: its tab, the film that shows it, and its line. */
export type ReelPart = { name: string; film: FilmKey; line: string };

/** What the hero plays in turn, live, each film's own showcase one after another. */
export const agentsReel: ReelPart[] = [
  { name: "Workers", film: "workers", line: "Research split across many tabs" },
  { name: "Any site", film: "actionsAnywhere", line: "Forms and quizzes from what you already know" },
  { name: "Gmail", film: "actionsGmail", line: "Email written in your own style" },
  { name: "Calendar", film: "actionsCalendar", line: "Events from your memory, saved once you review them" },
  { name: "Rewrite", film: "coriRewrite", line: "Fix your writing right where it is" },
  { name: "Chat", film: "coriChat", line: "One helper on every AI" },
];
