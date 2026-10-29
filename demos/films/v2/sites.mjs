/**
 * The replica pages this film opens, from the chats the recorder wrote
 * (data/chats.json, Maya's 324 chats and the three new ones, record/corpus.mts):
 * Claude with the new chats at the top of its sidebar, and ChatGPT, newest
 * first, as the sites list them.
 */
import { readFileSync } from "node:fs";

const { extract, fresh } = JSON.parse(readFileSync(new URL("./data/chats.json", import.meta.url), "utf8"));
const on = (platform, ...sets) =>
  sets
    .flat()
    .filter((c) => c.platform === platform)
    .sort((a, b) => b.at - a.at)
    .map(({ id, title, messages }) => ({ id, title, messages }));

export default [
  { out: "sites/claude.html", platform: "claude", chats: on("claude", extract, fresh) },
  // A long paste becomes a file beside the box, as on the real sites, and takes a moment to go up (the film's site options).
  { out: "sites/chatgpt.html", platform: "chatgpt", chats: on("chatgpt", extract, fresh), options: { pasteFileOver: 800, uploadMs: 1800 } },
];
