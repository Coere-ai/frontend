/**
 * The replica ChatGPT pages this film opens, both a new chat with Amara's
 * sidebar: her own ChatGPT for Coere Connect, with the trial chats the
 * field lists, and the team's ChatGPT for Coere for Teams, with the sites'
 * chats. Titles come from the field's data (scripts/industries/fields).
 */
import { field } from "../../../scripts/industries/fields/healthcare.mjs";

const chats = (titles) => titles.map((title, i) => ({ id: `c${i + 1}`, title }));

export default [
  // A paste over 800 characters becomes a file beside the box, as the films' fixture sets it (stage/fixture.ts).
  { out: "sites/chatgpt.html", platform: "chatgpt", chats: chats(field.chats), options: { pasteFileOver: 800, uploadMs: 1800 } },
  { out: "sites/chatgpt-team.html", platform: "chatgpt", edition: "solution", chats: chats(field.clientLine.chats) },
];
