import "./clock";
import { field } from "../../../demos/industries/fields/energy.mjs";
import { play } from "../../stage/player";
import { key } from "../../stage/input";
import { deep, role, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";
import { Apps, TERMINAL } from "./apps";
import { FILM_NOW } from "./clock";
import { answerContext, REPLY } from "./context";
import { answerCori } from "./cori";
import { buildCompany, CLIENTS, FIRM, SELF, WORKERS, type Mem } from "./company";
import { answerMemory } from "./company-world";
import { groupButton, label, openByName, roleIn, searchBox, sideSheet } from "./helpers";
import { contextFor } from "./views";

/**
 * Coere for energy: Hannah Lund leads field maintenance at Crestline
 * Renewables, the week before the gearbox job on turbine 14 at Altamont
 * Wind. Four parts, one per story on the site's energy page
 * (src/site/content/industry-stories/part-two.ts):
 *
 * - context: in a fresh ChatGPT chat her draft brings her gearbox chat,
 *   who she is, turbine 14 and the site's access rules (Smart context, as
 *   the smart-context film plays it).
 * - graph: the company's memory in Coere for Teams, its sites and their
 *   turbines, and Altamont Wind's sheet (as the teams film plays its
 *   agency).
 * - confidential: a plan for Ray at Altamont gets Altamont's context and
 *   no other operator's, and Cori lists what the team promised Altamont,
 *   each line with its chat.
 * - app: the company's field planner asks for access from its own code,
 *   Hannah allows it on the Apps page, and it prints what the context API
 *   sends for its question about turbine 14 (as the v3 film plays its
 *   planner).
 *
 * Every Coere surface is Coere's own code from coere-v2; the World answers
 * it from the field's data (demos/industries/fields/energy.mjs). Made up.
 */

const CHAPTERS = [
  { id: "context", title: "Work plans built on the site's history" },
  { id: "graph", title: "Every site in one memory" },
  { id: "confidential", title: "Plans that stay with the site" },
  { id: "app", title: "Field planners with memory" },
];
const ORDER = CHAPTERS.map((c) => c.id);
/** The chapter the page was asked to start at. */
const FROM = new URLSearchParams(location.search).get("from");

/** Whether the player is skipping past chapter `id` to a later one, so none of it needs to happen. */
const past = (s: Stage, id: string): boolean => s.fast && FROM !== null && ORDER.indexOf(FROM) > ORDER.indexOf(id);

const HANNAH = { name: field.person.name, first: field.person.name.split(" ")[0]!, initials: field.person.initials };
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
  const tab = await s.open(name, page, { host: "chatgpt.com", person: HANNAH, replies });
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

/** One Enter: the context goes in front of the draft, the gearbox chat beside it as a file, and the message is sent; the site empties its box and the file chip, which the stand in leaves to us. */
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

/** The company's dashboard on a page, drawn and settled, off screen until filmed. */
async function dashboard(s: Stage, name: string, path = DASHBOARD): Promise<Tab> {
  const page = await s.open(name, path);
  await s.waitFor(page, searchBox);
  // The graph lays itself out over a second or two.
  await new Promise((r) => setTimeout(r, s.fast ? 300 : 2500));
  return page;
}

/** 1. Work plans built on the site's history. */
async function context(s: Stage, next: { graph?: Promise<Tab> }): Promise<void> {
  if (past(s, "context")) return s.chapter("context");
  const ready = openChat(s, "chat", "sites/chatgpt.html", [REPLY]);
  if (!s.fast) await s.card("Coere for energy", "Every site, from what the crews already learned.", 2600);
  const site = await opening(s, "context", ready);
  s.say("In a fresh ChatGPT chat, Hannah asks for a plan for next week's gearbox job.");
  await s.click(site, composer, { after: 300 });
  await typeText(s, site, field.context.draft, 62);
  await s.rest();
  await until(() => /Adding your chat/.test(stripText(site)), 15_000);
  s.say("The line above the box says what goes: her gearbox chat, turbine 14 and the site's access.");
  await s.wait(700);
  await s.glide(site, strip);
  await s.wait(2600);
  await s.click(site, showList, { after: 400 });
  await s.waitFor(site, stripList);
  await s.rest();
  s.say("The list shows it all: her chat, who she is, the turbine and the site, with lockout and cranes offered beside.");
  await s.wait(4200);
  const hide = role("button", "Hide the list", { exact: true });
  if (s.has(site, hide)) await s.click(site, hide, { after: 300 });
  s.say("One Enter puts it in front of her draft and sends.");
  await send(s, site);
  // The dashboard for the next part loads off screen while ChatGPT answers.
  next.graph = dashboard(s, "memory");
  await until(() => site.doc.documentElement.hasAttribute("data-fake-replied"), 30_000);
  s.say("ChatGPT plans from the site's history: the oil sample, the last bearing, the crane and the wind limit.");
  await s.wait(4200);
}

/** 2. Every site in one memory. */
async function graph(s: Stage, next: { graph?: Promise<Tab>; chat?: Promise<Tab>; cori?: Promise<Tab> }): Promise<void> {
  if (past(s, "graph")) return s.chapter("graph");
  const page = await opening(s, "graph", next.graph ?? dashboard(s, "memory"));
  s.say("Coere for Teams keeps one memory of the company and its sites, built from every crew's chats.");
  await s.wait(2600);
  s.say("Clients has a folder for each site operator, with its contacts, turbines and work.");
  await s.click(page, groupButton("Show", "Clients", "Clients"), { after: 300 });
  await s.rest();
  await s.wait(3000);
  s.say(`Opened, ${CLIENT} shows everything the company knows, slot by slot.`);
  await openByName(s, page, CLIENT);
  const sheet = sideSheet(CLIENT);
  await s.waitFor(page, roleIn(sheet, "heading", "Promises"));
  // The next part's pages load off screen while the sheet is read.
  next.chat = openChat(s, "client", "sites/chatgpt-company.html", []);
  next.cori = dashboard(s, "cori");
  await s.wait(2600);
  // Down the sheet: promises, the site briefing, requests, deadlines and billing, each with its date and chat.
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

/** 3. Plans that stay with the site. */
async function confidential(s: Stage, next: { chat?: Promise<Tab>; cori?: Promise<Tab>; shell?: Promise<Tab> }): Promise<void> {
  if (past(s, "confidential")) return s.chapter("confidential");
  const site = await opening(s, "confidential", next.chat ?? openChat(s, "client", "sites/chatgpt-company.html", []));
  const cori = next.cori ?? dashboard(s, "cori");
  s.say("On ChatGPT, Hannah starts the turbine 14 plan for Ray at Altamont.");
  await s.click(site, composer, { after: 300 });
  await typeText(s, site, field.clientLine.draft, 52);
  await s.rest();
  await until(() => stripText(site).includes(`on the client ${CLIENT}`), 20_000);
  s.say(`The line names the site the draft is about. Only ${CLIENT} goes with it.`);
  await s.wait(600);
  await s.glide(site, strip);
  await s.wait(2600);
  await s.click(site, showList, { after: 400 });
  await s.waitFor(site, stripList);
  await s.rest();
  s.say("One site per send. Nothing from Kern Solar, Mesa Storage or Pine Ridge Wind.");
  await s.wait(3600);

  const page = await cori;
  next.shell = s.open("shell", `terminal.html?title=${field.app.name}`);
  await s.film(page);
  s.say("On the dashboard, she asks Cori what the team promised Altamont.");
  await s.click(page, label("Ask Cori", (doc: Document) => doc.querySelector<HTMLElement>(".cx-cori-seat")), { after: 500 });
  const box = label("Cori's box", (doc: Document) => doc.querySelector<HTMLElement>(':is([data-testid="coere-cori"], .cx-cori-page) textarea'));
  await s.click(page, box, { after: 150 });
  await typeText(s, page, QUESTION, 60);
  await s.press(page, "Enter");
  await s.waitFor(
    page,
    label("Cori's answer", (doc: Document) => {
      const last = [...doc.querySelectorAll(':is([data-testid="coere-cori"], .cx-cori-page) :is([data-turn="answer"], [data-turn="said"])')].at(-1);
      return last && /promise/i.test(last.textContent ?? "") && !doc.querySelector(".cr-typed") ? last : null;
    }),
    30_000,
  );
  await s.rest();
  s.say("Cori answers from Altamont's memory, and every line names the chat it came from.");
  await s.wait(5200);
}

/** The question Cori is asked: what the team promised the client, which Cori reads in code from the client's promise slots. */
const QUESTION = field.cori.question;

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

/** 4. Field planners with memory. */
async function app(s: Stage, apps: Apps, next: { shell?: Promise<Tab> }): Promise<void> {
  if (past(s, "app")) return s.chapter("app");
  const shell = await opening(s, "app", next.shell ?? s.open("shell", `terminal.html?title=${field.app.name}`));
  const { connect, ask } = TERMINAL;
  s.say("Crestline's field planner is a small app built on Coere Forge. It asks for access from its own code.");
  await run(s, shell, connect.command);
  await s.wait(500);
  apps.go("asked");
  term(shell).line(connect.asked);
  const page = openApps(s);
  await s.wait(2000);
  const allow = await page;
  await s.waitFor(allow, role("heading", `Allow ${field.app.name} to access Coere memory?`), 20_000);
  await s.film(allow);
  s.say("Hannah sees the same code, what it may read, and which sections. She allows it.");
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
  s.say("Then it asks about turbine 14, and the context API answers from the site's memory.");
  await run(s, shell, ask.command);
  await s.wait(900);
  await print(s, shell, ask.out, 110);
  await s.wait(5200);
}

let mem: Mem | null = null;
let apps: Apps | null = null;

function setup(world: World): void {
  mem = buildCompany();
  // Hannah has used Coere before: Cori said his hello on the dashboard, and showed his key on the AIs.
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

play({ title: "Coere for energy", chapters: CHAPTERS }, film, setup);
