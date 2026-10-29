import { play } from "../../stage/player";
import { key } from "../../stage/input";
import { deep, deepAll, nameOf, resolve, role, shown, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";
import { field } from "../../../demos/industries/fields/finance.mjs";
import { inlineMemoryCss } from "./css-fix";
import { buildMemory, NOW, type Mem } from "./memory";
import { PREP_REPLY } from "./prep";
import { answerSites } from "./sites-world";
import { answerCori, answerTeam, filmClock } from "./team";

/**
 * Coere for finance: Daniel Reyes, an advisor at Ashgrove Wealth Partners,
 * prepares Elena Lindqvist's annual review. Four parts, one per story on
 * the site's finance page (src/site/content/industry-stories/part-one.ts):
 *
 *  context       In a fresh ChatGPT chat he types his review draft; Coere's
 *                strip says what goes, the list shows his prep chat, About
 *                me and the household's goals and accounts, and one Enter
 *                sends them in front of the draft (smart-context film).
 *  graph         The firm's memory in the Coere for Teams dashboard:
 *                Company, Clients and Tone, then the Lindqvist household's
 *                sheet with its contacts, promises and deadlines (teams film).
 *  confidential  A note to Elena gets the Lindqvist household's card and no
 *                other client's; Cori says what the team promised them,
 *                each with its source (teams film, real Cori host).
 *  app           review-prep, an app on Forge, is allowed and reads the
 *                household from the context API in a terminal (v3 film).
 *
 * Every Coere surface is Coere's own code from coere-v2; the World answers
 * from the firm's memory (memory.ts) and the field's words
 * (demos/industries/fields/finance.mjs). Made up people and data.
 */

const CHAPTERS = [
  { id: "context", title: "Review prep", seconds: 28 },
  { id: "graph", title: "Every household", seconds: 30 },
  { id: "confidential", title: "One client at a time", seconds: 35 },
  { id: "app", title: "Review prep app", seconds: 21 },
];

const DANIEL = { name: field.person.name, first: field.person.name.split(" ")[0], initials: field.person.initials };
/** Coere for Teams' dashboard, its own entry on the film's day (console.ts). */
const MEMORY_PAGE = "console.html?tab=memory";
const CLIENT = field.client.name;

/** A query with a name, so a wait that finds nothing says what it looked for. */
function label<Q extends (doc: Document) => Element | null | undefined>(text: string, q: Q): Q {
  q.toString = () => text;
  return q;
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

/**
 * A chapter that opens on a new page. Played through, the chapter starts
 * before the page opens, so a run asked to end there ends on the shot
 * before; skipped to, it starts once the page is on screen, so a short
 * showcase opens on it (as demos/films/v3 does).
 */
async function opening<T>(s: Stage, id: string, open: () => Promise<T>): Promise<T> {
  const through = !s.fast;
  if (through) s.chapter(id);
  const tab = await open();
  if (!through) s.chapter(id);
  return tab;
}

// The chat sites.

const composer: Query = ".ProseMirror";
const strip: Query = "[data-coere-context-strip] .coere-ctx-strip";
const stripList: Query = "#coere-ctx-list";
const stripText = (tab: Tab) => deep(tab.doc, "[data-coere-context-strip] .coere-ctx-text")?.textContent ?? "";
const sentCount = (tab: Tab): number => ((tab.win as unknown as { __coereFakeSentText?: string[] }).__coereFakeSentText ?? []).length;
const replied = (tab: Tab) => tab.doc.documentElement.hasAttribute("data-fake-replied");

/**
 * Opens a replica ChatGPT. A browser runs the page's microtasks between
 * the listeners of a real key, so ProseMirror's DOM observer takes in the
 * block Coere's send hook just put in before the site's own Enter reads
 * the box; the scripted hand's keys run every listener in one go, so the
 * editor is told to read the DOM right after each Enter (smart-context).
 */
async function openChat(s: Stage, name: string, page: string, replies: readonly string[]): Promise<Tab> {
  const tab = await s.open(name, page, { host: "chatgpt.com", person: DANIEL, replies });
  tab.win.addEventListener("keydown", (e) => e.key === "Enter" && tab.doc.dispatchEvent(new Event("selectionchange")), true);
  await s.waitFor(tab, composer);
  // Coere finishes starting on the page (its scan, its prefs) before a draft can get context.
  await new Promise((r) => setTimeout(r, 1500));
  return tab;
}

/** Types as a person does; skipping ahead, the last letter still goes in as a key, since Coere reads a box on a key. */
async function typeText(s: Stage, tab: Tab, words: string, delay: number): Promise<void> {
  if (!s.fast) return s.type(tab, words, delay);
  await s.type(tab, words.slice(0, -1), delay);
  key(tab.doc, words.slice(-1));
}

/** One Enter: the context goes in front of the draft and the message is sent; the site answers. */
async function send(s: Stage, site: Tab): Promise<void> {
  const sent = sentCount(site);
  (site.doc.querySelector(".ProseMirror") as HTMLElement | null)?.focus();
  await s.press(site, "End");
  await s.press(site, "Enter");
  await until(() => sentCount(site) > sent, 30_000);
  // The site empties its box once a message is sent; the stand in leaves it, so it is emptied here.
  const box = site.doc.querySelector(".ProseMirror") as HTMLElement | null;
  if (box) {
    box.focus();
    site.doc.execCommand("selectAll");
    site.doc.execCommand("delete");
    box.blur();
  }
  // And the file chip of a chat that went whole.
  site.doc.querySelectorAll(".fake-file-chip").forEach((chip) => chip.remove());
  await s.rest();
}

async function openList(s: Stage, site: Tab): Promise<void> {
  await s.click(site, role("button", "Show the memories that go in", { exact: true }), { after: 400 });
  await s.waitFor(site, stripList);
  await s.rest();
}

async function hideList(s: Stage, site: Tab): Promise<void> {
  const hide = role("button", "Hide the list", { exact: true });
  if (s.has(site, hide)) await s.click(site, hide, { after: 300 });
}

/** 1. Review prep from a year of conversations. */
async function reviewPrep(s: Stage): Promise<void> {
  const site = await opening(s, "context", async () => {
    const tab = await openChat(s, "prep", "sites/chatgpt.html", [PREP_REPLY]);
    await s.film(tab);
    return tab;
  });
  s.say("In a fresh ChatGPT chat, Daniel asks for help with Elena Lindqvist's annual review.");
  await s.click(site, composer, { after: 300 });
  await typeText(s, site, field.context.draft, 62);
  await s.rest();
  await until(() => /Adding/.test(stripText(site)), 10_000);
  s.say("The blue line says what goes: his prep chat and what the household told him this year.");
  // The strip's reveal plays before the pointer goes to it.
  await s.wait(800);
  await s.glide(site, strip);
  await s.wait(1100);
  await openList(s, site);
  s.say("The list shows it all: the chat, who he is, and the household's goals and accounts.");
  await s.wait(5200);
  await hideList(s, site);
  s.say("One Enter puts it in front of his draft and sends. ChatGPT starts from the client's own words.");
  await send(s, site);
  await until(() => replied(site), 30_000);
  await s.wait(4200);
}

// The Teams dashboard.

const searchBox: Query = role("combobox", "Search memory and chats", { exact: true });

/** A button inside a group of that name that also holds a button named `has`: the scope chips, not the graph's own. */
const groupButton = (group: string, has: string, name: string): Query =>
  label(`${name} in ${group}`, (doc) => {
    const g = deepAll(doc, `[role="group"][aria-label="${group}"]`).filter(shown).find((x) => deepAll(x, "button").some((b) => nameOf(b) === has));
    return g ? deepAll(g, "button").find((b) => nameOf(b) === name && shown(b)) : null;
  });

const sideSheet = (name: string) => label(`sheet ${name}`, (doc: Document) => deepAll(doc, 'aside, [role="complementary"]').find((el) => shown(el) && nameOf(el) === name));

const searchHit = (name: string): Query =>
  label(`search result ${name}`, (doc) => {
    const list = resolve(doc, role("listbox", "Search results"));
    if (!list) return null;
    return deepAll(list, "*").find((el) => shown(el) && el.children.length === 0 && (el.textContent ?? "").trim() === name) ?? null;
  });

const inSheet = (sheet: Query, kind: string, name: string): Query =>
  label(`${kind} ${name} in ${String(sheet)}`, (doc) => {
    const scope = resolve(doc, sheet);
    return scope ? resolve(doc, role(kind, name, { exact: false, within: () => scope })) : null;
  });

/** The dashboard on the Memory page, drawn and settled, off screen until filmed. */
async function memoryPage(s: Stage, name: string): Promise<Tab> {
  const page = await s.open(name, MEMORY_PAGE);
  await inlineMemoryCss(page);
  await s.waitFor(page, searchBox);
  // The graph lays itself out over a second or two.
  await new Promise((r) => setTimeout(r, s.fast ? 1500 : 2500));
  return page;
}

/** Finds a thing by name in the Memory page's search and opens its sheet, as a person does. */
async function openByName(s: Stage, page: Tab, name: string): Promise<void> {
  await s.click(page, searchBox, { after: 150 });
  await s.type(page, name, 55);
  await s.waitFor(page, searchHit(name));
  await s.wait(450);
  await s.click(page, searchHit(name), { after: 300 });
  await s.waitFor(page, sideSheet(name));
  await s.rest();
}

/** Scrolls the open sheet so a group's heading sits near its top, gently, as a trackpad does. */
async function scrollSheetTo(s: Stage, page: Tab, sheet: Query, heading: string): Promise<void> {
  const h = await s.waitFor(page, inSheet(sheet, "heading", heading));
  const box = (() => {
    for (let el = h.parentElement; el; el = el.parentElement) if (el.scrollHeight > el.clientHeight + 4 && /(auto|scroll)/.test(getComputedStyle(el).overflowY)) return el;
    return null;
  })();
  if (!box) return;
  const target = box.scrollTop + h.getBoundingClientRect().top - box.getBoundingClientRect().top - 24;
  if (s.fast) {
    box.scrollTop = target;
    return;
  }
  const from = box.scrollTop;
  const steps = 26;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    box.scrollTop = from + (target - from) * (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    await s.wait(24);
  }
}

/** 2. Every household in one memory. */
async function households(s: Stage): Promise<Tab> {
  const page = await opening(s, "graph", async () => {
    const tab = await memoryPage(s, "dash");
    await s.film(tab);
    return tab;
  });
  s.say("Coere for Teams keeps one memory for the firm: Company, Clients, and every part of the practice.");
  await s.wait(3400);
  s.say("Clients has a folder for every household.");
  await s.click(page, groupButton("Show", "Clients", "Clients"), { after: 300 });
  await s.rest();
  await s.wait(3200);
  await s.click(page, groupButton("Show", "Clients", "All"), { after: 300 });
  await s.wait(800);
  s.say(`Opened, ${CLIENT} shows its family, its promises and its deadlines.`);
  await openByName(s, page, CLIENT);
  const sheet = sideSheet(CLIENT);
  await s.waitFor(page, inSheet(sheet, "heading", "Promises"));
  await s.wait(3600);
  await scrollSheetTo(s, page, sheet, "Promises");
  await s.wait(3200);
  await scrollSheetTo(s, page, sheet, "Deadlines");
  await s.wait(3400);
  return page;
}

const coriScope = '[data-testid="coere-cori"], .cx-cori-page';
const coriSeat = label("Ask Cori", (doc: Document) => doc.querySelector<HTMLElement>(".cx-cori-seat"));
const coriBox = label("Cori's box", (doc: Document) => doc.querySelector<HTMLElement>(`:is(${coriScope}) textarea`));
const coriLast = (doc: Document) => [...doc.querySelectorAll(`:is(${coriScope}) :is([data-turn="answer"], [data-turn="said"])`)].at(-1) ?? null;

/** What ChatGPT writes for the note: only the Lindqvist household's lines are in front of it. */
const NOTE_REPLY = [
  "Here is a short note you can send.",
  "",
  "Hi Elena,",
  "",
  "Your portfolio has grown to 68 percent stocks, above the 60 percent we set in March. You told us the spring drop made you uneasy, so we are trimming stocks back to 60 percent to take some of the swing out.",
  "",
  "It is one set of trades, and I will send you a short note when it is done. We can walk through it on Friday.",
  "",
  DANIEL.first,
].join("\n");

/** 3. One client at a time. */
async function oneClient(s: Stage, before: Tab | null): Promise<void> {
  const site = await opening(s, "confidential", async () => {
    const tab = await openChat(s, "note", "sites/chatgpt-team.html", [NOTE_REPLY]);
    await s.film(tab);
    if (before) s.close(before);
    return tab;
  });
  // Cori's page is made ready off screen while Daniel writes.
  const cori = memoryPage(s, "cori");
  s.say("Daniel starts a note to Elena on ChatGPT.");
  await s.click(site, composer, { after: 300 });
  await typeText(s, site, field.clientLine.draft, 46);
  await s.rest();
  await until(() => stripText(site).includes(`on the client ${CLIENT}`), 15_000);
  s.say(`The line names one client. Only ${CLIENT}'s memory goes with it.`);
  await s.wait(800);
  await s.glide(site, strip);
  await s.wait(1100);
  await openList(s, site);
  await s.wait(3000);
  await hideList(s, site);
  await send(s, site);
  await until(() => replied(site), 30_000);
  await s.wait(2400);

  const page = await cori;
  await s.film(page);
  s.close(site);
  s.say("On the dashboard, he asks Cori what the team promised them.");
  await s.click(page, coriSeat, { after: 450 });
  await s.click(page, coriBox, { after: 150 });
  await s.type(page, field.cori.question, 50);
  await s.press(page, "Enter");
  await s.waitFor(
    page,
    label("Cori's answer", (doc: Document) => {
      const last = coriLast(doc);
      return last && /promise/i.test(last.textContent ?? "") && !doc.querySelector(".cr-typed") ? last : null;
    }),
    30_000,
  );
  await s.rest();
  s.say("Cori answers from that household's memory, each promise with its date and the chat it came from.");
  await s.wait(6000);
}

// The terminal.

type Term = { prompt(): HTMLElement; ran(): void; line(text: string): void; done(): void; clear(): void };
const term = (tab: Tab) => (tab.win as unknown as { __term: Term }).__term;

async function run(s: Stage, shell: Tab, command: string): Promise<void> {
  term(shell).prompt();
  await s.type(shell, command, 40);
  await s.wait(260);
  await s.press(shell, "Enter", 0);
  term(shell).ran();
}

async function print(s: Stage, shell: Tab, out: string, lineMs: number): Promise<void> {
  for (const line of out.replace(/\s+$/, "").split("\n")) {
    term(shell).line(line);
    await s.wait(lineMs);
  }
  term(shell).done();
}

const APP = field.app;
/** What the context API gives back for the ask, as the SDK prints it (coere-server's context, v3/bake.mts). */
const CONTEXT_OUT = [
  "[Context from Coere, my saved memory. Use it if it helps.]",
  ...APP.sections.flatMap((x: { path: string; facts: string[] }) => [x.path, ...x.facts.map((f) => `- ${f}`)]),
  "[End of context from Coere]",
  "",
  `From ${APP.from} chats`,
  ...APP.reasons.map(([path, why]: [string, string]) => `  ${path}: ${why}`),
].join("\n");

/** 4. Review tools that know the client. */
async function reviewApp(s: Stage, before: Tab | null): Promise<void> {
  const shell = await opening(s, "app", async () => {
    const tab = await s.open("shell", `terminal.html?title=${APP.name}`);
    await s.film(tab);
    if (before) s.close(before);
    return tab;
  });
  s.say(`${APP.name} is the firm's own app on Forge. It asks Coere for access from its code.`);
  await run(s, shell, `uv run ${APP.name} --connect`);
  await s.wait(700);
  term(shell).line(`Open Apps in Coere and allow ${APP.name}. Code 7QKD-4M2X.`);
  await s.wait(2600);
  s.say("Daniel allows it, and the app keeps its token.");
  term(shell).line(`Allowed. The token is saved in ~/${APP.name}/.env.`);
  term(shell).done();
  await s.wait(2000);
  s.say("Before the meeting, it asks for the household's goals and accounts.");
  await run(s, shell, `uv run context.py "${APP.ask}"`);
  await s.wait(800);
  await print(s, shell, CONTEXT_OUT, 110);
  s.say("Coere sends what the chats said, with where each line sits and why it went.");
  await s.wait(7000);
}

let mem: Mem | null = null;

/**
 * A tab the film closed leaves its listeners in the World, and calling
 * into a removed frame throws, which would break a write for every other
 * tab; each listener is guarded, so a gone tab only goes quiet (teams film).
 */
function guardListeners(world: World): void {
  const watch = world.watchStorage.bind(world);
  world.watchStorage = (fn, tab) =>
    watch((changes, area) => {
      try {
        fn(changes, area);
      } catch {
        // The tab is gone.
      }
    }, tab);
  const listen = world.listen.bind(world);
  world.listen = (tab, fn) =>
    listen(tab, (message, sender, reply) => {
      try {
        return fn(message, sender, reply);
      } catch {
        return undefined;
      }
    });
}

function setup(world: World): void {
  guardListeners(world);
  mem = buildMemory();
  const clock = filmClock();
  // Daniel saw Cori's Right Option tip on his first visit, long ago.
  world.write("local", { "coere.cori.hint": { v: 1, seen: true, at: NOW - 60 * 86_400_000 } });
  answerTeam(world, mem);
  answerSites(world, mem);
  answerCori(world, clock);
}

/**
 * The parts are independent: each opens its own pages. A short showcase
 * asked to start at a part (`?from=`) begins there, so the player skips
 * nothing it would have to wait for unseen.
 */
const IDS = CHAPTERS.map((c) => c.id);

async function film(s: Stage): Promise<void> {
  const from = Math.max(0, IDS.indexOf(new URLSearchParams(location.search).get("from") ?? ""));
  if (from === 0) await s.card("Coere for finance", "Every client's history, in every chat.", 2600);
  if (from <= 0) await reviewPrep(s);
  const dash = from <= 1 ? await households(s) : null;
  if (from <= 2) await oneClient(s, dash);
  await reviewApp(s, null);
  if (s.world.unanswered.length) console.warn("Unanswered:", [...new Set(s.world.unanswered.map((u) => u.type))].join(" "));
}

play({ title: "Coere for finance", chapters: CHAPTERS }, film, setup);
