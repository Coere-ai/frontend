/**
 * The replica ChatGPT pages this film opens, from coere-v2's fake site
 * builder, with Grace Leung's chats in the sidebar (the commerce field):
 * a new chat with Coere's content script for Connect, where a paste over
 * 800 characters becomes a file beside the box as on ChatGPT, and a new
 * chat with Coere for Teams' content script.
 */
import { field } from "../../../scripts/industries/fields/commerce.mjs";

const chats = (titles) => titles.map((title, i) => ({ id: `c${i + 1}`, title }));

export default [
  { out: "sites/chatgpt.html", platform: "chatgpt", chats: chats(field.chats), options: { pasteFileOver: 800, uploadMs: 1800 } },
  { out: "sites/chatgpt-teams.html", platform: "chatgpt", edition: "solution", chats: chats(field.clientLine.chats) },
];
