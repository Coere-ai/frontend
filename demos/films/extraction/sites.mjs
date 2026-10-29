/**
 * The replica pages this film opens, from data.json (gen-data.mts): each
 * AI as it stands on install day, which Extract all opens; ChatGPT and
 * Gemini later on, with the two new chats; and Claude once Maya has come
 * back to her DATA 100 lab chat, opened on it.
 */
import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync(new URL("./data.json", import.meta.url), "utf8"));
const newest = (list) => [...list].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
const on = (platform, list) => newest(list.filter((c) => c.platform === platform)).map(({ id, title, messages }) => ({ id, title, messages }));
const withLater = [...data.install, ...data.later];
const withChange = [...withLater.filter((c) => c.id !== data.changed.id), data.changed];

export default [
  ...["chatgpt", "claude", "gemini"].map((platform) => ({ out: `sites/${platform}.html`, platform, chats: on(platform, data.install) })),
  { out: "sites/chatgpt-later.html", platform: "chatgpt", chats: on("chatgpt", withLater) },
  { out: "sites/gemini-later.html", platform: "gemini", chats: on("gemini", withLater) },
  { out: "sites/claude-changed.html", platform: "claude", chats: on("claude", withChange), open: data.changed.id },
];
