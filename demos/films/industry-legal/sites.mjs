/**
 * The replica ChatGPT pages this film opens, with Nina Okafor's sidebar:
 * her own chats for Smart context (Coere), and the firm's chats for the
 * client chapter (Coere for Teams). Made up.
 */
import { field } from "../../../demos/industries/fields/legal.mjs";

const chats = (titles) => titles.map((title, i) => ({ id: `c${i + 1}`, title }));
/** A paste over 800 characters becomes a file beside the box, as on ChatGPT, and an upload takes 1.8 seconds (as the smart-context film sets them). */
const options = { pasteFileOver: 800, uploadMs: 1800 };

export default [
  { out: "sites/chatgpt.html", platform: "chatgpt", chats: chats(field.chats), options },
  { out: "sites/chatgpt-firm.html", platform: "chatgpt", edition: "solution", chats: chats(field.clientLine.chats), options },
];
