import { play } from "../../stage/player";
import { key } from "../../stage/input";
import { deep, deepAll, nameOf, resolve, role, shown, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";
import { field } from "../../../demos/industries/fields/consumer.mjs";
import { Access, APP, terminalLines } from "./apps";
import { ANSWER, CONNECT, DRAFT } from "./connect";
import { answerCori } from "./cori";
import { buildMemory, CLIENT, PERSON, type Mem } from "./memory";
import { answerTeams, contextFor, nodeDetail } from "./views";

/**
 * Coere for consumer brands: Olivia Brandt manages grocery accounts at
 * Fieldhouse Pantry, an oat bar brand, and the page tells four stories,
 * one chapter each (src/site/content/industry-stories, consumer):
 *
 *   context       On ChatGPT she asks for help planning Green Valley
 *                 Market's holiday promotion. Coere's strip says what
 *                 goes, the list shows her reset chat, About me and Green
 *                 Valley's shelf and shoppers, one Enter sends it all,
 *                 and the plan streams in.
 *   graph         The brand's memory in the Coere for Teams dashboard:
 *                 Company and Clients, then Green Valley Market's sheet
 *                 with its buyers, holiday promotion, promises, meetings,
 *                 requests, deadlines and deductions.
 *   confidential  A note to Rosa on ChatGPT takes Green Valley's memory
 *                 and no other partner's; then Cori lists what the team
 *                 promised Green Valley, each promise with its source.
 *   app           Her promotion planner asks for access from its code,
 *                 she allows it, read only and for Clients, on the Apps
 *                 page; it asks what worked at Green Valley, and the Apps
 *                 page keeps a record of what it was sent.
 *
 * Coere's content script, dashboard, Apps page and Cori are its own code
 * from coere-v2; the World answers them from Fieldhouse Pantry's memory
 * (memory.ts, views.ts, connect.ts, apps.ts). Made up people and firms.
 */

const CHAPTERS = [
  { id: "context", title: "Promotions planned from what worked", seconds: 27 },
  { id: "graph", title: "Every retail partner in one place", seconds: 35 },
  { id: "confidential", title: "One partner per message", seconds: 30 },
  { id: "app", title: "Planning tools with memory", seconds: 33 },
];

const LIB = "/preview/live/lib/";
const OLIVIA = { name: PERSON.name, first: PERSON.name.split(" ")[0]!, initials: PERSON.initials };

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

/** The chapter the address asks to start at, if any. */
const FROM = new URLSearchParams(location.search).get("from");
const ORDER = CHAPTERS.map((c) => c.id);

/**
 * Starts a chapter on the tabs `open` makes. Played through, the chapter
 * starts first, so a run asked to end there ends on the shot before. When
 * the player skips to a later chapter, nothing is opened. When it skips to
 * this one, the tabs open behind the cover and the chapter starts once
 * they are ready, so a short showcase opens on its first shot.
 */
async function begin<T>(s: Stage, id: string, open: () => Promise<T>): Promise<T | null> {
  if (!s.fast) {
    s.chapter(id);
    return open();
  }
  if (FROM && ORDER.indexOf(id) < ORDER.indexOf(FROM)) {
    s.chapter(id);
    return null;
  }
  const tabs = await open();
  s.chapter(id);
  return tabs;
}

/** The tabs the last chapter left open, closed once the next chapter is on screen. */
let behind: Tab[] = [];
function retire(s: Stage, now: Tab[]): void {
  for (const tab of behind) if (!now.includes(tab)) s.close(tab);
  behind = now;
}

/* ---------- ChatGPT ---------- */

const composer: Query = ".ProseMirror";
const strip: Query = "[data-coere-context-strip] .coere-ctx-strip";
const stripList: Query = "#coere-ctx-list";
const stripText = (tab: Tab): string => deep(tab.doc, "[data-coere-context-strip] .coere-ctx-text")?.textContent ?? "";
const sentCount = (tab: Tab): number => ((tab.win as unknown as { __coereFakeSentText?: string[] }).__coereFakeSentText ?? []).length;
const replied = (tab: Tab): boolean => tab.doc.documentElement.hasAttribute("data-fake-replied");

/**
 * Opens a replica ChatGPT. A browser runs the page's microtasks between
 * the listeners of a real key, so ProseMirror's DOM observer takes in the
 * block Coere's send hook just put in before the site's own Enter reads
 * the box. The scripted hand's keys run every listener in one go, so after
 * Coere's listener the editor is told to read the box now, as the
 * observer would have (demos/films/smart-context).
 */
async function openChat(s: Stage, name: string, page: string, replies: readonly string[]): Promise<Tab> {
  const tab = await s.open(name, page, { host: "chatgpt.com", person: OLIVIA, replies });
  tab.win.addEventListener("keydown", (e) => e.key === "Enter" && tab.doc.dispatchEvent(new Event("selectionchange")), true);
  await s.waitFor(tab, composer);
  // Coere finishes starting on the page (its scan, its prefs) before a draft can get context.
  await new Promise((r) => setTimeout(r, 1500));
  return tab;
}

/** Types as a person does; skipping ahead, the text goes in whole with its last letter as a key, since Coere reads a box after a key that types. */
async function typeText(s: Stage, tab: Tab, words: string, delay: number): Promise<void> {
  if (!s.fast) return s.type(tab, words, delay);
  await s.type(tab, words.slice(0, -1), delay);
  key(tab.doc, words.slice(-1));
}

/** Empties the box after a send, as the site does; the stand in leaves it as it was. */
async function emptyBox(s: Stage, site: Tab): Promise<void> {
  (site.doc.querySelector(".ProseMirror") as HTMLElement | null)?.focus();
  site.doc.execCommand("selectAll");
  await s.press(site, "Backspace", 60);
  (site.doc.querySelector(".ProseMirror") as HTMLElement | null)?.blur();
}

/** One Enter: the context goes in front of the draft and the message is sent; then the site answers. */
async function send(s: Stage, site: Tab): Promise<void> {
  const sent = sentCount(site);
  (site.doc.querySelector(".ProseMirror") as HTMLElement | null)?.focus();
  await s.press(site, "End");
  await s.press(site, "Enter");
  await until(() => sentCount(site) > sent, 30_000);
  await emptyBox(s, site);
  site.doc.querySelectorAll(".fake-file-chip").forEach((chip) => chip.remove());
  await s.rest();
}

/** Scrolls the page's own scrolling box to its end, as ChatGPT follows a reply in. */
function follow(tab: Tab): () => void {
  const t = setInterval(() => {
    const box = [...tab.doc.querySelectorAll<HTMLElement>("main, main *")].find((el) => /(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight);
    if (box) box.scrollTop = box.scrollHeight;
  }, 120);
  return () => clearInterval(t);
}

/* ---------- 1. context ---------- */

async function context(s: Stage): Promise<void> {
  const site = await begin(s, "context", () => openChat(s, "connect", "sites/chatgpt.html", [ANSWER]));
  if (!site) return;
  await s.film(site);
  retire(s, [site]);
  s.say("In a new ChatGPT chat, Olivia asks for help with the Green Valley holiday promotion.");
  await s.click(site, composer, { after: 250 });
  await typeText(s, site, DRAFT, 52);
  await until(() => /Green Valley/.test(stripText(site)), 10_000);
  await s.rest();
  s.say("The line above the box says what goes: her Green Valley reset chat, its shelf and its shoppers.");
  await s.wait(800);
  await s.glide(site, strip);
  await s.wait(1100);
  await s.click(site, role("button", "Show the memories that go in", { exact: true }), { after: 300 });
  await s.waitFor(site, stripList);
  await s.rest();
  s.say("The list shows it all: the chat, About me, Green Valley's shelf and promotions and its shoppers.");
  await s.wait(4200);
  const hide = role("button", "Hide the list", { exact: true });
  if (s.has(site, hide)) await s.click(site, hide, { after: 300 });
  s.say("One Enter puts it in front of her draft and sends.");
  const stop = follow(site);
  await send(s, site);
  await until(() => replied(site), 30_000);
  s.say("ChatGPT answers with a plan built on what worked at Green Valley before.");
  await s.wait(5200);
  stop();
}

/* ---------- 2. graph ---------- */

const MEMORY_PAGE = `${LIB}console-v2-solution.html?tab=memory`;
const searchBox = role("combobox", "Search memory and chats", { exact: true });

/** A button inside a group of that name that also holds a button named `has`: the scope chips, not the graph's own chips. */
const groupButton = (group: string, has: string, name: string): Query => (doc) => {
  const g = deepAll(doc, `[role="group"][aria-label="${group}"]`).filter(shown).find((x) => deepAll(x, "button").some((b) => nameOf(b) === has));
  return g ? deepAll(g, "button").find((b) => nameOf(b) === name && shown(b)) : null;
};

/** A thing's side sheet, by its name. */
const sideSheet = (name: string) => label(`sheet ${name}`, (doc: Document) => deepAll(doc, 'aside, [role="complementary"]').find((el) => shown(el) && nameOf(el) === name));

/** The first row of the search results that reads exactly `name`. */
const searchHit = (name: string): Query =>
  label(`search result ${name}`, (doc) => {
    const list = resolve(doc, role("listbox", "Search results"));
    return list ? deepAll(list, "*").find((el) => shown(el) && el.children.length === 0 && (el.textContent ?? "").trim() === name) ?? null : null;
  });

/** The dashboard on the Memory page, drawn and its graph settled, off screen until filmed. */
async function memoryPage(s: Stage, name: string): Promise<Tab> {
  const page = await s.open(name, MEMORY_PAGE);
  await s.waitFor(page, searchBox);
  await new Promise((r) => setTimeout(r, 2500));
  return page;
}

/** Scrolls a side sheet's body by `dy`, eased, as a trackpad under the pointer does. */
async function scrollSheet(s: Stage, page: Tab, sheet: Query, dy: number, ms = 1400): Promise<void> {
  const el = resolve(page.doc, sheet);
  const box = el ? [el, ...el.querySelectorAll<HTMLElement>("*")].find((x) => /(auto|scroll)/.test(getComputedStyle(x).overflowY) && x.scrollHeight > x.clientHeight) : null;
  if (!box) return;
  if (s.fast) {
    box.scrollTop += dy;
    return;
  }
  const from = box.scrollTop;
  const start = performance.now();
  for (;;) {
    const t = Math.min(1, (performance.now() - start) / ms);
    box.scrollTop = from + dy * (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    if (t >= 1) break;
    await new Promise((r) => requestAnimationFrame(r));
  }
}

async function graph(s: Stage): Promise<void> {
  const page = await begin(s, "graph", () => memoryPage(s, "memory"));
  if (!page) return;
  // The scope chosen last time is kept; the film starts on All, as a person coming back would see it after choosing All.
  (resolve(page.doc, groupButton("Show", "Clients", "All")) as HTMLElement | null)?.click();
  await new Promise((r) => setTimeout(r, 600));
  await s.film(page);
  retire(s, [page]);
  s.say("Fieldhouse Pantry's memory: the company above Olivia, its grocery partners below, how she writes plans to one side.");
  await s.wait(3600);
  s.say("Clients holds a folder for each partner, with its buyers and its promotions.");
  await s.click(page, groupButton("Show", "Clients", "Clients"), { after: 300 });
  await s.rest();
  await s.wait(3000);
  s.say(`She opens ${CLIENT}.`);
  await s.click(page, searchBox, { after: 150 });
  await s.type(page, CLIENT, 60);
  await s.waitFor(page, searchHit(CLIENT));
  await s.wait(500);
  await s.click(page, searchHit(CLIENT), { after: 300 });
  const sheet = sideSheet(CLIENT);
  await s.waitFor(page, sheet);
  await s.rest();
  s.say("Its sheet keeps the buyers, the holiday promotion and every promise with its date.");
  await s.wait(3800);
  await s.moveTo({ x: 1200, y: 600 });
  s.say("Further down: the planning call, what Green Valley asked for, the ad deadlines and its deductions.");
  await scrollSheet(s, page, sheet, 420);
  await s.wait(2600);
  await scrollSheet(s, page, sheet, 420);
  await s.wait(2600);
  await scrollSheet(s, page, sheet, 480);
  await s.wait(3000);
  await s.rest();
}

/* ---------- 3. confidential ---------- */

const coriScope = '[data-testid="coere-cori"], .cx-cori-page';
const coriSeat = label("Ask Cori", (doc: Document) => doc.querySelector<HTMLElement>(".cx-cori-seat"));
const coriBox = label("Cori's box", (doc: Document) => doc.querySelector<HTMLElement>(`:is(${coriScope}) textarea`));
const coriLast = (doc: Document) => [...doc.querySelectorAll(`:is(${coriScope}) :is([data-turn="answer"], [data-turn="said"])`)].at(-1) ?? null;

/** What ChatGPT drafts for Rosa, from the Green Valley lines that go with the send. */
const REPLY = [
  "Here is a note you can send.",
  "",
  "Hi Rosa,",
  "",
  "I am writing to confirm buy two get one on our oat bars for your holiday ad, which runs from November 20. It did better than 20 percent off in your stores last year, so we would like to run it again.",
  "",
  "As you asked, maple will lead every holiday display. You will have the ad copy and images by November 5.",
  "",
  "Best regards,",
  "Olivia",
].join("\n");

async function confidential(s: Stage, mem: Mem): Promise<void> {
  const tabs = await begin(s, "confidential", () =>
    Promise.all([openChat(s, "chat-teams", "sites/chatgpt-teams.html", [REPLY]), memoryPage(s, "cori")]),
  );
  if (!tabs) return;
  const [site, page] = tabs;
  const draft = field.clientLine.draft as string;
  await s.film(site);
  retire(s, [site, page]);
  s.say("On ChatGPT, Olivia starts a note to Rosa, the buyer at Green Valley Market.");
  await s.click(site, composer, { after: 250 });
  await typeText(s, site, draft, 48);
  await until(() => stripText(site).includes(`on the client ${CLIENT}`), 15_000);
  await s.rest();
  s.say(`The line says Coere will add context on the client ${CLIENT}, and on no other.`);
  await s.wait(800);
  await s.glide(site, strip);
  await s.wait(1100);
  s.say("She sends it. Only Green Valley's plans and promises go with it.");
  const stop = follow(site);
  await send(s, site);
  await until(() => replied(site), 30_000);
  await s.wait(2600);
  stop();

  await s.film(page);
  s.say(`On the dashboard she asks Cori what the team promised ${CLIENT}.`);
  await s.click(page, coriSeat, { after: 400 });
  await s.click(page, coriBox, { after: 150 });
  await s.type(page, field.cori.question as string, 50);
  await s.press(page, "Enter");
  await s.waitFor(page, label("Cori's answer", (doc: Document) => {
    const last = coriLast(doc);
    return last && /promise/i.test(last.textContent ?? "") && !doc.querySelector(".cr-typed") ? last : null;
  }), 30_000);
  await s.rest();
  s.say("Cori answers from Green Valley's memory: each promise, its date and the chat it came from.");
  await s.wait(4800);
  void mem;
}

/* ---------- 4. app ---------- */

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

/** Prints what the command printed, a line at a time, as a program writes it. */
async function print(s: Stage, shell: Tab, out: string, lineMs = 60): Promise<void> {
  for (const line of out.replace(/\s+$/, "").split("\n")) {
    term(shell).line(line);
    await s.wait(lineMs);
  }
  term(shell).done();
}

/** What an app was sent, on its row of the Apps page. */
const sentList = ".cx-apps-sent";

/** The Apps section of the v3 dashboard, with the server's address hidden, as demos/films/v3 opens it. */
async function openApps(s: Stage, name = "apps", ready: Query = role("heading", `Allow ${APP} to access Coere memory?`)): Promise<Tab> {
  const page = await s.open(name, `${LIB}console-v3.html?tab=apps`);
  const style = page.doc.createElement("style");
  style.textContent = ".cx-apps-url{visibility:hidden}";
  page.doc.head.append(style);
  const el = await s.waitFor(page, ready, 20_000);
  el.scrollIntoView({ block: "nearest" });
  return page;
}

async function app(s: Stage): Promise<void> {
  const tabs = await begin(s, "app", () => Promise.all([s.open("shell", `terminal.html?title=${APP}`), openApps(s)]));
  if (!tabs) return;
  const [shell, apps] = tabs;
  const lines = terminalLines();
  await s.film(shell);
  retire(s, [shell, apps]);
  s.say("Olivia's promotion planner asks Coere for access from its own code.");
  await run(s, shell, lines.connect);
  await s.wait(600);
  term(shell).line(lines.asked);
  await s.wait(2000);

  await s.film(apps);
  s.say("On the Apps page she checks the code. It may only read memory, and only Clients.");
  await s.wait(2600);
  const card = ".cx-apps-allow";
  await s.click(apps, role("button", /^Allow$/, { within: card, exact: true }), { after: 400 });
  await until(() => !s.has(apps, card), 20_000);
  await s.rest();
  s.say("Allowed. She can revoke it here at any time.");
  await s.wait(2400);

  await s.film(shell);
  term(shell).line(lines.allowed);
  term(shell).done();
  await s.wait(900);
  s.say("Before it suggests a plan, the planner asks what worked at Green Valley.");
  await run(s, shell, lines.context);
  await s.wait(700);
  await print(s, shell, lines.out, 60);
  access?.use();
  // The Apps page as it reads now, with the planner's call on record, opened behind the terminal.
  const record = openApps(s, "apps-record", sentList);
  s.say("Coere sends last year's winning offer, the ad dates and the shoppers' habits, and says why each part goes.");
  await s.wait(5200);

  const page = await record;
  behind.push(page);
  await s.film(page);
  s.say("Every send is on record. The Apps page keeps what the planner was sent.");
  await s.wait(1600);
  await s.click(page, `${sentList} summary`, { after: 400 });
  await s.waitFor(page, ".cx-apps-chat .cx-apps-path-btn", 20_000);
  await s.click(page, ".cx-apps-chat .cx-apps-path-btn", { after: 400 });
  await s.rest();
  await s.wait(4200);
}

/* ---------- the film ---------- */

let mem: Mem | null = null;
let access: Access | null = null;

/**
 * A tab the film closed leaves its listeners in the World, and calling
 * into a removed frame throws; each listener is guarded, so a gone tab
 * only goes quiet (demos/films/teams).
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
  answerTeams(world, mem);
  answerCori(world);
  access = new Access(world, (id) => nodeDetail(mem!, id));
  access.install();
  // The voice channel's calls carry no type: no voice models here.
  world.on("", () => null);
  // The strip's calls: Connect's answers on the Connect tab, the partner's card on the Teams tab.
  const m = mem;
  const teams: Record<string, (msg: { args?: unknown }) => unknown> = {
    "memory.contextFor": (msg) => contextFor(m, String((msg.args as { tail?: string })?.tail ?? "")),
    "memory.contextSent": () => null,
  };
  for (const method of new Set([...Object.keys(CONNECT), ...Object.keys(teams)]))
    world.engine(method, (msg, tab) => (tab === "connect" ? CONNECT[method] : teams[method])?.(msg) ?? null);
  world
    .engine("memory.skipChats", () => [])
    .engine("capture.tail", () => null)
    // Opening ChatGPT saves its chats by themselves; the library has them already.
    .engine("upsertConversation", (msg) => {
      const conv = (msg.args as { conv?: { platformConvId?: string; platform?: string } })?.conv;
      return { id: `${conv?.platform ?? "chatgpt"}:${conv?.platformConvId ?? "new"}`, hash: "0".repeat(16), chunks: 0, bytes: 0, unchanged: true };
    });
}

async function film(s: Stage): Promise<void> {
  behind = [];
  if (!s.fast) await s.card("Coere for consumer brands", "Know every retail partner and plan from what worked.", 2800);
  await context(s);
  await graph(s);
  await confidential(s, mem!);
  await app(s);
  if (s.world.unanswered.length) console.warn("industry-consumer unanswered:", JSON.stringify([...new Set(s.world.unanswered.map((u) => `${u.tab} ${u.type}`))]));
}

play({ title: "Coere for consumer brands", chapters: CHAPTERS }, film, setup);
