import { fakeMemoryDeps } from "@v2/apps/extension/src/console/testing/fake-memory-deps";
import { play } from "../../stage/player";
import { deepAll, nameOf, role, shown, text, within, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";
import data from "./data.json";
import { MAYA, Worker, type Dates } from "./ext";
import { Memory } from "./memory";

/**
 * Coere Extraction, from coere-v2's tools/demo-video/memory.demo.ts (the
 * `extraction` director's shots): Maya picks her AIs in onboarding and
 * Extract all saves every chat, a row for each AI; later, new chats are
 * saved by themselves when she opens an AI, and Home leads with them; a
 * chat changes and memory follows it; and the Library holds them all.
 * Everything on screen is Coere's own code: the onboarding page, the
 * content script on the replica sites reading each site's data API, and
 * the dashboard. Extract all's batch is the service worker's own logic,
 * run in the World (ext.ts), and memory is Maya's (memory.ts).
 */

const LIB = "/preview/live/lib/";
const BIG_THREE = ["chatgpt", "claude", "gemini"] as const;
const HOSTS = { chatgpt: "chatgpt.com", claude: "claude.ai", gemini: "gemini.google.com" } as const;

let worker: Worker;

/** Every chat's dates, moved so the newest land as near today as they were when the film was made. */
function dates(): Dates {
  const shift = Date.now() - data.now;
  const move = (c: { createdAt: string; updatedAt: string }) => ({ createdAt: new Date(Date.parse(c.createdAt) + shift).toISOString(), updatedAt: new Date(Date.parse(c.updatedAt) + shift).toISOString() });
  const byId = new Map([...data.install, ...data.later].map((c) => [c.id, move(c)]));
  const changed = move(data.changed);
  return (conv) => (conv.platformConvId === data.changed.id && conv.messages.length >= data.changed.messages.length ? changed : byId.get(conv.platformConvId));
}

/** How many chats each AI holds on install day: 148, 102 and 74 (gen-data.mts). */
const COUNT = data.install.reduce<Record<string, number>>((n, c) => ((n[c.platform] = (n[c.platform] ?? 0) + 1), n), {});

/** Memory's settings as the build step reads them: every AI Maya chose, read in full. */
const SETTINGS = {
  readFrom: [
    { platform: "chatgpt", on: true, chats: COUNT.chatgpt, projectsOff: [] },
    { platform: "claude", on: true, chats: COUNT.claude, projectsOff: [] },
    { platform: "gemini", on: true, chats: COUNT.gemini, projectsOff: [] },
  ],
  recall: true,
  backfillMode: "direct",
  capUsd: 20,
  timeZone: data.memory.zone,
  copyToFolder: false,
  showTrivia: false,
  extractScope: { v: 1, all: true },
};

/**
 * coere-v2's FakeDataServer, which serves each replica site's data API in
 * the page, writes its list cursors with Node's Buffer, which a page has
 * not, so a site with more chats than one page of its list (100) could not
 * be read past the first page. Each site tab gets the two Buffer calls the
 * cursors make, before its content script starts (stage/tab/site.ts asks
 * the host for its site first).
 */
function cursorsInSites(): void {
  const host = (window as unknown as { __demo?: { site: (tab: string) => unknown; __buffer?: true } }).__demo;
  if (!host || host.__buffer) return;
  host.__buffer = true;
  const site = host.site;
  host.site = (tab: string) => {
    const win = document.querySelector<HTMLIFrameElement>(`iframe[data-tab="${tab}"]`)?.contentWindow as (Window & { Buffer?: unknown }) | null;
    if (win && !win.Buffer) win.Buffer = { from: (text: string, encoding?: string) => cursorBytes(win, text, encoding) };
    return site(tab);
  };
}
function cursorBytes(win: Window, text: string, encoding?: string): { toString: (encoding?: string) => string } {
  if (encoding === "base64url") {
    const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(win.atob(b64 + "===".slice((b64.length + 3) % 4)), (c) => c.charCodeAt(0));
    return { toString: () => new TextDecoder().decode(bytes) };
  }
  const bytes = new TextEncoder().encode(text);
  return { toString: () => win.btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") };
}

function setup(world: World): void {
  cursorsInSites();
  // Memory's quiet methods from the dashboard's own fixture, then Maya's memory over them.
  const fixture = fakeMemoryDeps().deps.api as unknown as Record<string, (a: unknown) => unknown>;
  for (const [method, fn] of Object.entries(fixture)) world.engine(method, (m) => fn(m.args));
  const memory = new Memory(world, () => worker?.stage?.fast ?? false);
  memory.install();
  world.engine("memory.settings", () => SETTINGS);
  world.engine("memory.buildEstimate", () => ({ chats: data.install.length, seconds: Math.round(data.install.length * 8.5), measured: false, progress: null }));
  // Voice mode asks whether its models are on this computer; they are not.
  world.on("", () => null);
  worker = new Worker(world, dates());
  worker.install();
  worker.onSaved = (id, messages) => memory.saved(id, messages);
  worker.latency = { "chatgpt.com": 330, "claude.ai": 470, "gemini.google.com": 560 };
  worker.site = (platform) => ({ name: `bg-${platform}`, src: `sites/${platform}.html`, host: HOSTS[platform] });
}

/** Opens one of the extension's pages, with chrome.tabs answering for the tabs Coere knows. */
async function openExt(s: Stage, name: string, page: string): Promise<Tab> {
  const tab = await s.open(name, `${LIB}${page}`);
  worker.patchTabs(name, tab.win);
  return tab;
}

const aiBox = (id: string) => within(`.cx-ai[data-platform="${id}"]`, 'input[type="checkbox"], [role="checkbox"]');

/** A row of the Memory list at the end of a path, found row by row as the list is flat (tests/e2e/helpers/memory/page.ts). */
const treeRowAt =
  (path: readonly string[]): Query =>
  (doc) => {
    const rows = deepAll(doc, 'li[role="treeitem"]');
    let from = 0;
    let found: Element | null = null;
    path.forEach((label, i) => {
      const at = rows.findIndex((r, n) => n >= from && r.getAttribute("aria-level") === String(i + 1) && nameOf(r.querySelector(".cx-mem-ti-name") ?? r) === label);
      found = at < 0 ? null : rows[at]!;
      from = at + 1;
    });
    return found;
  };

/** The sheet of one thing, by its name. */
const sheet =
  (name: string): Query =>
  (doc) =>
    deepAll(doc, "aside.cx-mem-sheet").find((el) => shown(el) && nameOf(el.querySelector(".coere-sheet-title-text") ?? el) === name);

/** A memory's card in a sheet, by text it holds. */
const factCard =
  (name: string, holds: string, earlier = false): Query =>
  (doc) => {
    const scope = sheet(name)(doc);
    return scope ? deepAll(scope, `article.cx-mem-fact${earlier ? ".is-earlier" : ":not(.is-earlier)"}`).find((el) => shown(el) && (el.textContent ?? "").includes(holds)) : null;
  };

/** A click the page takes without the hand: for what the film set up before it cut to a page. */
async function poke(s: Stage, tab: Tab, query: Query): Promise<void> {
  const el = (await s.waitFor(tab, query)) as HTMLElement;
  el.click();
  await new Promise((r) => setTimeout(r, 120));
}

/** Opens a thing's sheet from the list, row by row, as the film's openPath does before it films the page. */
async function openPath(s: Stage, tab: Tab, path: readonly string[]): Promise<void> {
  for (let i = 0; i < path.length; i++) {
    const row = await s.waitFor(tab, treeRowAt(path.slice(0, i + 1)));
    await poke(s, tab, () => row.querySelector<HTMLElement>(".cx-mem-ti-row"));
    if (i < path.length - 1 && row.getAttribute("aria-expanded") === "false") await poke(s, tab, () => row.querySelector<HTMLElement>(".cx-mem-ti-twisty"));
  }
  await s.waitFor(tab, sheet(path.at(-1)!));
}

/** Waits, at the film's pace, until something the World holds is so. */
async function until(s: Stage, ok: () => boolean, ms = 120_000): Promise<void> {
  const end = Date.now() + ms;
  while (!ok()) {
    if (Date.now() > end) throw new Error("timed out");
    await new Promise((r) => setTimeout(r, 100));
  }
  await s.wait(0);
}

const LAB = ["School", "DATA 100", "Lab 1"];

/** The Memory page in its list, on the lab's sheet. */
async function openMemory(s: Stage): Promise<Tab> {
  try {
    localStorage.setItem("coere.memory.view", "list");
  } catch {
    // The page then opens on the graph, and the list is a click away below.
  }
  const memory = await openExt(s, "memory", "console-v2.html?tab=memory");
  if (!s.has(memory, '[role="tree"]')) await poke(s, memory, role("button", "List", { exact: true }));
  await openPath(s, memory, LAB);
  await s.waitFor(memory, factCard("Lab 1", FROM));
  return memory;
}
const [, FROM, TO] = /from (\w+ \d+) to (\w+ \d+)/.exec(data.movedLine)!;

async function film(s: Stage): Promise<void> {
  worker.stage = s;

  // Choose your AIs.
  s.chapter("choose");
  s.say("Coere saves your chats from ChatGPT, Claude, Gemini and six more AIs.");
  await s.card("Coere Extraction", "Every chat from every AI, saved on your computer.", 2600);
  const onboarding = await openExt(s, "onboarding", "onboarding-v2.html");
  await s.waitFor(onboarding, ".cx-ai");
  await s.film(onboarding);
  s.say("Onboarding asks which AIs Maya uses. She picks ChatGPT, Claude and Gemini.");
  for (const id of BIG_THREE) await s.click(onboarding, aiBox(id), { after: 450 });
  await s.wait(500);
  await s.click(onboarding, ".ob-save", { after: 300 });
  await s.rest();
  await s.waitFor(onboarding, ".ob-rows .ob-row");

  // Extract all: each AI opens in a tab of its own, never filmed, and its row fills as the chats save.
  s.chapter("extract");
  s.say("Extract all opens each AI in the background and saves every chat, with a row for each.");
  await s.wait(5000);
  const done = role("button", "Done", { exact: true });
  await s.waitFor(onboarding, done, 120_000);
  s.say("Every chat is saved, on this computer only.");
  // Later, ChatGPT opens with her new chats; it loads now, unseen, so the cut to it is clean.
  const before = worker.engine.convs.size;
  const later = s.open("chatgpt", "sites/chatgpt-later.html", { host: HOSTS.chatgpt, person: MAYA });
  await s.wait(2600);
  await s.click(onboarding, done, { after: 200 });
  await s.rest();

  // New chats come in. The dashboard's Clear puts the finished run away, as the film's clearDock does.
  s.chapter("new");
  const site = await later;
  await s.film(site);
  await worker.clearBatch();
  const home = openExt(s, "home", "console-v2.html?tab=home");
  s.say("Later, Maya has new chats. When she opens an AI, Coere saves them by itself.");
  await s.glide(site, ".fake-sidebar-scroll");
  await s.wait(3000);
  await s.rest();
  void s.open("gemini", "sites/gemini-later.html", { host: HOSTS.gemini, person: MAYA });
  await until(s, () => worker.engine.convs.size >= before + data.later.length);
  const dashboard = await home;
  await s.waitFor(dashboard, ".sm-recent-title");
  await s.film(dashboard);
  s.say("Home counts what is saved, and Recently saved leads with the newest chats.");
  // The Memory page loads meanwhile, unseen, open on the lab's sheet, as the film opens it before it cuts there.
  const memoryOpen = openMemory(s);
  await s.glide(dashboard, ".sm-recent-title");
  await s.wait(3400);
  await s.rest();

  // A chat changes: memory had the first date, and follows the chat to the new one.
  s.chapter("change");
  const memory = await memoryOpen;
  await s.film(memory);
  s.say(`Memory says her DATA 100 lab is due ${FROM}, from a chat on Claude.`);
  await s.glide(memory, factCard("Lab 1", FROM));
  await s.wait(3200);
  const claude = await s.open("claude", "sites/claude-changed.html", { host: HOSTS.claude, person: MAYA, path: `/chat/${data.changed.id}` });
  await s.waitFor(claude, text("Lab 1 for DATA 100 was moved"));
  await s.film(claude);
  s.say(`Today she went back to that chat and said the lab moved to ${TO}.`);
  await s.wait(3400);
  await s.film(memory);
  await s.waitFor(memory, factCard("Lab 1", TO), 60_000);
  s.say(`Coere saved the changed chat and read it again. Memory now says ${TO}.`);
  await s.wait(600);
  await s.glide(memory, factCard("Lab 1", TO));
  await s.wait(3000);
  s.say("The old date stays under Earlier, with the message that moved it.");
  await s.glide(memory, factCard("Lab 1", FROM, true));
  await s.wait(3000);
  await s.rest();

  // Your library.
  s.chapter("library");
  const library = await openExt(s, "library", "console-v2.html?tab=library");
  await s.waitFor(library, text(data.changingTitle));
  await s.film(library);
  s.say("The Library keeps every chat from every AI, to search, read, download or move to another AI.");
  await s.wait(4200);
  await s.rest();
  s.say("Saving chats needs no AI and no account.");
  await s.card("Coere Extraction", "Your chats stay on your computer.", 2400);
  if (s.world.unanswered.length) console.log("unanswered", JSON.stringify(s.world.unanswered));
}

play(
  {
    title: "Coere Extraction",
    chapters: [
      { id: "choose", title: "Choose your AIs", seconds: 9 },
      { id: "extract", title: "Extract all", seconds: 15 },
      { id: "new", title: "New chats come in", seconds: 16 },
      { id: "change", title: "A chat changes", seconds: 17 },
      { id: "library", title: "Your library", seconds: 8 },
    ],
  },
  film,
  setup,
);
