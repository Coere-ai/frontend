import "./clock";
import { field } from "../../../demos/industries/fields/legal.mjs";
import { play } from "../../stage/player";
import { key } from "../../stage/input";
import { deep, role, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";
import { Apps, TERMINAL } from "./apps";
import { FILM_NOW } from "./clock";
import { answerContext, REPLY } from "./context";
import { answerCori } from "./cori";
import { buildFirm, CLIENTS, FIRM, SELF, WORKERS, type Mem } from "./firm";
import { answerMemory } from "./firm-world";
import { groupButton, label, openByName, roleIn, searchBox, sideSheet } from "./helpers";
import { contextFor } from "./views";

/**
 * Coere for legal: Nina Okafor, a litigation associate at Whitlock & Rhee,
 * on the morning of the Mendes deposition in Hartwell v. Briarstone. Four
 * parts, one per story on the site's legal page
 * (src/site/content/industry-stories/part-one.ts):
 *
 * - context: in a fresh ChatGPT chat her draft brings her deposition
 *   outline, who she is, the case and its key witnesses (Smart context,
 *   as the smart-context film plays it).
 * - graph: the firm's memory in Coere for Teams, its clients and matters,
 *   and Hartwell Logistics' sheet (as the teams film plays its agency).
 * - confidential: a draft to Priya at Hartwell gets Hartwell's context and
 *   no other client's, and Cori catches her up on Hartwell from memory,
 *   each line with its chat.
 * - app: the firm's matter desk asks for access from its own code, Nina
 *   allows it on the Apps page, and it prints what the context API sends
 *   for its question (as the v3 film plays its planner).
 *
 * Every Coere surface is Coere's own code from coere-v2; the World answers
 * it from the field's data (demos/industries/fields/legal.mjs). Made up.
 */

const CHAPTERS = [
  { id: "context", title: "Deposition prep", seconds: 25 },
  { id: "graph", title: "Clients and matters", seconds: 29 },
  { id: "confidential", title: "One client at a time", seconds: 27 },
  { id: "app", title: "A matter desk", seconds: 26 },
];
const ORDER = CHAPTERS.map((c) => c.id);
/** The chapter the page was asked to start at. */
const FROM = new URLSearchParams(location.search).get("from");

/** Whether the player is skipping past chapter `id` to a later one, so none of it needs to happen. */
const past = (s: Stage, id: string): boolean => s.fast && FROM !== null && ORDER.indexOf(FROM) > ORDER.indexOf(id);

const NINA = { name: field.person.name, first: field.person.name.split(" ")[0]!, initials: field.person.initials };
const DASHBOARD = "console.html?tab=memory";
const CLIENT = field.client.name;

/** ChatGPT's box, its ProseMirror editor. */
const composer: Query = ".ProseMirror";
const strip = label("the context strip", (doc: Document) => deep(doc, "[data-coere-context-strip] .coere-ctx-strip") ?? deep(doc, ".coere-ctx-strip"));
const stripList: Query = "#coere-ctx-list";
const stripText = (tab: Tab): string => (deep(tab.doc, ".coere-ctx-text") ?? strip(tab.doc))?.textContent ?? "";
const showList = role("button", "Show the memories that go in", { exact: true });

/** Polls until `test` holds, or gives up after `ms`. */
async function until(test: () => boolean, ms = 20_000): Promise<boolean> {
  const end = Date.now() + ms;
  while (!test()) {
    if (Date.now() > end) return false;
    await new Promise((r) => setTimeout(r, 50));
  }
  return true;
}

/**
 * A chapter that opens on a page made ready off screen. Played through, the
 * chapter starts as the page comes on screen; skipped to, it starts once the
 * page is there, so a short showcase opens on it.
 */
async function opening(s: Stage, id: string, ready: Promise<Tab> | (() => Promise<Tab>)): Promise<Tab> {
  const tab = await (typeof ready === "function" ? ready() : ready);
  s.chapter(id);
  await s.film(tab);
  return tab;
}

/**
 * Opens a replica ChatGPT. A browser runs the page's microtasks between the
 * listeners of a real key, so ProseMirror's DOM observer takes in the block
 * Coere's send hook just put in before the site's own Enter reads the box;
 * the scripted hand's keys run every listener in one go, so after Coere's
 * listener the editor is told to read the DOM now, as the observer would
 * have (the smart-context film does the same).
 */
async function openChat(s: Stage, name: string, page: string, replies: readonly string[]): Promise<Tab> {
  const tab = await s.open(name, page, { host: "chatgpt.com", person: NINA, replies });
  tab.win.addEventListener("keydown", (e) => e.key === "Enter" && tab.doc.dispatchEvent(new Event("selectionchange")), true);
  await s.waitFor(tab, composer);
  // Coere finishes starting on the page (its scan, its prefs) before a draft can get context.
  await new Promise((r) => setTimeout(r, s.fast ? 600 : 1200));
  return tab;
}

/** Types as a person does; skipping ahead, the text goes in whole with its last letter as a key, since Coere reads a box on a key. */
async function typeText(s: Stage, tab: Tab, words: string, delay: number): Promise<void> {
  if (!s.fast) return s.type(tab, words, delay);
  await s.type(tab, words.slice(0, -1), delay);
  key(tab.doc, words.slice(-1));
}

const sentCount = (tab: Tab): number => ((tab.win as unknown as { __coereFakeSentText?: string[] }).__coereFakeSentText ?? []).length;

/** One Enter: the context goes in front of the draft, the outline chat beside it as a file, and the message is sent; the site empties its box and the file chip, which the stand in leaves to us. */
async function send(s: Stage, site: Tab): Promise<void> {
  const sent = sentCount(site);
  (site.doc.querySelector(".ProseMirror") as HTMLElement | null)?.focus();
  await s.press(site, "End");
  await s.press(site, "Enter");
  await until(() => sentCount(site) > sent, 30_000);
  (site.doc.querySelector(".ProseMirror") as HTMLElement | null)?.focus();
  site.doc.execCommand("selectAll");
  await s.press(site, "Backspace", 60);
  site.doc.querySelectorAll(".fake-file-chip").forEach((chip) => chip.remove());
  (site.doc.activeElement as HTMLElement | null)?.blur();
}

/** The firm's dashboard on a page, drawn and settled, off screen until filmed. */
async function dashboard(s: Stage, name: string, path = DASHBOARD): Promise<Tab> {
  const page = await s.open(name, path);
  await s.waitFor(page, searchBox);
  // The graph lays itself out over a second or two.
  await new Promise((r) => setTimeout(r, s.fast ? 300 : 2500));
  return page;
}

/** 1. Deposition prep that starts from the record. */
async function context(s: Stage, next: { graph?: Promise<Tab> }): Promise<void> {
  if (past(s, "context")) return s.chapter("context");
  const ready = openChat(s, "chat", "sites/chatgpt.html", [REPLY]);
  if (!s.fast) await s.card("Coere for legal", "Every matter, from what you already worked out.", 2600);
  const site = await opening(s, "context", ready);
  s.say("In a fresh ChatGPT chat, Nina asks for help with Thursday's deposition.");
  await s.click(site, composer, { after: 300 });
  await typeText(s, site, field.context.draft, 62);
  await s.rest();
  await until(() => /Adding your chat/.test(stripText(site)), 15_000);
  s.say("The line above the box says what goes: her outline and the case.");
  // The strip's reveal plays before the pointer goes to it.
  await s.wait(800);
  await s.glide(site, strip);
  await s.wait(1100);
  await s.click(site, showList, { after: 400 });
  await s.waitFor(site, stripList);
  await s.rest();
  s.say("The list shows it all: her outline chat, who she is, the case and its key witnesses.");
  await s.wait(4200);
  const hide = role("button", "Hide the list", { exact: true });
  if (s.has(site, hide)) await s.click(site, hide, { after: 300 });
  s.say("One Enter puts it in front of her draft and sends.");
  await send(s, site);
  // The dashboard for the next part loads off screen while ChatGPT answers.
  next.graph = dashboard(s, "memory");
  await until(() => site.doc.documentElement.hasAttribute("data-fake-replied"), 30_000);
  s.say("ChatGPT starts from the record: the witness, Exhibit 14 and the billing question.");
  await s.wait(4200);
}

/** 2. A knowledge graph of every client and matter. */
async function graph(s: Stage, next: { graph?: Promise<Tab>; chat?: Promise<Tab>; cori?: Promise<Tab> }): Promise<void> {
  if (past(s, "graph")) return s.chapter("graph");
  const page = await opening(s, "graph", next.graph ?? dashboard(s, "memory"));
  s.say("Coere for Teams keeps one memory of the firm and its clients, built from everyone's chats.");
  await s.wait(2600);
  s.say("Clients has a folder for each client, with its contacts and matters.");
  await s.click(page, groupButton("Show", "Clients", "Clients"), { after: 300 });
  await s.rest();
  await s.wait(3000);
  s.say(`Opened, ${CLIENT} shows everything the firm knows, slot by slot.`);
  await openByName(s, page, CLIENT);
  const sheet = sideSheet(CLIENT);
  await s.waitFor(page, roleIn(sheet, "heading", "Promises"));
  // The next part's pages load off screen while the sheet is read.
  next.chat = openChat(s, "client", "sites/chatgpt-firm.html", []);
  next.cori = dashboard(s, "cori");
  await s.wait(2600);
  // Down the sheet: promises, the prep call, requests, deadlines and billing, each with its date and chat.
  await s.glide(page, roleIn(sheet, "heading", "Engagements"));
  for (const heading of ["Promises", "Meetings and calls", "Deadlines and deliverables", "Billing and renewals"]) {
    await scrollSheetTo(s, page, sheet, heading);
    await s.wait(2100);
  }
  await s.rest();
  await s.wait(1200);
}

/** Scrolls the sheet under the pointer until a heading sits near its top, as a trackpad does. */
async function scrollSheetTo(s: Stage, page: Tab, sheet: Query, heading: string): Promise<void> {
  const h = roleIn(sheet, "heading", heading);
  const el = (await s.waitFor(page, h)) as HTMLElement;
  const box = sheet(page.doc)!.getBoundingClientRect();
  const dy = el.getBoundingClientRect().top - (box.top + 90);
  if (dy > 4) await s.wheel(page, dy, Math.max(10, Math.round(dy / 22)));
}

/** 3. Client confidentiality by design. */
async function confidential(s: Stage, next: { chat?: Promise<Tab>; cori?: Promise<Tab>; shell?: Promise<Tab> }): Promise<void> {
  if (past(s, "confidential")) return s.chapter("confidential");
  const site = await opening(s, "confidential", next.chat ?? openChat(s, "client", "sites/chatgpt-firm.html", []));
  const cori = next.cori ?? dashboard(s, "cori");
  s.say(`On ChatGPT, Nina starts an update for Priya at ${CLIENT}.`);
  await s.click(site, composer, { after: 300 });
  await typeText(s, site, field.clientLine.draft, 52);
  await s.rest();
  await until(() => stripText(site).includes(`on the client ${CLIENT}`), 20_000);
  s.say(`The line names the client the draft is about. Only ${CLIENT} goes with it.`);
  await s.wait(800);
  await s.glide(site, strip);
  await s.wait(1100);
  await s.click(site, showList, { after: 400 });
  await s.waitFor(site, stripList);
  await s.rest();
  s.say("One client per send. Nothing from Osei Bakery, Calder Foods or Dunmore Clinic.");
  await s.wait(3600);

  const page = await cori;
  next.shell = s.open("shell", "terminal.html?title=matter-desk");
  await s.film(page);
  s.say(`On the dashboard, she asks Cori to catch her up on ${CLIENT}.`);
  await s.click(page, label("Ask Cori", (doc: Document) => doc.querySelector<HTMLElement>(".cx-cori-seat")), { after: 500 });
  const box = label("Cori's box", (doc: Document) => doc.querySelector<HTMLElement>(':is([data-testid="coere-cori"], .cx-cori-page) textarea'));
  await s.click(page, box, { after: 150 });
  await typeText(s, page, QUESTION, 60);
  await s.press(page, "Enter");
  await s.waitFor(
    page,
    label("Cori's answer", (doc: Document) => {
      const last = [...doc.querySelectorAll(':is([data-testid="coere-cori"], .cx-cori-page) :is([data-turn="answer"], [data-turn="said"])')].at(-1);
      return last && /client/i.test(last.textContent ?? "") && !doc.querySelector(".cr-typed") ? last : null;
    }),
    30_000,
  );
  await s.rest();
  s.say("Cori answers from the matter's memory, and every line names the chat it came from.");
  await s.wait(5200);
}

/** The question Cori is asked: a catch up on the client, which Cori reads in code from the client's slots. */
const QUESTION = "catch me up on Hartwell";

type Term = { prompt(): HTMLElement; ran(): void; line(text: string): void; done(): void; clear(): void };
const term = (tab: Tab) => (tab.win as unknown as { __term: Term }).__term;

/** Types a command after the prompt, key by key, and presses Enter. */
async function run(s: Stage, shell: Tab, command: string): Promise<void> {
  term(shell).prompt();
  await s.type(shell, command, 40);
  await s.wait(260);
  await s.press(shell, "Enter", 0);
  term(shell).ran();
}

/** Prints what the command printed, a line at a time. */
async function print(s: Stage, shell: Tab, out: string, lineMs: number): Promise<void> {
  for (const line of out.split("\n")) {
    term(shell).line(line);
    await s.wait(lineMs);
  }
  term(shell).done();
}

/** The Apps section of Coere's dashboard (v3), with the server's address hidden, as the v3 film shows it. */
async function openApps(s: Stage): Promise<Tab> {
  const page = await s.open("apps", "/preview/live/lib/console-v3.html?tab=apps");
  const style = page.doc.createElement("style");
  style.textContent = ".cx-apps-url{visibility:hidden}";
  page.doc.head.append(style);
  await s.waitFor(page, ".cx-apps");
  return page;
}

/** 4. Firm tools that read the matter. */
async function app(s: Stage, apps: Apps, next: { shell?: Promise<Tab> }): Promise<void> {
  if (past(s, "app")) return s.chapter("app");
  const shell = await opening(s, "app", next.shell ?? s.open("shell", "terminal.html?title=matter-desk"));
  const { connect, ask } = TERMINAL;
  s.say("The firm's matter desk is a small app built on Coere Forge. It asks for access from its own code.");
  await run(s, shell, connect.command);
  await s.wait(500);
  apps.go("asked");
  term(shell).line(connect.asked);
  const page = openApps(s);
  await s.wait(2000);
  const allow = await page;
  await s.waitFor(allow, role("heading", `Allow ${field.app.name} to access Coere memory?`), 20_000);
  await s.film(allow);
  s.say("Nina sees the same code, what it may read, and which sections. She allows it.");
  await s.wait(3400);
  await s.click(allow, role("button", /^Allow$/, { within: ".cx-apps-allow", exact: true }), { after: 400 });
  await until(() => !s.has(allow, ".cx-apps-allow"), 20_000);
  await s.rest();
  s.say("It gets a token of its own, which she can revoke at any time.");
  await s.wait(2400);
  term(shell).line(connect.allowed);
  term(shell).done();
  await s.film(shell);
  await s.wait(900);
  s.say("Then it asks where the case stands, and the context API answers from the matter.");
  await run(s, shell, ask.command);
  await s.wait(900);
  await print(s, shell, ask.out, 110);
  await s.wait(5200);
}

let mem: Mem | null = null;
let apps: Apps | null = null;

function setup(world: World): void {
  mem = buildFirm();
  // Nina has used Coere before: Cori said his hello on the dashboard, and showed his key on the AIs.
  world.write("local", {
    "coere.cori.hello": { at: FILM_NOW - 3 * 86_400_000 },
    "coere.cori.hint": { v: 1, seen: true, at: FILM_NOW - 3 * 86_400_000 },
    "coere.solution": { v: 1, company: FIRM, self: SELF, clients: CLIENTS, workers: WORKERS, switches: { findClients: true, learnCoworkers: true }, notClients: [], setupAt: FILM_NOW - 60 * 86_400_000 },
  });
  answerMemory(world, mem);
  const firm = mem;
  answerContext(world, "chat", (method, m) => (method === "memory.contextFor" ? contextFor(firm, String((m.args as { tail?: string })?.tail ?? "")) : null));
  answerCori(world);
  apps = new Apps(world);
  apps.install();
}

async function film(s: Stage): Promise<void> {
  const next: { graph?: Promise<Tab>; chat?: Promise<Tab>; cori?: Promise<Tab>; shell?: Promise<Tab> } = {};
  await context(s, next);
  await graph(s, next);
  await confidential(s, next);
  await app(s, apps!, next);
  if (s.world.unanswered.length) console.warn("Unanswered:", [...new Set(s.world.unanswered.map((u) => `${u.tab}:${u.type}`))].join(" "));
}

play({ title: "Coere for legal", chapters: CHAPTERS }, film, setup);
