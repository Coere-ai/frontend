import { play } from "../../stage/player";
import { focused } from "../../stage/input";
import { deep, deepAll, role, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";
import { consoleWorld } from "./console-world";
import { hostCori, MEMORY_STATUS } from "./cori";
import { coriHistory } from "./history";
import { ASK_CLAUDE, ASK_PAGE, ASK_POPUP } from "./lines";

/**
 * Cori chat, ported beat by beat from coere-v2's
 * tools/demo-video/cori-chat.demo.ts (coere-actions.md 11, 16.2): the
 * dashboard's Cori page keeps every chat Maya had with Cori, from any
 * surface, by day, and searches them. She asks a question on the page,
 * then from the toolbar popup over Gmail, then with Right Option in the
 * corner of Claude, and each of those chats lands in the same history.
 *
 * Every surface is Coere's own code: the dashboard and its Cori page, the
 * toolbar popup's page, and the content script's Cori on Claude, with
 * Cori's chat, its streamed answers, memory cards and chips. Cori answers
 * from the service worker's own host over Maya's memory as coere-v2's
 * memory core holds it (cori.ts, bake.mts), and the history is the one
 * every surface writes to (history.ts).
 */

const MAYA = { name: "Maya Collins", first: "Maya", initials: "MC" };
const DASHBOARD = "/preview/live/lib/console-v2.html?tab=cori";

const CHAPTERS = [
  { id: "past", title: "Your past chats" },
  { id: "search", title: "Search your chats" },
  { id: "ask", title: "Ask Cori" },
  { id: "popup", title: "The toolbar popup" },
  { id: "right-option", title: "Right Option" },
  { id: "history", title: "One history" },
];

const pageBox: Query = ".cx-cori-page textarea";
const rowsOf = (doc: Document): Element[] => deepAll(doc, ".cp-list .cp-row");
const row = (n: number): Query => (doc) => rowsOf(doc)[n];
const rowOpen = (n: number): Query => (doc) => rowsOf(doc)[n]?.querySelector("button") ?? null;
const searchBox: Query = 'input[type="search"].cp-search-input';
const newChat = role("button", "New chat");
const pageAnswer: Query = (doc) => deepAll(doc, '.cx-cori-page [data-turn="answer"]').at(-1);
const popupAnswer: Query = (doc) => deepAll(doc, '#app [data-turn="answer"], #app [data-turn="said"]').at(-1);
const claudeBox: Query = '[contenteditable="true"]';
const agentPanel: Query = '[data-testid="agent-panel"]';
const agentInput: Query = '[data-testid="agent-panel"] textarea';
const agentAnswer: Query = (doc) => deepAll(doc, '[data-testid="agent-panel"] [data-turn="answer"], [data-testid="agent-panel"] [data-turn="said"]').at(-1);

let seeded: Promise<void> = Promise.resolve();

/** Polls until `test` holds, or gives up after `ms`. */
async function until(test: () => boolean, ms = 20_000): Promise<boolean> {
  const end = Date.now() + ms;
  while (!test()) {
    if (Date.now() > end) return false;
    await new Promise((r) => setTimeout(r, 40));
  }
  return true;
}

/** One tap of Right Option, pressed and let go alone, on what has the focus (tests/e2e/helpers/content/agent.ts tapOption). */
async function tapOption(s: Stage, tab: Tab): Promise<void> {
  const send = (type: "keydown" | "keyup") => {
    const el = focused(tab.doc) ?? tab.doc.body;
    el.dispatchEvent(new tab.win.KeyboardEvent(type, { key: "Alt", code: "AltRight", location: 2, altKey: type === "keydown", bubbles: true, cancelable: true, composed: true }));
  };
  send("keydown");
  await new Promise((r) => setTimeout(r, 60));
  send("keyup");
  await s.wait(150);
}

/** Types a line into the Cori page's box at a person's pace and sends it (actions/stage.ts askOnCamera). */
async function askOnCamera(s: Stage, tab: Tab, box: Query, line: string): Promise<void> {
  await s.click(tab, box, { after: 200 });
  await s.type(tab, line, 45);
  await s.wait(350);
  await s.press(tab, "Enter");
  await s.rest();
}

/** The dashboard at its Cori page, with its box, as the film's boot opened it. */
async function openDashboard(s: Stage): Promise<Tab> {
  await seeded;
  const dash = await s.open("dash", DASHBOARD);
  await s.waitFor(dash, pageBox);
  return dash;
}

async function film(s: Stage): Promise<void> {
  // The pages she will go to, made ready off camera.
  let dash = await openDashboard(s);
  const popup = await s.open("popup", "popup-over.html");
  const claude = await s.open("claude", "sites/claude.html", { host: "claude.ai", person: MAYA });

  s.say("Maya talks to Cori on the dashboard, in the toolbar and on her AI sites.");
  await s.card("Cori chat", "One chat with Cori, wherever you ask him.", 2600);
  await s.waitFor(dash, row(2));
  await s.film(dash);

  s.chapter("past");
  s.say("The Cori page keeps every chat she had with him, by day, wherever it started.");
  await s.glide(dash, row(2));
  await s.wait(3000);
  await s.click(dash, rowOpen(2), { after: 600 });
  await s.rest();
  s.say("Any of them opens where she left it, and she can carry on.");
  await s.wait(3000);

  s.chapter("search");
  s.say("Search chats finds a chat by anything either of them said.");
  await s.click(dash, searchBox, { after: 200 });
  await s.type(dash, "raised bed", 70);
  if (!(await until(() => rowsOf(dash.doc).length === 1, 10_000))) throw new Error("Search chats never found one chat");
  await s.rest();
  await s.wait(2600);
  await s.press(dash, "Escape");
  const box = deep(dash.doc, "input.cp-search-input") as HTMLInputElement | null;
  if (box && box.value) {
    box.focus();
    box.select();
    dash.doc.execCommand("delete");
  }
  await s.wait(600);

  s.chapter("ask");
  await s.click(dash, newChat, { after: 400 });
  s.say("In a new chat she asks when a project is due. Cori answers from her memory.");
  await askOnCamera(s, dash, pageBox, ASK_PAGE);
  await s.waitFor(dash, pageAnswer, 30_000);
  await s.wait(3600);

  s.chapter("popup");
  await s.film(popup);
  s.say("On any page, Coere’s toolbar button opens the same Cori in a popup.");
  await s.click(popup, '[data-testid="ap-tab-cori"]', { after: 400 });
  await s.click(popup, '[data-testid="ap-ask"]', { after: 200 });
  await s.type(popup, ASK_POPUP, 55);
  await s.press(popup, "Enter");
  await s.rest();
  await s.waitFor(popup, popupAnswer, 30_000);
  await s.wait(3400);

  s.chapter("right-option");
  await s.waitFor(claude, claudeBox);
  await s.film(claude);
  s.say("On an AI site Cori stays out of the way until she taps Right Option.");
  await s.wait(3000);
  await s.click(claude, claudeBox, { after: 300 });
  await s.rest();
  await tapOption(s, claude);
  await s.waitFor(claude, agentPanel, 10_000);
  s.say("A tap brings out his chat, right beside her conversation.");
  await s.wait(1800);
  await s.click(claude, agentInput, { after: 200 });
  await s.type(claude, ASK_CLAUDE, 55);
  await s.press(claude, "Enter");
  await s.rest();
  await s.waitFor(claude, agentAnswer, 30_000);
  await s.wait(3600);

  s.chapter("history");
  // The Cori page again, read fresh, as the film reloaded it, with a new chat first so the shot opens on the list.
  s.close(dash);
  dash = await openDashboard(s);
  await s.waitFor(dash, row(0));
  (await s.waitFor(dash, newChat) as HTMLElement).click();
  await s.wait(400);
  await s.film(dash);
  s.say("Back on the Cori page, the chats from the popup and from Claude are in her history too.");
  await s.glide(dash, row(0));
  await s.wait(3200);
  s.say("Opening one shows it as it was, with the memories Cori found, in today’s words.");
  await s.click(dash, rowOpen(0), { after: 600 });
  await s.rest();
  await s.wait(4000);
  s.say("One Cori, one history, on every surface.");
  await s.card("Cori", "An app built on your memory.", 2600);
  if (s.world.unanswered.length) console.log("UNANSWERED", JSON.stringify(s.world.unanswered));
  const missed = (window as unknown as { __coriMissed?: string[] }).__coriMissed;
  if (missed?.length) console.log("CORI MISSED", JSON.stringify(missed));
}

function setup(world: World): void {
  // Cori said hello on an earlier day, and Browser Use is on, as the film set it off camera.
  world.write("local", {
    "coere.cori.hello": { at: Date.now() - 86_400_000 },
    "coere.browser_use": { on: true, level: "autonomous", model: "bolt", blocked: [], grantedAt: Date.now() - 86_400_000 },
  });
  consoleWorld(world);
  // Her memory as it stands after the import: 12 memories from 3 chats.
  world.engine("memory.status", () => MEMORY_STATUS);
  hostCori(world);
  seeded = coriHistory(world);
  // Coere's content script on Claude: the sidebar's chats save quietly, and none is kept out of memory.
  world
    .engine("memory.skipChats", () => [])
    .engine("upsertConversation", (m) => {
      const conv = (m.args as { conv?: { platformConvId?: string } }).conv;
      return { id: `claude:${conv?.platformConvId ?? ""}`, hash: "", chunks: 1, bytes: 0, unchanged: true };
    });
}

play({ title: "Cori chat", chapters: CHAPTERS }, film, setup);
