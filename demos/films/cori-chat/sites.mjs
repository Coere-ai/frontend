/**
 * The pages this film opens: a fresh Claude chat from coere-v2's fake site
 * builder, with the sample chats its fake data server lists in Claude's
 * sidebar, as the film showed them; and fake Gmail's mailbox, the page the
 * toolbar popup opens over, written by gmail.mts from coere-v2's own Gmail
 * page builder as the build reads this file.
 */
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const V2 = process.env.COERE_V2 && resolve(process.env.COERE_V2);
if (V2) {
  const out = resolve(here, "../../../public/preview/live/cori-chat");
  execFileSync(join(V2, "node_modules/.bin/tsx"), [join(here, "gmail.mts")], { input: JSON.stringify({ out }), cwd: V2, env: process.env, stdio: ["pipe", "inherit", "inherit"] });
}

const titles = [
  "Organizing old photos", "Debugging a race condition", "Morning stretch routine", "Making a travel checklist", "Picking a board game",
  "Summarizing a long email", "A haiku about rain", "Setting up a home server", "Regex for ISO dates", "Keeping basil alive indoors",
  "Drafting a cover letter", "Explaining recursion simply", "Budget for a road trip", "Practicing Spanish verbs", "A birthday quiz for kids",
  "Indexing a large SQL table", "Tuning a bike chain", "Writing a polite reminder", "Naming a small side project", "Cleaning a cast iron pan",
];

export default [{ out: "sites/claude.html", platform: "claude", chats: titles.map((title, i) => ({ id: `c${i + 1}`, title })) }];
