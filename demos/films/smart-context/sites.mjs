/**
 * The replica pages this film opens: a fresh ChatGPT chat with Maya's
 * sidebar, as coere-v2's films saw it, and the same page later in the day,
 * once her interview chat and her SkipDoodle chat are in the sidebar. The
 * sidebar holds all 148 of her ChatGPT chats (bake.mts, data/maya.json),
 * the ones the film's pages showed first. A paste over 800 characters
 * becomes a file beside the box, and an upload takes 1.8 seconds, as the
 * films' fixture sets them (stage/fixture.ts).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const { sidebar } = JSON.parse(readFileSync(join(here, "data/maya.json"), "utf8"));
const chats = (extra) => [...extra, ...sidebar].map((title, i) => ({ id: `c${i + 1}`, title }));
const options = { pasteFileOver: 800, uploadMs: 1800 };

export default [
  { out: "sites/chatgpt.html", platform: "chatgpt", chats: chats([]), options },
  { out: "sites/chatgpt-later.html", platform: "chatgpt", chats: chats(["Interview prep plan"]), options },
  { out: "sites/chatgpt-evening.html", platform: "chatgpt", chats: chats(["SkipDoodle changes", "Interview prep plan"]), options },
];
