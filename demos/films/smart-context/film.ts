import { play } from "../../stage/player";
import { focused, key } from "../../stage/input";
import { deep, role, text, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";
import { setupMemory } from "./answers";
import { SESSION_REPLIES, SKIPDOODLE_REPLIES } from "./data";
import { setupConsole } from "./console";

/**
 * The Smart context film, ported from coere-v2 tools/demo-video
 * (smart-context.demo.ts, memory/smart.ts, memory/upload.ts): in a fresh
 * ChatGPT chat Maya types her interview draft and Coere's real strip says
 * what goes with it; the list shows it all, Add memory searches her memory,
 * Ask Cori adds the notes she meant, and one Enter puts it in front of the
 * draft and sends. Then her SkipDoodle chat with its follow ups, and last
 * File Upload (beta) sending a long context as a file.
 *
 * Her memory is the whole of it: 532 memories from 324 chats (ChatGPT 148,
 * Claude 102, Gemini 74), written by maya-world.mts and maya-memory.mts
 * through coere-v2's own write path and read back by its memory core
 * (bake.mts), so the memory search draws her real graph: about a dozen
 * sections, each with a few folders and a small fan of memories round each.
 */

const MAYA = { name: "Maya Collins", first: "Maya", initials: "MC" };
const DRAFT = "Help me prepare for this interview";

const CHAPTERS = [
  { id: "type", title: "Type a message", seconds: 10 },
  { id: "goes", title: "What goes with it", seconds: 10 },
  { id: "add", title: "Add more", seconds: 17 },
  { id: "enter", title: "One Enter", seconds: 5 },
  { id: "chat", title: "In one chat", seconds: 39 },
  { id: "upload", title: "File Upload (beta)", seconds: 29 },
];

/** The chat box of the replica ChatGPT, its ProseMirror editor. */
const composer: Query = ".ProseMirror";
/** The one line above the box (tests/e2e/helpers/memory/context-strip.ts). */
const strip: Query = "[data-coere-context-strip] .coere-ctx-strip";
/** The list the chevron opens. */
const stripList: Query = "#coere-ctx-list";
const memorySearch: Query = 'section[aria-label="Search memory"]';

/**
 * Opens a replica ChatGPT. A browser runs the page's microtasks between
 * the listeners of a real key, so ProseMirror's DOM observer takes in the
 * block Coere's send hook just put in before the site's own Enter reads
 * the box. The scripted hand's keys are dispatched from script, where no
 * microtask runs in between, so after Coere's listener the editor is told
 * to read the DOM now, as the observer would have.
 */
async function open(s: Stage, name: string, page: string, replies: readonly string[]): Promise<Tab> {
  const tab = await s.open(name, page, { host: "chatgpt.com", person: MAYA, replies });
  tab.win.addEventListener("keydown", (e) => e.key === "Enter" && tab.doc.dispatchEvent(new Event("selectionchange")), true);
  return tab;
}

/**
 * Types as a person does. While the player skips ahead, the stage puts the
 * text in whole, with no key, and Coere reads a box only after a key that
 * types (recall/auto-listen.ts); so the last letter goes in as a key.
 */
async function typeText(s: Stage, tab: Tab, words: string, delay: number): Promise<void> {
  if (!s.fast) return s.type(tab, words, delay);
  await s.type(tab, words.slice(0, -1), delay);
  key(tab.doc, words.slice(-1));
}

/** Polls until `test` holds, or gives up after `ms`. */
async function until(test: () => boolean, ms = 20_000): Promise<boolean> {
  const end = Date.now() + ms;
  while (!test()) {
    if (Date.now() > end) return false;
    await new Promise((r) => setTimeout(r, 50));
  }
  return true;
}

/** The strip's words now, from Coere's own root on the page, or null while no line shows. */
function findStripText(tab: Tab): string | null {
  const el = deep(tab.doc, "[data-coere-context-strip] .coere-ctx-text");
  return el ? el.textContent : null;
}

const stripSays = (tab: Tab): boolean => /\w/.test(findStripText(tab) ?? "");

/** Types a draft into the box and waits for the line above it to say what goes. */
async function draft(s: Stage, site: Tab, words: string, waitMs = 8_000): Promise<boolean> {
  await s.click(site, composer, { after: 300 });
  await typeText(s, site, words, 70);
  await s.rest();
  // A follow up may bring nothing new, and then no line shows.
  return until(() => stripSays(site), waitMs);
}

const sentCount = (tab: Tab): number => ((tab.win as unknown as { __coereFakeSentText?: string[] }).__coereFakeSentText ?? []).length;

/** Empties the box after a send, as the site does; the stand in leaves it as it was. */
async function emptyBox(s: Stage, site: Tab): Promise<void> {
  (site.doc.querySelector(".ProseMirror") as HTMLElement | null)?.focus();
  site.doc.execCommand("selectAll");
  await s.press(site, "Backspace", 60);
}

/** One Enter: the context goes in front of the draft and the message is sent; the site answers. */
async function send(s: Stage, site: Tab, chips = ".fake-file-chip"): Promise<void> {
  const sent = sentCount(site);
  (site.doc.querySelector(".ProseMirror") as HTMLElement | null)?.focus();
  await s.press(site, "End");
  await s.press(site, "Enter");
  await until(() => sentCount(site) > sent, 30_000);
  // The site clears its box and the file beside it once a message is sent; the stand in leaves both, so they are cleared here.
  await emptyBox(s, site);
  site.doc.querySelectorAll(chips).forEach((chip) => chip.remove());
  await s.rest();
}

/**
 * Scrolls the page's own scrolling box so `el` sits in its middle, as the
 * film's scrollIntoViewIfNeeded does, without moving the page itself.
 */
function centerIn(el: Element): void {
  const win = el.ownerDocument.defaultView!;
  for (let box = el.parentElement; box; box = box.parentElement) {
    if (!/(auto|scroll)/.test(win.getComputedStyle(box).overflowY) || box.scrollHeight <= box.clientHeight) continue;
    const at = el.getBoundingClientRect();
    const view = box.getBoundingClientRect();
    box.scrollTop += at.top + at.height / 2 - (view.top + view.height / 2);
    return;
  }
}

/** Waits until the page stops moving `el` as its cards draw, the way the film's settled() waits for a still page. */
async function settled(el: Element): Promise<void> {
  let last = Number.NaN;
  for (let still = 0, i = 0; still < 6 && i < 100; i++) {
    const top = el.getBoundingClientRect().top;
    still = top === last ? still + 1 : 0;
    last = top;
    await new Promise((r) => setTimeout(r, 50));
  }
}

/** The list's box takes the focus a moment after its mode changes; typing waits for it. */
const boxFocused = (tab: Tab) => until(() => focused(tab.doc)?.matches(".coere-ctx-ask input") ?? false, 5000);

const listShown = (s: Stage, site: Tab) => s.has(site, stripList);

async function smartContext(s: Stage): Promise<void> {
  s.chapter("type");
  const site = await open(s, "chat", "sites/chatgpt.html", SESSION_REPLIES);
  await s.card("Smart context", "What you need goes with your message, as you send it.", 2600);
  await s.waitFor(site, composer);
  await s.wait(1200);
  await s.film(site);
  s.say("In a fresh ChatGPT chat, Maya asks for help with her interview.");
  await draft(s, site, DRAFT);

  s.chapter("goes");
  s.say("The blue line says what goes with it: her earlier prep chat, and the AIs she had it with.");
  await s.wait(800);
  await s.glide(site, strip);
  await s.wait(1100);
  await s.click(site, role("button", "Show the memories that go in", { exact: true }), { after: 400 });
  await s.waitFor(site, stripList);
  await s.rest();
  s.say("The list shows all of it: the chat, who she is, and what she knows about PearX and Tidepool.");
  await s.wait(4200);

  s.chapter("add");
  s.say("Add memory searches her memory. The top four show, and what matches lights up.");
  await s.click(site, role("button", "Add memory", { exact: true, within: stripList }), { after: 400 });
  await s.waitFor(site, memorySearch);
  await boxFocused(site);
  await typeText(s, site, "plan", 90);
  await s.rest();
  await s.waitFor(site, text(/^\d+ match(es)?$/, "[aria-live]", { within: memorySearch }), 8000).catch(() => null);
  await s.wait(3800);
  await s.press(site, "Escape");
  await s.wait(600);
  if (!listShown(s, site)) await s.click(site, role("button", "Show the memories that go in", { exact: true }), { after: 400 });
  s.say("Ask Cori takes it in her own words, and adds the notes she meant.");
  await s.click(site, role("button", "Ask Cori", { exact: true, within: stripList }), { after: 400 });
  await boxFocused(site);
  await typeText(s, site, "add my notes for the Tidepool launch talk", 60);
  await s.press(site, "Enter");
  await s.rest();
  await s.waitFor(site, text("Cori added", "h3", { within: stripList }));
  await s.wait(3600);
  const hide = role("button", "Hide the list", { exact: true });
  if (s.has(site, hide)) await s.click(site, hide, { after: 300 });

  s.chapter("enter");
  s.say("One Enter puts it all in front of her draft and sends. ChatGPT starts from the work she already did.");
  await send(s, site);
  await s.wait(3600);

  // The owner's flow: SkipDoodle, a follow up, and the stack again later in the same chat.
  const chat = await open(s, "skip", "sites/chatgpt-later.html", SKIPDOODLE_REPLIES);
  await s.waitFor(chat, composer);
  s.chapter("chat");
  await s.film(chat);
  s.say("In another chat she brings up her side project.");
  await draft(s, chat, "Yo remember my project SkipDoodle");
  s.say("Coere adds who she is and what it knows about SkipDoodle.");
  await s.wait(800);
  await s.glide(chat, strip);
  await s.wait(1100);
  await send(s, chat);
  await s.wait(2600);
  s.say("Then she asks a follow up in the same chat.");
  if (await draft(s, chat, "How would I make this change", 4_000)) {
    s.say("It gets only how she likes answers. Nothing else is added again.");
    await s.glide(chat, strip);
  } else s.say("Nothing new goes with it. ChatGPT already has it.");
  await s.wait(1300);
  await send(s, chat);
  await s.wait(2400);
  const again = await draft(s, chat, "Hey remember tech stack for SkipDoodle");
  s.say(again ? "Later, asking about the stack brings SkipDoodle’s tech stack back." : "Asking about the stack later, she gets an answer from what the chat already holds.");
  await s.wait(800);
  await s.glide(chat, strip);
  await s.wait(1100);
  await send(s, chat);
  await s.wait(2600);
}

/**
 * File Upload (beta) (memory/upload.ts): Dev Tools shows the switch in
 * Settings' Memory card, she sets it to upload above 1,000 characters, and
 * one Enter then attaches the context as coere-context.txt, puts a one line
 * note in front of the draft and sends once.
 *
 * Tabs a chapter is done with stay open, out of sight, as in the browser:
 * a closed tab's listeners stay in the World (stage.close does not drop
 * them), and calling one from a removed frame throws, which makes the
 * dashboard's saves fail.
 */
async function fileUpload(s: Stage): Promise<void> {
  const settings = await s.open("settings", "/preview/live/lib/console-v2.html?tab=settings");
  const devTools = role("switch", "Enable Dev Tools");
  await settled(await s.waitFor(settings, devTools));
  centerIn(await s.waitFor(settings, devTools));
  s.chapter("upload");
  await s.film(settings);
  s.say("For a long context, Dev Tools has File Upload (beta).");
  await s.wait(1600);
  await s.click(settings, devTools, { after: 600 });
  const upload = role("switch", "File Upload (beta)");
  centerIn(await s.waitFor(settings, upload));
  await s.wait(400);
  s.say("With it on, a context longer than the number she sets goes as a text file. A short one stays as text.");
  await s.click(settings, upload, { after: 500 });
  const above: Query = 'input[type="number"]';
  await s.click(settings, above, { after: 200 });
  settings.doc.execCommand("selectAll");
  await typeText(s, settings, "1000", 110);
  // The field keeps a number once it loses the focus, as when she clicks away.
  (await s.waitFor(settings, above) as HTMLInputElement).blur();
  await s.rest();
  await s.wait(2600);

  const site = await open(s, "upload", "sites/chatgpt-evening.html", SESSION_REPLIES);
  await s.waitFor(site, composer);
  await s.wait(1200);
  await s.film(site);
  s.say("Her interview prep chat makes this context long.");
  await s.click(site, composer, { after: 300 });
  await typeText(s, site, DRAFT, 70);
  await until(() => /your chat/.test(findStripText(site) ?? ""), 30_000);
  await s.rest();
  await s.wait(2400);
  s.say("One Enter attaches it as coere-context.txt, puts a short note in front of her draft, and sends once.");
  const sent = sentCount(site);
  (site.doc.querySelector(".ProseMirror") as HTMLElement | null)?.focus();
  await s.press(site, "End");
  await s.press(site, "Enter");
  // The file goes up first, with the line saying so; the site takes its time, as a real upload does.
  await s.glide(site, ".fake-upload-chip");
  await until(() => sentCount(site) > sent, 40_000);
  await s.wait(900);
  await emptyBox(s, site);
  site.doc.querySelectorAll(".fake-upload-chip").forEach((chip) => chip.remove());
  await s.rest();
  await s.wait(3600);
  await s.card("Smart context", "Your memory, in every new chat.", 2600);
  s.say("What goes is always on the line above the box, to change before she sends.");
  // Anything the real code asked that this film's World left unanswered, for whoever changes the film.
  if (s.world.unanswered.length) console.warn("Smart context: unanswered", JSON.stringify(s.world.unanswered));
}

async function film(s: Stage): Promise<void> {
  await smartContext(s);
  await fileUpload(s);
}

function setup(world: World): void {
  setupMemory(world);
  setupConsole(world);
}

play({ title: "Smart context", chapters: CHAPTERS }, film, setup);

