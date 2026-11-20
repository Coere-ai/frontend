/**
 * "What Coere solves" on the home page, from Edison's own account of the
 * problem. The section shows one side at a time, picked with a switch: AI
 * as it works today, or the same three scenes with Coere, in the same
 * order, so each answer takes its problem's place. The words are in the
 * messages (home.solves in src/site/i18n/messages).
 */
export type SceneKey = "switch" | "newChat" | "longChat";

/** The two sides the switch picks between; `today` comes first. */
export type Side = "today" | "coere";
