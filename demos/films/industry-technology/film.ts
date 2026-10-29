import { HINT_KEY, hintRecord } from "@v2/apps/extension/src/content/agent/hint/seen";
import { ORG_RECORD_KEY } from "@v2/packages/solution/src/types";
import { play } from "../../stage/player";
import { key } from "../../stage/input";
import { deep, deepAll, role, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";
import { connectContext, setupConnect } from "./context";
import { answerCori } from "./cori";
import { inlineMemoryCss } from "./css-fix";
import { SAM } from "./field";
import { clearDock, groupButton, label, openByName, searchBox, sideSheet } from "./helpers";
import { CLAUDE_ASK, CLAUDE_REPLY, CLIENT_DRAFT, CORI_ASK, GPT_DRAFT, GPT_REPLY } from "./lines.mjs";
import { buildMemory, type Mem } from "./memory";
import { answerMemory } from "./teams-answers";
import { terminalLines } from "./terminal-out";
import * as v from "./views";

/**
 * The technology page's demo: Sam Whitaker, a backend engineer at Northbeam
 * Labs, debugs the Ledger API's webhook handler with Claude, then asks
 * ChatGPT, and Coere carries the Claude chat, the stack and the decisions
 * over before he sends; the firm's memory of every client project in Coere
 * for Teams; a draft to one client that carries only that client, and Cori
 * on the stack with his sources; and a coding assistant built on Forge
 * reading the stack and the decisions before it suggests a change. Every
 * Coere surface is Coere's own code: the content script on the replica
 * sites, the Teams dashboard, the service worker's Cori host.
 */

const CHAPTERS = [
  { id: "context", title: "From Claude to ChatGPT", seconds: 36 },
  { id: "graph", title: "Every client project", seconds: 31 },
  { id: "confidential", title: "Ask about the stack", seconds: 26 },
  { id: "app", title: "A coding assistant", seconds: 20 },
];

const LIB = "/preview/live/lib/";
const composer: Query = ".ProseMirror";
const stripLine = label("the context strip", (doc: Document) => deep(doc, "[data-coere-context-strip] .coere-ctx-strip"));
const stripList: Query = "#coere-ctx-list";
const coriBox: Query = ".cx-cori-page textarea";

/** The chapter the address skips to, if any. */
const FROM = new URLSearchParams(location.search).get("from");

let mem: Mem | null = null;

async function until(test: () => boolean, ms = 20_000): Promise<boolean> {
  const end = Date.now() + ms;
  while (!test()) {
    if (Date.now() > end) return false;
    await new Promise((r) => setTimeout(r, 50));
  }
  return true;
}

/**
 * One chapter. Played through, it starts and then makes its pages ready
 * off screen. Skipped to, its pages are made ready first, so a short
 * showcase opens on them; a chapter skipped past is left out, since none
 * after it needs its tabs.
 */
async function part<T>(s: Stage, id: string, ready: () => Promise<T>, act: (t: T) => Promise<void>): Promise<void> {
  if (!s.fast) {
    s.chapter(id);
    return act(await ready());
  }
  if (FROM !== id) {
    s.chapter(id);
    if (s.fast) return;
    return act(await ready());
  }
  const t = await ready();
  s.chapter(id);
  await act(t);
}

/** Types as a person does; skipping ahead the last letter still goes as a key, since Coere reads a box after a key that types. */
async function typeText(s: Stage, tab: Tab, words: string, delay: number): Promise<void> {
  if (!s.fast) return s.type(tab, words, delay);
  await s.type(tab, words.slice(0, -1), delay);
  key(tab.doc, words.slice(-1));
}

/**
 * Opens a replica chat site. A browser runs the page's microtasks between
 * a real key's listeners, so ProseMirror takes in the block Coere's send
 * hook put in before the site's own Enter reads the box; the scripted
 * keys run every listener at once, so after Coere's turn the editor is
 * told to read the box, as the observer would have.
 */
async function site(s: Stage, name: string, page: string, host: string, replies: string[]): Promise<Tab> {
  const tab = await s.open(name, page, { host, person: SAM, replies });
  tab.win.addEventListener("keydown", (e) => e.key === "Enter" && tab.doc.dispatchEvent(new Event("selectionchange")), true);
  await s.waitFor(tab, composer);
  // Coere finishes starting on the page (its scan, its settings) before a draft can get context.
  await new Promise((r) => setTimeout(r, 1500));
  return tab;
}

const replied = (tab: Tab, n: number) => Number(tab.doc.documentElement.dataset.fakeReplied ?? 0) >= n;

const sentCount = (tab: Tab): number => ((tab.win as unknown as { __coereFakeSentText?: string[] }).__coereFakeSentText ?? []).length;

/**
 * Enter in the box: Coere puts its block (and a chat it carries) in front
 * of the draft and the site sends; once it has, the box is emptied, as the
 * site does and its stand in does not.
 */
async function send(s: Stage, tab: Tab): Promise<void> {
  const before = sentCount(tab);
  (tab.doc.querySelector(".ProseMirror") as HTMLElement | null)?.focus();
  await s.press(tab, "End");
  await s.press(tab, "Enter", 200);
  await until(() => sentCount(tab) > before, 30_000);
  const box = tab.doc.querySelector<HTMLElement>(".ProseMirror");
  if (box) {
    box.focus();
    tab.doc.execCommand("selectAll");
    tab.doc.execCommand("delete");
    box.blur();
  }
  // The site clears the file beside the box once a message is sent; the stand in leaves it.
  tab.doc.querySelectorAll(".fake-file-chip").forEach((chip) => chip.remove());
}

/** Keeps the end of the thread in view while a reply grows, as the site's own scroll does at the bottom. */
function follow(tab: Tab): () => void {
  const timer = tab.win.setInterval(() => {
    for (let el = tab.doc.querySelector<HTMLElement>("[data-fake-thread]"); el; el = el.parentElement) {
      if (el.scrollHeight > el.clientHeight + 4 && /(auto|scroll)/.test(tab.win.getComputedStyle(el).overflowY)) el.scrollTop = el.scrollHeight;
    }
  }, 120);
  return () => tab.win.clearInterval(timer);
}

/** Connect: the Claude chat, then ChatGPT with the chat, the stack and the decisions carried over. */
async function connect(s: Stage): Promise<void> {
  await part(
    s,
    "context",
    async () => ({
      claude: await site(s, "claude", "sites/claude.html", "claude.ai", [CLAUDE_REPLY]),
      gpt: await site(s, "gpt", "sites/chatgpt.html", "chatgpt.com", [GPT_REPLY]),
    }),
    async ({ claude, gpt }) => {
      await s.film(claude);
      s.say("Sam is debugging the Ledger API's webhook handler with Claude.");
      await s.wait(600);
      await s.click(claude, composer, { after: 250 });
      await typeText(s, claude, CLAUDE_ASK, 38);
      await s.wait(250);
      await send(s, claude);
      await s.rest();
      await until(() => replied(claude, 1), 20_000);
      s.say("Claude writes the backoff in Go.");
      await s.wait(1800);

      s.say("Then he opens ChatGPT for a second opinion.");
      await s.film(gpt);
      await s.click(gpt, composer, { after: 300 });
      await typeText(s, gpt, GPT_DRAFT, 46);
      await s.rest();
      await until(() => /Ledger API retry bug/.test(stripLine(gpt.doc)?.textContent ?? ""), 10_000);
      s.say("Coere says what goes with it: his Claude chat, the stack and the decisions.");
      // The strip's reveal plays before the pointer goes to it.
      await s.wait(800);
      await s.glide(gpt, stripLine);
      await s.wait(1100);
      await s.click(gpt, role("button", "Show the memories that go in", { exact: true }), { after: 400 });
      await s.waitFor(gpt, stripList);
      await s.rest();
      await s.wait(3000);
      const hide = role("button", "Hide the list", { exact: true });
      if (s.has(gpt, hide)) await s.click(gpt, hide, { after: 300 });
      s.say("One Enter sends it with the context in front. ChatGPT answers for his stack.");
      const stop = follow(gpt);
      await send(s, gpt);
      await s.rest();
      await until(() => replied(gpt, 1), 30_000);
      await s.wait(2800);
      stop();
    },
  );
}

/** The Memory page of Coere for Teams, drawn and settled, off screen until filmed (demos/films/teams/agency.ts). */
async function memoryPage(s: Stage, name: string): Promise<Tab> {
  const page = await s.open(name, `${LIB}console-v2-solution.html?tab=memory`);
  await inlineMemoryCss(page);
  await s.waitFor(page, searchBox);
  await clearDock(page);
  await s.wait(2500);
  return page;
}

/** Scrolls a side sheet's scrolling box by `dy`, as a trackpad under the pointer would. */
async function scrollSheet(s: Stage, page: Tab, name: string, dy: number, ms = 1400): Promise<void> {
  const sheet = sideSheet(name)(page.doc);
  if (!sheet) return;
  const box = [sheet, ...sheet.querySelectorAll<HTMLElement>("*")].find((el) => el.scrollHeight > el.clientHeight + 4 && /(auto|scroll)/.test(page.win.getComputedStyle(el).overflowY)) as HTMLElement | undefined;
  if (!box) return;
  const r = box.getBoundingClientRect();
  await s.moveTo({ x: r.left + r.width * 0.6, y: r.top + r.height * 0.55 });
  const steps = s.fast ? 1 : Math.round(ms / 30);
  for (let i = 0; i < steps; i++) {
    box.scrollTop += dy / steps;
    await s.wait(30);
  }
}

/** The firm's memory: Company and Clients, then Halcyon Health's sheet. */
async function graph(s: Stage): Promise<void> {
  await part(
    s,
    "graph",
    () => memoryPage(s, "graph"),
    async (page) => {
      await s.film(page);
      s.say("Coere for Teams keeps one memory of the firm and every client project.");
      await s.wait(3200);
      s.say("Clients holds a folder per client, with its projects, people and promises.");
      await s.click(page, groupButton("Show", "Clients", "Clients"), { after: 300 });
      await s.rest();
      await s.wait(3600);
      await s.click(page, groupButton("Show", "Clients", "All"), { after: 300 });
      s.say("Halcyon Health opens to its contacts, the Ledger API, its promises and its dates.");
      await openByName(s, page, "Halcyon Health");
      await s.waitFor(page, role("heading", "Promises", { within: sideSheet("Halcyon Health") }));
      await s.wait(3400);
      await scrollSheet(s, page, "Halcyon Health", 420);
      await s.wait(2800);
      await scrollSheet(s, page, "Halcyon Health", 900, 1800);
      await s.wait(3000);
    },
  );
}

/** One client per send, then Cori on the stack with his sources. */
async function confidential(s: Stage): Promise<void> {
  await part(
    s,
    "confidential",
    async () => {
      const chat = await site(s, "client", "sites/chatgpt-team.html", "chatgpt.com", []);
      const cori = await s.open("cori", `${LIB}console-v2-solution.html?tab=cori`);
      await s.waitFor(cori, coriBox);
      return { chat, cori };
    },
    async ({ chat, cori }) => {
      await s.film(chat);
      s.say("Sam starts an update to Maya at Halcyon Health.");
      await s.click(chat, composer, { after: 300 });
      await typeText(s, chat, CLIENT_DRAFT, 45);
      await s.rest();
      await until(() => /Halcyon Health/.test(stripLine(chat.doc)?.textContent ?? ""), 15_000);
      s.say("The line names the client. Only Halcyon's context goes, nothing from other clients.");
      await s.wait(800);
      await s.glide(chat, stripLine);
      await s.wait(1100);
      await s.click(chat, role("button", "Show the memories that go in", { exact: true }), { after: 400 });
      if (await s.waitFor(chat, stripList, 5000).then(() => true, () => false)) {
        await s.rest();
        await s.wait(3200);
      }
      await s.rest();

      await s.film(cori);
      s.say("On the dashboard he asks Cori what the Ledger API runs on.");
      await s.click(cori, coriBox, { after: 200 });
      await s.type(cori, CORI_ASK, 50);
      await s.wait(300);
      await s.press(cori, "Enter");
      await s.rest();
      await s.waitFor(cori, label("Cori's answer", (doc: Document) => {
        const last = [...doc.querySelectorAll('.cx-cori-page [data-turn="answer"]')].at(-1);
        return last && /Go 1\.23/.test(last.textContent ?? "") && !doc.querySelector(".cr-typed") ? last : null;
      }), 20_000);
      s.say("Cori answers from memory, with the AI and the chat each fact came from.");
      await s.wait(5600);
    },
  );
}

type Term = { prompt(): HTMLElement; ran(): void; line(text: string): void; done(): void; clear(): void };
const term = (tab: Tab) => (tab.win as unknown as { __term: Term }).__term;

async function run(s: Stage, shell: Tab, command: string): Promise<void> {
  term(shell).prompt();
  await s.type(shell, command, 34);
  await s.wait(300);
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

/** Forge: the team's coding assistant asks Coere's context API, with its own token, before it suggests a change. */
async function app(s: Stage): Promise<void> {
  await part(
    s,
    "app",
    () => s.open("shell", "terminal.html?title=dev-assistant"),
    async (shell) => {
      const out = terminalLines();
      await s.film(shell);
      s.say("The team's coding assistant is built on Forge. It asks Coere for the context first.");
      await run(s, shell, out.context.command);
      await s.wait(700);
      await print(s, shell, out.context.out, 60);
      s.say("It gets the Ledger API's stack and decisions, and why each one goes.");
      await s.wait(4200);
      await run(s, shell, out.suggest.command);
      await s.wait(1100);
      await print(s, shell, out.suggest.out, 110);
      s.say("Then it suggests a change that keeps to those decisions.");
      await s.wait(5200);
    },
  );
}

async function film(s: Stage): Promise<void> {
  if (!FROM) await s.card("Coere for engineering", "Your stack and decisions, in every AI and every tool.", 2600);
  await connect(s);
  await graph(s);
  await confidential(s);
  await app(s);
  if (s.world.unanswered.length) console.warn("Unanswered:", [...new Set(s.world.unanswered.map((u) => u.type))].join(" "));
}

/**
 * A closed or replaced tab leaves listeners in the World, and calling
 * into a removed frame throws; each one is guarded so a gone tab only
 * goes quiet (as demos/films/teams does).
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
  const now = Date.now();
  mem = buildMemory(now);
  // He has used Coere for months: Cori's tip and hello are behind him, and the firm's record is set up.
  world.write("local", { [HINT_KEY]: hintRecord(now - 90 * 86_400_000), "coere.cori.hello": { at: now - 3 * 86_400_000 }, [ORG_RECORD_KEY]: v.orgRecord(mem) });
  answerMemory(world, mem);
  setupConnect(world);
  answerCori(world);
  // The strip's engine call: ChatGPT in the Connect chapter gets the stack, the client chat gets one client, Claude nothing.
  const m = mem;
  world.engine("memory.contextFor", (msg, tab) => {
    const a = (msg.args ?? {}) as { tail?: string; keywords?: string[] };
    if (tab === "client") return v.contextFor(m, String(a.tail ?? ""));
    if (tab === "gpt") return connectContext(a);
    return connectContext({});
  });
}

play({ title: "Coere for engineering", chapters: CHAPTERS }, film, setup);
