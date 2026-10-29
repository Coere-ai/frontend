import { play } from "../../stage/player";
import { focused } from "../../stage/input";
import { deep, role, text, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";
import { clearBatch, extractAll } from "./extract";
import { AIS, APPS, FilmWorld, PLATFORM_CHATS } from "./world";

/**
 * "Coere v3: apps", ported beat by beat from coere-v2's
 * tools/demo-video/v3.demo.ts and its parts (v2/first-run.ts told
 * briefly, v3/apps.ts, v3/planner.ts, stage/hint.ts): Maya sets Coere up
 * and builds her memory; her event planner asks for access from its own
 * code and she allows it on the Apps page; the Python SDK prints the
 * context a chat would get for a draft, and ChatGPT's strip adds the same
 * memories; the planner plans a dinner from her memory; the Apps page
 * shows what it was sent, and Revoke ends it.
 *
 * Onboarding, the dashboard and the strip are Coere's own code. The
 * terminal is a page of the film's own (terminal.ts), and every line it
 * prints is what the real planner and SDK printed against a real
 * coere-server paired with Maya's memory (bake.mts).
 */

/** Each chapter's length in seconds, measured from a full run. */
const CHAPTERS = [
  { id: "setup", title: "Set up and build", seconds: 43 },
  { id: "asks", title: "An app asks", seconds: 18 },
  { id: "context", title: "The same context", seconds: 29 },
  { id: "planner", title: "The planner", seconds: 10 },
  { id: "sent", title: "What it was sent", seconds: 11 },
  { id: "revoke", title: "Revoke", seconds: 11 },
];

const LIB = "/preview/live/lib/";
const MAYA = { name: "Maya Collins", first: "Maya", initials: "MC" };
const DRAFT = "Help me prepare for this interview";
/** The first run told briefly: each hold three fifths of v2's (v2/first-run.ts). */
const brief = (ms: number) => Math.round(ms * 0.6);

let current: FilmWorld | null = null;

function setup(world: World): void {
  current?.stop();
  current = new FilmWorld(world);
  current.install();
  // Voice mode stays off in this film, so its models are never asked for more than their state, which nothing here shows.
  const handle = world.handle.bind(world);
  world.handle = async (m, tab) => (m?.ch === "coere-voice" ? { ok: true, result: null } : handle(m, tab));
  const now = current;
  // Extract all on her three AIs, each at its own pace: 148, 102 and 74 chats (bake.mts).
  extractAll(world, { chatgpt: { chats: PLATFORM_CHATS.chatgpt ?? 148, ms: 4300 }, claude: { chats: PLATFORM_CHATS.claude ?? 102, ms: 3800 }, gemini: { chats: PLATFORM_CHATS.gemini ?? 74, ms: 3200 } }, () => now.fast());
}

/** Polls until `test` holds. */
async function until(test: () => boolean, what: string, ms = 30_000): Promise<void> {
  const end = Date.now() + ms;
  while (!test()) {
    if (Date.now() > end) throw new Error(`never: ${what}`);
    await new Promise((r) => setTimeout(r, 50));
  }
}

const textOf = (tab: Tab, selector: string): string => (deep(tab.doc, selector)?.textContent ?? "").replace(/\s+/g, " ").trim();

/** v2/first-run.ts, brief: the opening card, onboarding with her three AIs, Extract all, the build step, the graph growing, the finish. */
async function setUp(s: Stage, memory: FilmWorld): Promise<Tab> {
  s.chapter("setup");
  const onboarding = await s.open("onboarding", "onboarding.html");
  s.say("Coere v3 builds the same memory as v2, and lets your own apps use it.");
  await s.card("Coere v3", "Your memory, for the apps you build too.", 3000);
  await s.waitFor(onboarding, ".cx-ai");
  await s.film(onboarding);
  s.say("Installing opens onboarding. Cori asks which AIs you use.");
  await s.wait(brief(2600));
  s.say("Maya uses ChatGPT, Claude and Gemini.");
  for (const id of AIS) await s.click(onboarding, (d) => deep(d, `.cx-ai[data-platform="${id}"] [role="checkbox"]`) ?? deep(d, `.cx-ai[data-platform="${id}"]`), { after: 500 });
  await s.wait(brief(600));
  s.say("Save starts Extract all on each of them.");
  await s.click(onboarding, ".ob-save", { after: 300 });
  await s.rest();

  await s.waitFor(onboarding, ".ob-rows .ob-row");
  s.say("Extract all reads each AI and saves every chat, with a row for each.");
  await s.wait(brief(4500));
  const done = role("button", "Done", { exact: true });
  await s.waitFor(onboarding, done, 60_000);
  s.say("Every chat is saved on this computer.");
  await s.wait(brief(2200));
  await s.click(onboarding, done, { after: 200 });

  await s.waitFor(onboarding, text("Coere is now going to build your memory", "h1"));
  await until(() => /for \d+ chats\./.test(textOf(onboarding, ".ob-estimate")), "the estimate");
  await s.wait(brief(900));
  s.say("Cori asks what to build memory from. Nothing goes to an AI until Maya says yes.");
  await s.glide(onboarding, role("group", "What should Coere build memory from?"));
  await s.wait(brief(3000));
  s.say("New chats will save by themselves, and context goes into new chats as she types.");
  await s.glide(onboarding, ".ob-switches");
  await s.wait(brief(2400));
  await s.click(onboarding, role("button", "Build my memory"), { after: 200 });
  await s.rest();

  // Sorting the chats draws no graph yet, so the shot picks up once memories are on it.
  const memories = () => Number(/^(\d+) memor/.exec(textOf(onboarding, ".ob-grow-counts"))?.[1] ?? 0);
  await until(() => memories() >= 4 || s.fast, "memories on the graph", 120_000);
  s.say("Coere reads her chats with Claude and grows the graph as it goes.");
  await s.wait(brief(4800));
  s.say("Cori works away in the corner. She can close the page, and the build goes on.");
  await s.wait(brief(4200));
  // The rest of the build happens off camera in the film; here it ends now.
  memory.finish();
  // Skipping ahead to a later chapter, the finish screen's play is not waited for.
  if (s.fast) return leave(s, onboarding);
  await s.waitFor(onboarding, role("heading", "Your memory is ready."), 60_000);
  s.say("Cori finishes the graph with his hammer.");
  await s.wait(brief(3000) + brief(600));
  await until(() => /\d+ memor(y|ies) in \d+ sections?\./.test(textOf(onboarding, ".ob-finish-end")) || s.fast, "the finish line");
  s.say("Your memory is ready. Cori offers to show Maya around.");
  await s.wait(brief(1800));
  return leave(s, onboarding);
}

/** Off camera: Extract all is put away, and the dashboard was paired with coere-server on her Mac (v3/apps.ts pair). */
function leave(s: Stage, onboarding: Tab): Tab {
  clearBatch(s.world);
  return onboarding;
}

type Term = { prompt(): HTMLElement; ran(): void; line(text: string): void; done(): void; clear(): void };
const term = (tab: Tab) => (tab.win as unknown as { __term: Term }).__term;

/** Types a command after the prompt, key by key, and presses Enter (stage/terminal.ts run). */
async function run(s: Stage, shell: Tab, command: string): Promise<void> {
  term(shell).prompt();
  await s.type(shell, command, 38);
  await s.wait(260);
  await s.press(shell, "Enter", 0);
  term(shell).ran();
}

/** Prints what the command printed, a line at a time, as a program writes it. */
async function print(s: Stage, shell: Tab, out: string, lineMs = 45): Promise<void> {
  for (const line of out.replace(/\s+$/, "").split("\n")) {
    term(shell).line(line);
    await s.wait(lineMs);
  }
  term(shell).done();
}

/** The Apps section, with the server's address hidden: it names this computer and a port, which a film of Maya's Mac would not (v3/apps.ts openApps). */
async function openApps(s: Stage): Promise<Tab> {
  const page = await s.open("apps", `${LIB}console-v3.html?tab=apps`);
  const style = page.doc.createElement("style");
  style.textContent = ".cx-apps-url{visibility:hidden}";
  page.doc.head.append(style);
  await s.waitFor(page, ".cx-apps");
  await s.waitFor(page, text(/Connected\./));
  return page;
}

/** Right Option pressed and let go alone, as Cori's keys read it (tests/e2e/helpers/content/agent.ts tapOption). */
async function tapOption(s: Stage, tab: Tab): Promise<void> {
  const target = focused(tab.doc) ?? tab.doc.body;
  const base = { key: "Alt", code: "AltRight", location: 2, bubbles: true, cancelable: true, composed: true };
  target.dispatchEvent(new tab.win.KeyboardEvent("keydown", { ...base, altKey: true }));
  await new Promise((r) => setTimeout(r, 60));
  target.dispatchEvent(new tab.win.KeyboardEvent("keyup", { ...base, altKey: false }));
  await s.wait(0);
}

/**
 * A chapter that opens on a new page. Played through, the chapter starts
 * before the page opens, so a run asked to end there ends on the shot
 * before; skipped to, it starts once the page is on screen, so a short
 * showcase opens on it.
 */
async function opening<T>(s: Stage, id: string, open: () => Promise<T>): Promise<T> {
  const through = !s.fast;
  if (through) s.chapter(id);
  const tab = await open();
  if (!through) s.chapter(id);
  return tab;
}

/** v3/apps.ts allowPlanner: the planner asks from its code, the Allow card shows the same code, and Allow gives it its token. */
async function anAppAsks(s: Stage, memory: FilmWorld, before: Tab): Promise<Tab> {
  const shell = await opening(s, "asks", async () => {
    const tab = await s.open("shell", "terminal.html?title=event-planner");
    await s.film(tab);
    s.close(before);
    return tab;
  });
  s.say("The event planner is a small app of Maya’s. It asks Coere for access from its own code.");
  const { connect } = APPS.terminal;
  await run(s, shell, connect.command);
  await s.wait(600);
  // The planner asks the server; the next pass brings the ask to the dashboard.
  memory.step("asked");
  term(shell).line(connect.asked);
  await s.wait(3200);

  // Skipping ahead to a later chapter, Allow is given without the page, which no later chapter shows again.
  if (s.fast) memory.step("allowed");
  else {
    const apps = await openApps(s);
    const card = ".cx-apps-allow";
    await s.waitFor(apps, role("heading", "Allow planner to access Coere memory?"), 30_000);
    await s.film(apps);
    s.say("On the Apps page, a card asks Maya to allow it, with the same code.");
    await s.wait(4200);
    s.say("She checks what it may do, and allows it.");
    await s.click(apps, role("button", /^Allow$/, { within: card, exact: true }), { after: 400 });
    await until(() => !s.has(apps, card), "the Allow card to go", 30_000);
    await s.rest();
    await s.wait(2600);
    await s.film(shell);
    s.close(apps);
  }
  s.say("The planner gets its token, and keeps it to itself.");
  term(shell).line(connect.allowed);
  term(shell).done();
  await s.wait(3000);
  return shell;
}

/** v3/apps.ts sameContext: the SDK prints the context for the draft; on ChatGPT the same words get the same memories. */
async function sameContext(s: Stage, shell: Tab): Promise<Tab | null> {
  s.chapter("context");
  term(shell).clear();
  s.say("Any app can ask for the context a chat would get for a draft.");
  const { context } = APPS.terminal;
  await run(s, shell, context.command);
  await s.wait(700);
  await print(s, shell, context.out, 40);
  s.say("It prints the memories Coere would add, and where each one sits.");
  await s.wait(3000 + 2200);
  // Skipping ahead to a later chapter, ChatGPT is left out: nothing after it depends on that tab.
  if (s.fast) return null;

  // Cori's tip shows on her first visit to an AI.
  s.world.remove("local", ["coere.cori.hint"]);
  const site = await s.open("chat", "sites/chatgpt.html", { host: "chatgpt.com", person: MAYA });
  // A browser runs the page's microtasks between a real key's listeners; the scripted hand's keys do not, so ProseMirror is told to read the box after each Enter.
  site.win.addEventListener("keydown", (e) => e.key === "Enter" && site.doc.dispatchEvent(new Event("selectionchange")), true);
  const box: Query = ".ProseMirror";
  await s.waitFor(site, box);
  await s.wait(1000);
  await s.film(site);
  const hint = role("status", "Tip from Cori");
  if (await s.waitFor(site, hint, 20_000).then(() => true, () => false)) {
    s.say("The first time she opens an AI, Cori shows how to call him: Right Option.");
    await s.rest();
    await s.wait(2600);
    await s.click(site, box, { after: 300 });
    await s.rest();
    await tapOption(s, site);
    await s.waitFor(site, '[data-testid="agent-panel"]', 10_000).catch(() => null);
    s.say("A tap brings out his chat, and the card is gone for good.");
    await s.wait(2000);
    await s.press(site, "Escape", 600);
  }
  s.say("On ChatGPT, the same words get the same memories, with her prep chat too.");
  await s.click(site, box, { after: 300 });
  if (s.fast) {
    await s.type(site, DRAFT);
  } else await s.type(site, DRAFT, 70);
  const strip: Query = "[data-coere-context-strip] .coere-ctx-strip";
  await s.waitFor(site, (d) => {
    const el = deep(d, "[data-coere-context-strip] .coere-ctx-strip");
    return el && /Adding|Coere will add/.test(el.textContent ?? "") ? el : null;
  }, 30_000);
  await s.click(site, role("button", "Show the memories that go in", { within: strip }), { after: 400 });
  await s.waitFor(site, "#coere-ctx-list");
  await s.rest();
  await s.wait(4800);
  return site;
}

/** v3/planner.ts plannerRun: a plan for a dinner from her memory, each reason naming the memory it came from. */
async function thePlanner(s: Stage, shell: Tab, memory: FilmWorld, site: Tab | null): Promise<void> {
  s.chapter("planner");
  term(shell).clear();
  await s.film(shell);
  if (site) s.close(site);
  s.say("Maya asks the planner for a plan. It reads her memory through Coere.");
  const { plan } = APPS.terminal;
  await run(s, shell, plan.command);
  await s.wait(1200);
  await print(s, shell, plan.out, 70);
  memory.step("used");
  s.say("Each reason names the memory it came from.");
  await s.wait(6000);
}

/** v3/planner.ts sentAndRevoke: what it was sent, each memory it got chat by chat, then Revoke. */
async function sentAndRevoke(s: Stage, shell: Tab): Promise<void> {
  const sent = ".cx-apps-sent";
  const apps = await opening(s, "sent", async () => {
    const tab = await openApps(s);
    const el = await s.waitFor(tab, sent, 30_000);
    el.scrollIntoView({ block: "nearest" });
    await s.film(tab);
    s.close(shell);
    return tab;
  });
  s.say("On the Apps page, the planner shows when it was last used.");
  await s.wait(2400);
  s.say("What it was sent lists every memory it got, chat by chat.");
  await s.click(apps, `${sent} summary`, { after: 400 });
  await s.waitFor(apps, ".cx-apps-chat", 20_000);
  if (s.has(apps, ".cx-apps-chat .cx-apps-path-btn")) await s.click(apps, ".cx-apps-chat .cx-apps-path-btn", { after: 400 });
  await s.rest();
  await s.wait(4500);

  s.chapter("revoke");
  s.say("Revoke takes its token away. It stops working at once.");
  await s.click(apps, role("button", /^Revoke$/, { exact: true }), { after: 500 });
  // The confirm is the last Revoke on the page.
  const revokes = () => [...apps.doc.querySelectorAll("button")].filter((b) => b.textContent?.trim() === "Revoke" && b.getClientRects().length > 0);
  await until(() => revokes().length > 1 || !s.has(apps, sent), "the confirm");
  if (revokes().length > 1) await s.click(apps, () => revokes().at(-1), { after: 600 });
  await until(() => !s.has(apps, sent), "the sent list to go", 30_000);
  await s.rest();
  await s.wait(3000);
  s.say("Coere v3: your memory, shared with the apps you allow.");
  await s.card("Coere v3", "One memory, for your chats and your apps.", 3500);
  s.close(apps);
}

async function film(s: Stage): Promise<void> {
  const memory = current!;

  memory.fast = () => s.fast;
  const onboarding = await setUp(s, memory);
  const shell = await anAppAsks(s, memory, onboarding);
  const site = await sameContext(s, shell);
  await thePlanner(s, shell, memory, site);
  await sentAndRevoke(s, shell);
  // For whoever works on the film: calls the baked answers or the World did not cover.
  if (memory.missed.length) console.log("MISSED", JSON.stringify([...new Set(memory.missed)]));
  if (s.world.unanswered.length) console.log("UNANSWERED", JSON.stringify([...new Set(s.world.unanswered.map((u) => `${u.tab} ${u.type}`))]));
}

/**
 * Maya is on a Mac, as coere-v2's films were made on one (stage/fixture.ts
 * gives the pages macOS client hints), so Cori's tip names Right Option:
 * each tab's navigator says macOS from the moment its page is there,
 * before Coere starts on it at the page's load (lib/os.ts reads it).
 */
function onAMac(): void {
  const mark = (frame: HTMLIFrameElement) => {
    const tick = () => {
      if (!frame.isConnected) return;
      const win = frame.contentWindow as (Window & { __mac?: boolean }) | null;
      try {
        if (win && win.location.href !== "about:blank" && !win.__mac) {
          Object.defineProperty(win.navigator, "userAgentData", { value: { platform: "macOS", mobile: false, brands: [] }, configurable: true });
          win.__mac = true;
        }
      } catch {
        // Not there yet.
      }
      if (!win?.__mac || frame.contentDocument?.readyState !== "complete") setTimeout(tick, 0);
    };
    tick();
    frame.addEventListener("load", () => tick());
  };
  new MutationObserver((changes) => {
    for (const c of changes) for (const n of c.addedNodes) if (n instanceof HTMLIFrameElement) mark(n);
  }).observe(document.documentElement, { childList: true, subtree: true });
}

onAMac();
play({ title: "Coere v3: apps", chapters: CHAPTERS }, film, setup);
