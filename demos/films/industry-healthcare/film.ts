import { field } from "../../../scripts/industries/fields/healthcare.mjs";
import type { DemoHost } from "../../stage/host";
import { key } from "../../stage/input";
import { play } from "../../stage/player";
import { deep, deepAll, nameOf, resolve, role, shown, text, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";
import { answerMemory } from "./answers";
import { Access, CODE } from "./access";
import { answerCori } from "./cori";
import { buildMemory, FILM_NOW, type Mem } from "./memory";
import { answerStrip, CONTEXT_REPLY } from "./strip";
import { contextFor } from "./views";

/**
 * Coere for clinical research: the healthcare page's four stories, played
 * live on Coere's own code with the field's people and sites
 * (scripts/industries/fields/healthcare.mjs). Amara Osei coordinates
 * trials at Lakeshore Clinical Research, a week before the monitoring
 * visit at Dunmore Cardiology.
 *
 *   context       Coere Connect on ChatGPT: her draft for the visit gets
 *                 her prep chat, who she is, and Dunmore's enrollment and
 *                 open queries, in front of it with one Enter.
 *   graph         Coere for Teams: the company's memory, its partner
 *                 sites, and Dunmore's sheet.
 *   confidential  Coere for Teams on ChatGPT: a draft to Dunmore gets
 *                 Dunmore's context only, and Cori lists what Dunmore owes.
 *   app           Coere Forge: the team's site monitoring app asks what to
 *                 check, with its own token, in a terminal.
 *
 * Patterns from the smart-context, teams and v3 films. Operations and
 * research only: no participant's details are in memory.
 */

const CHAPTERS = [
  { id: "context", title: "Site visit prep" },
  { id: "graph", title: "Every site and study" },
  { id: "confidential", title: "One site per message" },
  { id: "app", title: "Monitoring app" },
];

const AMARA = { name: field.person.name, first: field.person.name.split(" ")[0]!, initials: field.person.initials };
const PAGE = "console.html?tab=memory";
const FROM = new URLSearchParams(location.search).get("from");
/** The pages a chapter opened, closed when the next chapter is on screen. */
const behind: Tab[] = [];

/** A query with a name, so a wait that finds nothing says what it looked for. */
function label<Q extends (doc: Document) => Element | null | undefined>(text: string, q: Q): Q {
  q.toString = () => text;
  return q;
}

async function until(test: () => boolean, ms = 20_000): Promise<boolean> {
  const end = Date.now() + ms;
  while (!test()) {
    if (Date.now() > end) return false;
    await new Promise((r) => setTimeout(r, 50));
  }
  return true;
}

/**
 * Starts a chapter on a page made ready for it. Played through, the
 * chapter starts before its page opens, so a run asked to end there ends
 * on the shot before. Skipped to, the page is opened and filmed unseen
 * and the chapter starts on it, so a short showcase opens on its first
 * frame. A chapter skipped past is left out: no later chapter needs it.
 */
async function begin(s: Stage, id: string, prepare: () => Promise<Tab>): Promise<Tab | null> {
  if (s.fast && FROM !== null && FROM !== id) return null;
  const through = !s.fast;
  if (through) s.chapter(id);
  const tab = await prepare();
  await s.film(tab);
  // The last chapter's pages are done with once this one is on screen; closed, they stop drawing out of sight.
  for (const old of behind.splice(0)) if (old !== tab) s.close(old);
  if (!through) {
    s.chapter(id);
    // A full film jumped to a later chapter from its bar skips this one too.
    if (s.fast) {
      behind.push(tab);
      return null;
    }
  }
  return tab;
}

// ---------------------------------------------------------------- chat sites

const composer: Query = label("ChatGPT's box", (doc: Document) => doc.querySelector<HTMLElement>(".ProseMirror"));
const strip: Query = label("the context strip", (doc: Document) => deep(doc, "[data-coere-context-strip] .coere-ctx-strip"));
const stripText = (tab: Tab): string => deep(tab.doc, "[data-coere-context-strip] .coere-ctx-text")?.textContent ?? "";
const stripList: Query = "#coere-ctx-list";

/** Opens a replica ChatGPT and waits for Coere to start on it. */
async function openSite(s: Stage, name: string, page: string, replies: readonly string[] = []): Promise<Tab> {
  const tab = await s.open(name, page, { host: "chatgpt.com", person: AMARA, replies });
  await s.waitFor(tab, composer);
  // Coere finishes starting on the page (its scan, its prefs) before a draft can get context.
  await new Promise((r) => setTimeout(r, 1500));
  return tab;
}

/** Types as a person does; skipping ahead, the last letter still goes as a key, since Coere reads a box on a key that types. */
async function typeText(s: Stage, tab: Tab, words: string, delay: number): Promise<void> {
  await s.type(tab, words.slice(0, -1), delay);
  key(tab.doc, words.slice(-1));
  await s.wait(delay);
}

const sentCount = (tab: Tab): number => ((tab.win as unknown as { __coereFakeSentText?: string[] }).__coereFakeSentText ?? []).length;

/**
 * One Enter in the chat box, as a person's key reaches the page. Coere
 * puts its block in front of the draft as the key goes down, and a
 * browser runs the editor's DOM observer before the editor's own key
 * handler; a key a script dispatches runs every listener in one go, so
 * the editor is told to read its box right after Coere's turn
 * (content/context-import/send-hook.ts), as the smart-context film does.
 */
async function pressSend(s: Stage, tab: Tab): Promise<void> {
  const sent = sentCount(tab);
  const settle = (e: KeyboardEvent) => e.key === "Enter" && tab.doc.dispatchEvent(new Event("selectionchange"));
  tab.win.addEventListener("keydown", settle, true);
  try {
    (tab.doc.querySelector(".ProseMirror") as HTMLElement | null)?.focus();
    await s.press(tab, "End");
    await s.press(tab, "Enter", 300);
  } finally {
    tab.win.removeEventListener("keydown", settle, true);
  }
  await until(() => sentCount(tab) > sent, 30_000);
  // ChatGPT empties its box once a message is sent; the replica keeps it, so it is emptied here as the site would.
  const box = tab.doc.querySelector<HTMLElement>(".ProseMirror");
  if (box) {
    box.focus();
    tab.doc.execCommand("selectAll");
    tab.doc.execCommand("delete");
    box.blur();
  }
  // The chat that went as a file beside the box goes with the message too.
  tab.doc.querySelectorAll(".fake-file-chip").forEach((chip) => chip.remove());
}

/** Coere Connect: the visit draft, the line saying what goes, the list, and one Enter. */
async function context(s: Stage): Promise<void> {
  const c = field.context;
  const site = await begin(s, "context", async () => {
    if (s.fast) return openSite(s, "connect", "sites/chatgpt.html", [CONTEXT_REPLY]);
    // The opening card stands while the page opens behind it.
    const [tab] = await Promise.all([openSite(s, "connect", "sites/chatgpt.html", [CONTEXT_REPLY]), s.card("Coere for clinical research", "Every site, study and promise, in whichever AI you open.", 3000)]);
    return tab;
  });
  if (!site) return;
  behind.push(site);
  s.say(`In a fresh ChatGPT chat, ${AMARA.first} asks for help with next week's monitoring visit.`);
  await s.click(site, composer, { after: 300 });
  await typeText(s, site, c.draft, 62);
  await s.rest();
  await until(() => /your chat/.test(stripText(site)), 10_000);
  s.say("The blue line says what goes: her prep chat for the visit, and her context on Dunmore's study and open queries.");
  await s.glide(site, strip);
  await s.wait(2600);
  await s.click(site, role("button", "Show the memories that go in", { exact: true }), { after: 400 });
  await s.waitFor(site, stripList);
  await s.rest();
  s.say("The list shows it all: the chat, who she is, the site's enrollment and its open queries.");
  await s.wait(4600);
  const hide = role("button", "Hide the list", { exact: true });
  if (s.has(site, hide)) await s.click(site, hide, { after: 300 });
  s.say("One Enter puts it in front of her draft and sends. ChatGPT answers from where the site stands.");
  await pressSend(s, site);
  await s.rest();
  await until(() => site.doc.documentElement.hasAttribute("data-fake-replied"), 30_000);
  await s.wait(4200);
}

// ---------------------------------------------------------------- the Teams dashboard

const searchBox: Query = role("combobox", "Search memory and chats", { exact: true });

/** A button in the group of that name that also holds a button named `has`: the scope chips, not the graph's own. */
const groupButton = (group: string, has: string, name: string): Query =>
  label(`${name} in ${group}`, (doc: Document) => {
    const groups = deepAll(doc, `[role="group"][aria-label="${group}"]`).filter(shown);
    const g = groups.find((x) => deepAll(x, "button").some((b) => nameOf(b) === has));
    return g ? deepAll(g, "button").find((b) => nameOf(b) === name && shown(b)) : null;
  });
const scope = (name: string) => groupButton("Show", "Clients", name);

/** A thing's side sheet, by its name. */
const sideSheet = (name: string) => label(`sheet ${name}`, (doc: Document) => deepAll(doc, 'aside, [role="complementary"]').find((el) => shown(el) && nameOf(el) === name));

/** The first row of the search results that reads exactly `name`. */
const searchHit = (name: string): Query =>
  label(`search result ${name}`, (doc: Document) => {
    const list = resolve(doc, role("listbox", "Search results"));
    if (!list) return null;
    return deepAll(list, "*").find((el) => shown(el) && el.children.length === 0 && (el.textContent ?? "").trim() === name) ?? null;
  });

const inSheet = (name: string, kind: string, words: string) =>
  label(`${kind} ${words} in ${name}`, (doc: Document) => {
    const sheet = sideSheet(name)(doc);
    return sheet ? resolve(doc, role(kind, words, { exact: true, within: () => sheet })) : null;
  });

/** The dashboard on the Memory page, drawn and settled, off screen until filmed. */
async function memoryPage(s: Stage, name: string): Promise<Tab> {
  const page = await s.open(name, PAGE);
  await s.waitFor(page, searchBox);
  // The graph lays itself out over a second or two; the film waits for it to settle.
  await new Promise((r) => setTimeout(r, 2500));
  return page;
}

/** Coere for Teams: the company's memory, then Dunmore's sheet. */
async function graph(s: Stage): Promise<void> {
  const page = await begin(s, "graph", () => memoryPage(s, "memory"));
  if (!page) return;
  behind.push(page);
  const name = field.client.name;
  s.say("Lakeshore's memory: the company's procedures, its partner sites, and how Amara writes.");
  await s.wait(3000);
  s.say("Clients holds a folder for each site, with its investigators, studies and promises.");
  await s.click(page, scope("Clients"), { after: 300 });
  await s.rest();
  await s.wait(3200);
  s.say(`Opened, ${name} shows what sits in each part of its sheet.`);
  await s.click(page, searchBox, { after: 150 });
  await s.type(page, name, 55);
  await s.waitFor(page, searchHit(name));
  await s.wait(400);
  await s.click(page, searchHit(name), { after: 300 });
  await s.waitFor(page, inSheet(name, "heading", "Promises"));
  await s.rest();
  await s.wait(3000);
  // Down the sheet: meetings, requests, deadlines and billing.
  s.say("Meetings, requests, deadlines and billing follow, each with the chat it came from.");
  const body = label("the sheet's list", (doc: Document) => {
    const sheet = sideSheet(name)(doc);
    return sheet ? [...sheet.querySelectorAll<HTMLElement>("*")].find((el) => el.scrollHeight > el.clientHeight + 40 && /(auto|scroll)/.test(el.ownerDocument.defaultView!.getComputedStyle(el).overflowY)) ?? null : null;
  });
  if (resolve(page.doc, body)) {
    await s.glide(page, body);
    for (const hold of [2200, 2200, 2200, 3000]) {
      await s.wheel(page, 440, 18);
      await s.wait(hold);
    }
  } else await s.wait(4000);
  await s.rest();
}

// ---------------------------------------------------------------- one site per message

const coriSeat = label("Ask Cori", (doc: Document) => doc.querySelector<HTMLElement>(".cx-cori-seat"));
const coriScope = '[data-testid="coere-cori"], .cx-cori-page';
const coriBox = label("Cori's box", (doc: Document) => doc.querySelector<HTMLElement>(`:is(${coriScope}) textarea`));
const coriLast = (doc: Document) => [...doc.querySelectorAll(`:is(${coriScope}) :is([data-turn="answer"], [data-turn="said"])`)].at(-1) ?? null;

async function confidential(s: Stage): Promise<void> {
  const name = field.client.name;
  let cori: Tab | null = null;
  const site = await begin(s, "confidential", async () => {
    const [tab, dash] = await Promise.all([openSite(s, "team", "sites/chatgpt-team.html"), memoryPage(s, "cori")]);
    cori = dash;
    return tab;
  });
  if (!site || !cori) return;
  const dash: Tab = cori;
  behind.push(site, dash);
  s.say(`On the team's ChatGPT, ${AMARA.first} starts the visit agenda email to Joel.`);
  await s.click(site, composer, { after: 300 });
  await typeText(s, site, field.clientLine.draft, 58);
  await s.waitFor(site, label("the strip naming the site", (doc: Document) => {
    const el = resolve(doc, strip);
    return el && (el.textContent ?? "").includes(`on the client ${name}`) ? el : null;
  }), 30_000);
  await s.rest();
  s.say(`The blue line names one site. Only ${name}'s context goes with this email.`);
  await s.glide(site, strip);
  await s.wait(2400);
  const expand = role("button", "Show the memories that go in", { exact: true });
  if (s.has(site, expand)) {
    await s.click(site, expand, { after: 400 });
    await s.rest();
    await s.wait(3600);
  } else await s.wait(2000);

  await s.film(dash);
  s.say(`Then she asks Cori what ${name} still owes the team.`);
  await s.click(dash, coriSeat, { after: 500 });
  await s.click(dash, coriBox, { after: 150 });
  await s.type(dash, field.cori.question, 55);
  await s.press(dash, "Enter");
  await s.waitFor(dash, label("Cori's answer", (doc: Document) => {
    const last = coriLast(doc);
    return last && /promise/i.test(last.textContent ?? "") && !doc.querySelector(".cr-typed") ? last : null;
  }), 30_000);
  await s.rest();
  s.say("Cori answers from Dunmore's memory alone, each promise with its date and the AI it came from.");
  await s.wait(5600);
}

// ---------------------------------------------------------------- the monitoring app

type Term = { prompt(): HTMLElement; ran(): void; line(text: string): void; done(): void; clear(): void };
const term = (tab: Tab) => (tab.win as unknown as { __term: Term }).__term;

/** Types a command after the prompt, key by key, and presses Enter. */
async function run(s: Stage, shell: Tab, command: string): Promise<void> {
  term(shell).prompt();
  await s.type(shell, command, 40);
  await s.wait(300);
  await s.press(shell, "Enter", 0);
  term(shell).ran();
}

/** Prints what the command printed, a line at a time, as a program writes it. */
async function print(s: Stage, shell: Tab, out: string, lineMs: number): Promise<void> {
  for (const line of out.replace(/\s+$/, "").split("\n")) {
    term(shell).line(line);
    await s.wait(lineMs);
  }
  term(shell).done();
}

/** What the SDK's context.py prints for the question (sdk/python/examples/context.py): the block, then where it came from and why. */
function contextOut(): string {
  const a = field.app;
  const block = ["[Context from Coere, my saved memory. Use it if it helps.]", ...a.sections.flatMap((x) => [x.path, ...x.facts.map((f) => `- ${f}`)]), "[End of context from Coere]"];
  return [...block, "", `From ${a.from} chats`, ...a.reasons.map(([path, why]) => `  ${path}: ${why}`)].join("\n");
}

/** The Apps section of the dashboard (Coere Forge), with the server's address hidden: it names a computer and a port. */
async function openApps(s: Stage): Promise<Tab> {
  const page = await s.open("apps", "apps.html?tab=apps");
  const style = page.doc.createElement("style");
  style.textContent = ".cx-apps-url{visibility:hidden}";
  page.doc.head.append(style);
  await s.waitFor(page, ".cx-apps");
  return page;
}

async function app(s: Stage): Promise<void> {
  const a = field.app;
  const shell = await begin(s, "app", () => s.open("shell", `terminal.html?title=${a.name}`));
  if (!shell) return;
  behind.push(shell);
  s.say("The team's site monitoring app asks Coere for access from its own code.");
  await run(s, shell, `uv run ${a.name} --connect`);
  await s.wait(700);
  access!.go("asked");
  term(shell).line(`Open Apps in Coere and allow ${a.name}. Code ${CODE}.`);
  // The Apps page opens while the line is read.
  const [apps] = await Promise.all([openApps(s), s.wait(2400)]);
  behind.push(apps);
  const card = ".cx-apps-allow";
  await s.waitFor(apps, role("heading", `Allow ${a.name} to access Coere memory?`), 20_000);
  await s.film(apps);
  s.say("On the Apps page, Amara sees what it asks: read memory, in Clients only. Sensitive memories stay off.");
  await s.wait(1200);
  await s.glide(apps, ".cx-apps-allow-sections");
  await s.wait(1800);
  await s.glide(apps, text("Let apps read sensitive memories", "*", { exact: true }));
  await s.wait(1800);
  await s.click(apps, role("button", /^Allow$/, { within: card, exact: true }), { after: 400 });
  await until(() => !s.has(apps, card), 20_000);
  await s.rest();
  s.say("It gets a token for that, and nothing more. Apps never write memory.");
  await s.wait(2400);
  await s.film(shell);
  term(shell).line(`Allowed. The token is saved in ~/${a.name}/.env.`);
  term(shell).done();
  await s.wait(1200);
  s.say("With its token, it asks what to check before the Dunmore visit.");
  await run(s, shell, `uv run context.py "${a.ask}"`);
  await s.wait(900);
  await print(s, shell, contextOut(), 220);
  s.say("Coere answers from the Clients section alone, with where each line came from.");
  await s.wait(5200);
}

// ---------------------------------------------------------------- the film

let mem: Mem | null = null;
let access: Access | null = null;

async function film(s: Stage): Promise<void> {
  // A run that starts over has a fresh stage; the last run's pages went with the old one.
  behind.length = 0;
  await context(s);
  await graph(s);
  await confidential(s);
  await app(s);
  if (s.world.unanswered.length) console.warn("Unanswered:", [...new Set(s.world.unanswered.map((u) => `${u.tab}: ${u.type}`))].join(" | "));
}

/** The Cori question names Dunmore without a rule's words, so the route reads it, as Jev and Haiku would (solution/cori/read-org.ts). */
function route(m: Mem, line: string): unknown {
  const text = line.toLowerCase();
  const client = m.clients.find((c) => [c.name, ...c.aliases].some((n) => text.includes(n.toLowerCase())));
  if (client && /\b(owe|owes|promised?|promises)\b/.test(text)) {
    const said = [client.name, ...client.aliases].find((n) => text.includes(n.toLowerCase()))!;
    return { understood: true, tool: "org_command", slots: { intent: "client_promises", client: said }, nodes: [], layer: "jev" };
  }
  return { understood: false, layer: null };
}

function setup(world: World): void {
  // The film's clock: every tab of its own reads it (clock.ts), and so do the answers here.
  const host = (window as unknown as { __demo: DemoHost }).__demo;
  const clock = { at: FILM_NOW, from: Date.now() };
  host.extra.clock = clock;
  const now = () => clock.at + (Date.now() - clock.from);
  mem = buildMemory(FILM_NOW);
  const m = mem;
  answerMemory(world, m, now);
  answerCori(world, now, ["team"]);
  answerStrip(world, "connect", (method, msg) => (method === "memory.contextFor" ? contextFor(m, String((msg as { args?: { tail?: string } }).args?.tail ?? "")) : null));
  world.engine("memory.route", (msg) => route(m, String((msg.args as { line?: string } | undefined)?.line ?? "")));
  world.engine("capture.tail", () => null);
  access = new Access(world, now);
  access.install();
}

play({ title: "Coere for clinical research", chapters: CHAPTERS }, film, setup);
