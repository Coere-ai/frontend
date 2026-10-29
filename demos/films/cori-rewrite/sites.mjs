/**
 * The pages Maya writes in. Claude's chat comes from coere-v2's fake site
 * builder, with the sidebar its fake data server shows; Gmail's compose
 * window and her cover letter in Google Docs come from coere-v2's fake
 * Google (google.mts writes them, as its servers answer those addresses).
 */
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const V2 = resolve(process.env.COERE_V2 ?? "");
const out = resolve(here, "../../../public/preview/live/cori-rewrite/google");
execFileSync(join(V2, "node_modules/.bin/tsx"), [join(here, "google.mts")], { env: { ...process.env, COERE_V2: V2, OUT: out }, stdio: "inherit" });

// The fake data server's sample titles, newest first, as Claude's sidebar showed them in the film.
const titles = [
  "Organizing old photos", "Debugging a race condition", "Morning stretch routine", "Making a travel checklist", "Picking a board game",
  "Summarizing a long email", "A haiku about rain", "Setting up a home server", "Regex for ISO dates", "Keeping basil alive indoors",
  "Drafting a cover letter", "Explaining recursion simply", "Budget for a road trip", "Practicing Spanish verbs", "A birthday quiz for kids",
  "Indexing a large SQL table", "Tuning a bike chain", "Writing a polite reminder", "Naming a small side project", "Cleaning a cast iron pan",
];

export default [{ out: "sites/claude.html", platform: "claude", chats: titles.map((title, i) => ({ id: `c${i + 1}`, title })) }];
