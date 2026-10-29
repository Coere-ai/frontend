import { play, type FilmMeta } from "../../stage/player";
import { insert, key } from "../../stage/input";
import { role, text } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";
import { FORGE, ForgeWorld } from "./world";

/**
 * "Coere Forge: build it into your app". A developer adds Coere to a small
 * app of their own:
 *
 *   key        On the Coere dashboard's Apps page (Coere's own code), Add an
 *              app: a name, what it may do, its sections, Make token, and
 *              the token shown once, copied.
 *   docs       In their editor (code.ts, a VS Code look), the token goes in
 *              .env; the Coere docs open beside the code (the site's real
 *              /resources page) and the starter lines are copied and pasted.
 *   integrate  The app's model call gets Coere's context for what the user
 *              typed (context.forDraft, as the docs write it) in front of
 *              the prompt; run in the terminal, it prints the context block
 *              and the model's answer that uses it.
 *   anywhere   The same lines in front of every AI (anywhere.tsx), each
 *              lighting up as the context flows in.
 *
 * The token, the dashboard's answers and the context block are what
 * coere-v2's real access layer, coere-server and @coere/client gave for
 * Maya's memory (bake.mts). The model's answer is written for the film.
 */

const CHAPTERS = [
  { id: "key", title: "Make a token", seconds: 27 },
  { id: "docs", title: "Paste the starter", seconds: 30 },
  { id: "integrate", title: "Context for your AI", seconds: 32 },
  { id: "anywhere", title: "Any AI", seconds: 29 },
];

const LIB = "/preview/live/lib/";
const DOCS = "coere.ai/resources";
/** The first lines of the docs' TypeScript quickstart (src/site/content/docs/overview.md, 2.3), as the film selects them. */
const STARTER = "import { Coere } from '@coere/client'\n\nconst coere = new Coere({ token: process.env.COERE_TOKEN })";
const COMMAND = `npx tsx --env-file=.env app.ts "${FORGE.draft}"`;
/** What prep-coach's model answers with Coere's context in front of the draft. Written for the film, from that context. */
const ANSWER = `Your PearX partner round is on November 4 at 2 pm over video, with two partners. They will ask about traction, the team and why now. Here is a plan for each.

Traction: lead with the 1,200 weekly users.
Why now: bring in the records move.
The team: say why your team is the one to build Tidepool.

Want to run a practice round? I can play one of the partners.`;

let world: ForgeWorld | null = null;
/** What the person copied last: the dashboard's Copy writes it here, as the clipboard would hold it. */
let clipboard = "";

function setup(w: World): void {
  world = new ForgeWorld(w);
  world.install();
  clipboard = "";
}

async function until(test: () => boolean, what: string, ms = 30_000): Promise<void> {
  const end = Date.now() + ms;
  while (!test()) {
    if (Date.now() > end) throw new Error(`never: ${what}`);
    await new Promise((r) => setTimeout(r, 50));
  }
}

/** A chapter that opens on a new page: played through, it starts before the page opens; skipped to, once the page is on screen (as v3's film does). */
async function opening<T>(s: Stage, id: string, open: () => Promise<T>): Promise<T> {
  const through = !s.fast;
  if (through) s.chapter(id);
  const tab = await open();
  if (!through) s.chapter(id);
  return tab;
}

type Point = { x: number; y: number };
type Term = { prompt(): void; focus(): void; ran(): void; line(t: string): void; words(t: string): void; done(): void; clear(): void };
type Code = {
  clip: string;
  term: Term;
  open(name: string): void;
  text(): string;
  point(line: number, col: number): Point;
  find(text: string, after?: boolean): { line: number; col: number };
  caret(line: number, col: number): void;
  sidebar(on: boolean): void;
  docsFrame(): HTMLIFrameElement | null;
  closeDocs(): void;
  maximize(on: boolean): void;
};
const api = (tab: Tab) => (tab.win as unknown as { __code: Code }).__code;

/** Clicks where some text sits in the open file, and puts the caret there, as a click in an editor does. */
async function clickIn(s: Stage, tab: Tab, find: string, after = true): Promise<void> {
  const c = api(tab);
  const at = c.find(find, after);
  const p = c.point(at.line, at.col);
  await s.clickAt(tab, { x: p.x - 4, y: p.y }, { after: 120 });
  c.caret(at.line, at.col);
  await s.wait(250);
}

/**
 * Types code key by key. The shared hand reads "+" as the joint of a key
 * combination ("Meta+v"), so a plus goes in as the text a plus key types.
 */
async function typeCode(s: Stage, tab: Tab, value: string, delay: number): Promise<void> {
  const parts = value.split("+");
  for (let i = 0; i < parts.length; i++) {
    if (i > 0) {
      insert(tab.doc, "+");
      await s.wait(delay);
    }
    if (parts[i]) await s.type(tab, parts[i]!, delay);
  }
}

// ---------------------------------------------------------------- key

async function makeKey(s: Stage): Promise<Tab> {
  s.chapter("key");
  s.say("Coere Forge lets your own app read a person's Coere memory.");
  await s.card("Coere Forge", "Your users' memory, in the app you build.", 2800);
  const apps = await s.open("apps", `${LIB}console-v3.html?tab=apps`);
  // The server's address names this computer and a port, which the film does not show (as v3's film hides it), and so do the token dialog's MCP lines.
  const style = apps.doc.createElement("style");
  style.textContent = ".cx-apps-url{visibility:hidden}.cx-apps-mcp-title,.cx-apps-once .cx-apps-secret~.cx-apps-secret{display:none}";
  apps.doc.head.append(style);
  // Copy writes to the clipboard; here the film keeps what was copied.
  Object.defineProperty(apps.win.navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async (t: string) => {
        clipboard = t;
      },
    },
  });
  await s.waitFor(apps, ".cx-apps");
  await s.waitFor(apps, text(/Connected\./));
  await s.film(apps);
  s.say("The developer opens Apps on the Coere dashboard. No app has a token yet.");
  await s.wait(2000);

  s.say("Add an app makes a token for prep-coach, an interview coach they are building.");
  await s.click(apps, role("button", "Add an app", { exact: true }), { after: 700 });
  const dialog = ".cx-apps-dialog";
  await s.waitFor(apps, `${dialog} input[type="text"]`);
  await s.click(apps, `${dialog} input[type="text"]`, { after: 250 });
  await s.type(apps, "prep-coach", 85);
  await s.wait(600);

  s.say("It may read memory and see where each memory came from.");
  await s.click(apps, role("checkbox", "Sees quotes and chat titles", { within: dialog }), { after: 600 });
  s.say("Only the sections it needs: Work, Projects, Plans and deadlines.");
  await s.click(apps, text("Only these sections", `${dialog} label`), { after: 600 });
  for (const name of ["Work", "Projects", "Plans and deadlines"]) await s.click(apps, role("checkbox", name, { within: dialog, exact: true }), { after: 380 });
  await s.wait(700);
  await s.click(apps, role("button", "Make token", { within: dialog }), { after: 300 });
  await s.waitFor(apps, ".cx-apps-once", 15_000);
  await s.rest();
  s.say("The token shows once. Copy it now.");
  await s.wait(1600);
  await s.click(apps, role("button", "Copy Token"), { after: 1400 });
  await s.click(apps, role("button", "Done", { within: dialog, exact: true }), { after: 600 });
  await s.waitFor(apps, text("prep-coach", ".cx-apps-list *"), 10_000).catch(() => null);
  await s.rest();
  s.say("prep-coach is on the list, with what it may do and its sections.");
  await s.wait(2600);
  return apps;
}

// ---------------------------------------------------------------- docs

/** The docs' TypeScript quickstart in the docs pane, and the text of its first lines as positions in it. */
function starterIn(doc: Document): { start: [Node, number]; at(i: number): [Node, number]; length: number } | null {
  const block = [...doc.querySelectorAll("pre")].find((p) => p.textContent?.includes(STARTER));
  if (!block) return null;
  const nodes: Text[] = [];
  const walk = doc.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  while (walk.nextNode()) nodes.push(walk.currentNode as Text);
  const from = (block.textContent ?? "").indexOf(STARTER);
  const at = (i: number): [Node, number] => {
    let n = from + i;
    for (const t of nodes) {
      if (n <= t.length) return [t, n];
      n -= t.length;
    }
    const last = nodes.at(-1)!;
    return [last, last.length];
  };
  return { start: at(0), at, length: STARTER.length };
}

/** A stage point for a place in the docs pane's page. */
function inPane(frame: HTMLIFrameElement, r: DOMRect): Point {
  const f = frame.getBoundingClientRect();
  return { x: f.left + r.left, y: f.top + r.top + r.height / 2 };
}

/** The docs pane scrolls the way a trackpad moves it, eased. */
async function scrollPane(s: Stage, win: Window, to: number, ms = 1500): Promise<void> {
  const from = win.scrollY;
  const start = performance.now();
  for (;;) {
    const t = s.fast ? 1 : Math.min(1, (performance.now() - start) / ms);
    const e = 1 - (1 - t) ** 3;
    win.scrollTo({ top: from + (to - from) * e, behavior: "instant" });
    if (t >= 1) return;
    await new Promise((r) => requestAnimationFrame(r));
  }
}

const pointerEl = () => document.getElementById("pointer");

async function pasteStarter(s: Stage, apps: Tab): Promise<Tab> {
  const code = await opening(s, "docs", async () => {
    const tab = await s.open("code", "code.html");
    await s.waitFor(tab, ".code textarea");
    await until(() => api(tab).text().length > 0, "the editor");
    await s.film(tab);
    s.close(apps);
    return tab;
  });
  const c = api(code);
  c.clip = clipboard || FORGE.made.token;
  s.say("In their editor, prep-coach sends what its user types to Claude.");
  await s.wait(1800);

  s.say("The token goes in .env.");
  await s.click(code, '.item[data-file=".env"]', { after: 500 });
  await clickIn(s, code, "••\n", false);
  c.caret(0, c.text().indexOf("\n"));
  await s.press(code, "Enter", 200);
  await s.type(code, "COERE_TOKEN=", 70);
  await s.wait(300);
  await s.press(code, "Meta+v", 700);
  await s.press(code, "Meta+s", 900);

  if (!s.fast) {
    s.say("The Coere docs open beside the code.");
    await s.rest();
    await s.press(code, "Meta+Shift+p", 500);
    await s.type(code, "simple", 70);
    await s.wait(350);
    await s.press(code, "Enter", 500);
    await s.type(code, DOCS, 60);
    await s.wait(400);
    await s.press(code, "Enter", 300);
    await s.press(code, "Meta+b", 200);
    const frame = await until(() => Boolean(c.docsFrame()?.contentDocument?.querySelector("pre")), "the docs", 30_000).then(() => c.docsFrame()!);
    const win = frame.contentWindow!;
    const doc = frame.contentDocument!;
    const sel = doc.createElement("style");
    sel.textContent = "::selection{background:rgba(82,103,247,.42)}";
    doc.head.append(sel);

    // The pane opens where the developer last read the docs: the quickstart, just under its curl lines (which name the server's address, as the film never shows). Then down to the TypeScript lines.
    const starter = starterIn(doc);
    if (starter) {
      const pre = (starter.start[0] as Text).parentElement!.closest("pre")!;
      const py = [...doc.querySelectorAll("p")].find((p) => p.textContent?.startsWith("Python (the SDK reads"));
      // The site's page settles (hydrates and sets its own scroll) before it is placed and shown.
      await until(() => doc.readyState === "complete", "the docs to load", 30_000);
      await new Promise((r) => setTimeout(r, 900));
      // The site scrolls smoothly; the pane is placed at once.
      const place = () => py && win.scrollTo({ top: win.scrollY + py.getBoundingClientRect().top - 12, behavior: "instant" });
      place();
      await new Promise((r) => setTimeout(r, 300));
      place();
      frame.style.visibility = "visible";
      await s.wait(1400);
      const f = frame.getBoundingClientRect();
      await s.moveTo({ x: f.left + f.width / 2, y: f.top + f.height / 2 });
      s.say("The quickstart has the starter code for TypeScript.");
      const target = win.scrollY + pre.getBoundingClientRect().top - frame.clientHeight * 0.3;
      await scrollPane(s, win, target, 1300);
      await s.wait(700);

      // A drag over the first lines selects them.
      const range = doc.createRange();
      const rectAt = (i: number) => {
        const [n, o] = starter.at(i);
        range.setStart(n, o);
        range.setEnd(n, Math.min(o + 1, (n as Text).length));
        return range.getBoundingClientRect();
      };
      s.say("They select the client's first lines and copy them.");
      await s.moveTo(inPane(frame, rectAt(0)));
      await s.wait(250);
      pointerEl()?.classList.add("down");
      const selection = win.getSelection()!;
      const marks = [0, 8, 18, 26, 37, 39, 52, 66, 80, starter.length - 1];
      for (const i of marks) {
        const r = rectAt(i);
        await s.moveTo({ x: inPane(frame, r).x + r.width, y: inPane(frame, r).y }, { ms: 140, straight: true });
        const [n, o] = starter.at(i + 1);
        selection.setBaseAndExtent(starter.start[0], starter.start[1], n, o);
      }
      pointerEl()?.classList.remove("down");
      await s.wait(500);
      key(doc, "Meta+c");
      c.clip = selection.toString() || STARTER;
      await s.wait(700);
    } else {
      frame.style.visibility = "visible";
      c.clip = STARTER;
    }
  } else c.clip = STARTER;

  s.say("They paste them into app.ts.");
  await s.click(code, '#g1 [data-tab="app.ts"]', { after: 400 });
  await clickIn(s, code, "import Anthropic from '@anthropic-ai/sdk'");
  await s.press(code, "Enter", 250);
  await s.press(code, "Meta+v", 900);
  await s.press(code, "Meta+s", 500);
  await s.rest();
  await s.wait(1500);
  if (!s.fast) {
    await s.click(code, ".close-docs", { after: 400 });
    c.sidebar(true);
  }
  c.closeDocs();
  c.sidebar(true);
  await s.wait(600);
  return code;
}

// ---------------------------------------------------------------- integrate

async function integrate(s: Stage, code: Tab): Promise<void> {
  s.chapter("integrate");
  const c = api(code);
  s.say("reply gets the chat it belongs to.");
  await clickIn(s, code, "reply(text: string");
  await s.type(code, ", chat: string", 70);
  await s.wait(500);

  s.say("Before the model call, Coere gives the context for what the user typed.");
  await clickIn(s, code, "chat: string) {");
  await s.press(code, "Enter", 200);
  await s.type(code, "const ctx = await coere.context.forDraft(text, { chat })", 52);
  await s.press(code, "Enter", 200);
  await s.type(code, "console.log(ctx.block)", 62);
  await s.wait(600);

  s.say("ctx.block goes in front of the prompt.");
  await clickIn(s, code, "content: ");
  await typeCode(s, code, "ctx.block + ", 75);
  await s.wait(500);
  await clickIn(s, code, "process.argv[2]");
  await s.type(code, ", crypto.randomUUID()", 60);
  await s.press(code, "Meta+s", 700);
  await s.rest();
  await s.wait(1600);

  s.say("They run it with what a user might type.");
  await s.click(code, ".term", { after: 200 });
  c.term.focus();
  await s.type(code, COMMAND, 32);
  await s.wait(400);
  await s.press(code, "Enter", 0);
  c.term.ran();
  await s.wait(300);
  await s.click(code, ".maxi", { after: 300 });
  await s.rest();
  await s.wait(700);
  s.say("Coere's context from Maya's memory prints first, then Claude's answer that uses it.");
  for (const line of (FORGE.context.block + "\n").replace(/\n$/, "").split("\n")) {
    c.term.line(line);
    await s.wait(55);
  }
  await s.wait(900);
  for (const part of ANSWER.split(/(\s+)/)) {
    c.term.words(part);
    if (part.trim()) await s.wait(part.endsWith(".") ? 90 : 38);
  }
  c.term.line("");
  c.term.done();
  c.term.prompt();
  await s.wait(4200);
}

// ---------------------------------------------------------------- anywhere

async function anywhere(s: Stage, code: Tab): Promise<void> {
  const page = await opening(s, "anywhere", async () => {
    const tab = await s.open("any", "anywhere.html");
    await s.waitFor(tab, ".tile");
    await s.film(tab);
    s.close(code);
    return tab;
  });
  s.say("The same lines work with every AI. Coere's context is plain text in front of the prompt.");
  await s.wait(1800);
  for (const id of ["chatgpt", "claude", "gemini", "deepseek", "kimi", "perplexity", "grok", "copilot", "meta_ai"]) {
    await s.click(page, `.chip[data-ai="${id}"]`, { after: 1450 });
  }
  await s.rest();
  await s.wait(2400);
  s.say("Coere Forge: one memory, in every AI your app talks to.");
  await s.card("Coere Forge", "One memory, in every AI your app talks to.", 3200);
  s.close(page);
}

async function film(s: Stage): Promise<void> {
  const apps = await makeKey(s);
  const code = await pasteStarter(s, apps);
  await integrate(s, code);
  await anywhere(s, code);
  if (s.world.unanswered.length) console.log("UNANSWERED", JSON.stringify([...new Set(s.world.unanswered.map((u) => `${u.tab} ${u.type}`))]));
}

const META: FilmMeta = { title: "Coere Forge: build it into your app", chapters: CHAPTERS };
play(META, film, setup);
