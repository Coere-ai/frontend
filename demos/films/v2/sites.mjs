/**
 * The replica pages this film opens, from the chats the recorder wrote
 * (data/chats.json, Maya's chats from coere-v2's film data): Claude six
 * days in, with the first wave of new chats in its sidebar, and ChatGPT
 * on the last day, newest first, as the sites list them.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const { dayOne, one, two } = JSON.parse(readFileSync(new URL("./data/chats.json", import.meta.url), "utf8"));
const on = (platform, ...sets) =>
  sets
    .flat()
    .filter((c) => c.platform === platform)
    .sort((a, b) => b.at - a.at)
    .map(({ id, title, messages }) => ({ id, title, messages }));

// Cori's Gmail tab needs fake Gmail's own pages, which the shared build has no step for: coere-v2's Gmail page builder writes them (record/gmail-pages.mts).
const here = dirname(fileURLToPath(import.meta.url));
const V2 = process.env.COERE_V2 && resolve(process.env.COERE_V2);
if (V2) {
  const input = JSON.stringify({ out: resolve(here, "../../../public/preview/live/v2"), script: "/preview/live/v2/gmail-tab.js" });
  execFileSync(join(V2, "node_modules/.bin/tsx"), [join(here, "record/gmail-pages.mts")], { input, cwd: V2, env: process.env, stdio: ["pipe", "inherit", "inherit"] });
  // And the fake web Cori's workers read (record/web.mts, from coere-v2's own fake pages).
  execFileSync(join(V2, "node_modules/.bin/tsx"), [join(here, "record/web.mts")], { env: { ...process.env, COERE_V2: V2, OUT: resolve(here, "../../../public/preview/live/v2") }, stdio: "inherit" });
}

export default [
  { out: "sites/claude.html", platform: "claude", chats: on("claude", dayOne, one) },
  // A long paste becomes a file beside the box, as on the real sites, and takes a moment to go up (the film's site options).
  { out: "sites/chatgpt.html", platform: "chatgpt", chats: on("chatgpt", dayOne, one, two), options: { pasteFileOver: 800, uploadMs: 1800 } },
];
