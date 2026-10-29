/**
 * The replica ChatGPT this film opens: a new chat, with Maya's ChatGPT
 * chats in its sidebar, newest first, the ones the film's sites held
 * (bake.mts writes them from coere-v2's tools/demo-video/v2/data.ts).
 */
import { readFileSync } from "node:fs";

const { chatgpt } = JSON.parse(readFileSync(new URL("./data/chats.json", import.meta.url), "utf8"));

export default [{ out: "sites/chatgpt.html", platform: "chatgpt", chats: chatgpt, options: { pasteFileOver: 800, uploadMs: 1800 } }];
