/**
 * The replica ChatGPT pages this film opens: a fresh chat with Daniel's
 * own sidebar for Smart context, and a fresh chat on Coere for Teams with
 * the firm's chats in it (scripts/industries/fields/finance.mjs).
 */
import { field } from "../../../scripts/industries/fields/finance.mjs";

/** A paste over 800 characters becomes a file beside the box, as the films' fixture sets it (smart-context's sites.mjs). */
const options = { pasteFileOver: 800, uploadMs: 1800 };
const chats = (titles) => titles.map((title, i) => ({ id: `c${i + 1}`, title }));

export default [
  { out: "sites/chatgpt.html", platform: "chatgpt", chats: chats(field.chats), options },
  { out: "sites/chatgpt-team.html", platform: "chatgpt", edition: "solution", chats: chats(field.clientLine.chats), options },
];
