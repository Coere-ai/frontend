import { play } from "../../stage/player";
import { role, text, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";
import { actionsWorld, type ActionsWorld } from "./bridge";
import { consoleWorld } from "./console-world";
import { answerAction } from "./cori";

/**
 * Coere Actions in Gmail, after coere-v2's tools/demo-video/actions-gmail.demo.ts:
 * Maya turns on Browser Use in Settings, asks Cori on the dashboard's Cori
 * page to email Sam, sees the plan, picks which Sam when Cori asks, and
 * watches Cori work in his own Gmail tab with the glow and the control
 * bar: he reads her past emails with Sam and writes in her style, and the
 * draft is saved. Then a line that says send sends, and Undo send takes
 * it back. Every surface is Coere's own code: the dashboard, Cori's chat
 * and its action cards, the run in the service worker's RunManager, and
 * the page script with its recipes and overlay in fake Gmail.
 */

const CHAPTERS = [
  { id: "browser-use", title: "Turn on Browser Use" },
  { id: "ask", title: "Ask Cori" },
  { id: "plan", title: "The plan" },
  { id: "working", title: "Cori is working" },
  { id: "style", title: "Your style" },
  { id: "draft", title: "Draft saved" },
  { id: "send", title: "Send and undo" },
];

const SAM = "sam.lee@northfield.edu";
const PRIYA = "Priya Raman";
const DASHBOARD = "/preview/live/lib/console-v2.html";

let actions: ActionsWorld | null = null;
let stageNow: Stage | null = null;

/**
 * A page in a tab that scrolls an element into view (the recipes' clicks
 * do) also scrolls the frames' boxes in the top page, which never scroll
 * in a browser window; each such scroll is put back at once.
 */
let pinned = false;
function pinStage(): void {
  if (pinned) return;
  pinned = true;
  document.addEventListener(
    "scroll",
    (e) => {
      const el = e.target;
      if (el instanceof HTMLElement && (el.scrollLeft || el.scrollTop)) {
        el.scrollLeft = 0;
        el.scrollTop = 0;
      }
    },
    true,
  );
}

function setup(world: World): void {
  pinStage();
  (window as unknown as { __debugRun?: boolean }).__debugRun = new URLSearchParams(location.search).has("debug");
  actions = actionsWorld(world, () => stageNow !== null && !stageNow.fast);
  (window as unknown as { __demo: { extra: Record<string, unknown> } }).__demo.extra.gmail = actions.bridge;
  consoleWorld(world);
  // Cori said hello on an earlier day; the voice models are not part of this film.
  world.write("local", { "coere.cori.hello": { at: Date.now() - 86_400_000 } });
  world.on("cori.ask", (m) => answerAction(String((m.input as { line?: string } | undefined)?.line ?? "")));
}

/**
 * Chrome's answers to the dashboard's permission calls: Allow on Settings
 * asks for Gmail and Calendar, and the person says yes in Chrome's own
 * prompt, which is drawn outside the page.
 */
function grantHosts(tab: Tab): void {
  const win = tab.win as unknown as { chrome: object; browser: object };
  const permissions = {
    request: async () => true,
    contains: async () => true,
    remove: async () => true,
    getAll: async () => ({ origins: [], permissions: [] }),
    onAdded: { addListener: () => undefined, removeListener: () => undefined },
    onRemoved: { addListener: () => undefined, removeListener: () => undefined },
  };
  const wrapped = new Proxy(win.chrome, { get: (t, k) => (k === "permissions" ? permissions : Reflect.get(t, k)) });
  win.chrome = wrapped;
  win.browser = wrapped;
}

/** Scrolls a part of a long page to the top of the window, with a little room above it, as the film does before a shot. */
async function toTop(s: Stage, tab: Tab, q: Query, room = 24): Promise<void> {
  const el = await s.waitFor(tab, q);
  el.scrollIntoView({ block: "start" });
  tab.win.scrollBy(0, -room);
  for (let box: Element | null = el.parentElement; box; box = box.parentElement) if (box.scrollHeight > box.clientHeight + 4) box.scrollTop -= room;
}

/** Types a line into the Cori page's box at a person's pace and sends it. */
async function ask(s: Stage, page: Tab, line: string): Promise<void> {
  await s.click(page, ".cx-cori-page textarea", { after: 200 });
  await s.type(page, line, 45);
  await s.wait(350);
  await s.press(page, "Enter");
  await s.rest();
}

/** Waits, polling, until an element of a tab holds a text, through the tab's own loads. */
async function whenShown(s: Stage, tab: Tab, selector: string, words: string, timeout = 60_000): Promise<void> {
  const until = Date.now() + timeout;
  while (!(tab.doc.querySelector(selector)?.textContent ?? "").includes(words)) {
    if (Date.now() > until) throw new Error(`${selector} never showed ${words}`);
    await new Promise((r) => setTimeout(r, 40));
  }
}

/** Waits until the run working now shows these words on its bar, or has gone past them. */
async function untilStep(words: string, timeout = 60_000): Promise<void> {
  const order = ["Opening Gmail", "Finding your recent emails", "Writing the email", "Filling in the email", "Saving the draft", "Sending"];
  const until = Date.now() + timeout;
  for (;;) {
    const now = actions!.step();
    if (now === words || order.indexOf(now) > order.indexOf(words) || actions!.manager.live().length === 0) return;
    if (Date.now() > until) throw new Error(`the run never got to ${words}`);
    await new Promise((r) => setTimeout(r, 40));
  }
}

/** Cori's own tab, once the run opened it and it loaded. */
async function coriTab(timeout = 60_000): Promise<Tab> {
  const until = Date.now() + timeout;
  for (;;) {
    const tab = actions!.tab();
    if (tab) {
      await actions!.settled();
      return tab;
    }
    if (Date.now() > until) throw new Error("Cori's tab never opened");
    await new Promise((r) => setTimeout(r, 50));
  }
}

const conv = (q: string) => `.cx-cori-page ${q}`;

async function film(s: Stage): Promise<void> {
  stageNow = s;
  actions!.stage = s;

  s.chapter("browser-use");
  s.say("Cori can write email for Maya, in her style, from her memory.");
  const opening = s.open("dashboard", `${DASHBOARD}?tab=settings`);
  await s.card("Coere Actions: Gmail", "Cori writes and sends email in your style.", 2600);
  const dashboard = await opening;
  grantHosts(dashboard);
  const card: Query = (doc) => [...doc.querySelectorAll("section.cx-set-card")].find((el) => el.querySelector("h2")?.textContent?.trim() === "Browser Use");
  await toTop(s, dashboard, card);
  const toggle = role("switch", "Coere Browser Use");
  await s.waitFor(dashboard, toggle);
  await s.film(dashboard);
  s.say("In Settings, Maya turns on Coere Browser Use.");
  await s.glide(dashboard, toggle);
  await s.wait(500);
  await s.click(dashboard, toggle, { after: 600 });
  await s.rest();
  s.say("Autonomous and Bolt are the defaults. Human Review asks before each click.");
  await s.wait(3600);

  const page = await s.open("cori", `${DASHBOARD}?tab=cori`);
  await s.waitFor(page, ".cx-cori-page textarea");
  await s.film(page);
  s.chapter("ask");
  s.say("On the Cori page she asks for an email in her own words.");
  await ask(s, page, "email sam about moving friday to monday");

  s.chapter("plan");
  await s.waitFor(page, role("heading", "Here's my plan", { within: ".cx-cori-page" }), 30_000);
  s.say("Cori shows his plan and starts.");
  await s.wait(2600);
  await s.waitFor(page, text("You said Sam. I found two. Is it this one?", "*", { within: ".cx-cori-page" }), 60_000);
  s.say("Two people in her mail are called Sam, so Cori asks which one.");
  await s.wait(2600);
  // The writing call waits for the film here, so the Your style chapter starts at the same place every time.
  let release: () => void = () => undefined;
  actions!.holdWrite = new Promise<void>((done) => (release = done));
  await s.click(page, role("button", SAM, { within: ".cx-cori-page" }), { after: 400 });
  await s.rest();

  const gmail = await coriTab();
  await s.film(gmail);
  s.chapter("working");
  s.say("Cori works in a tab of his own, in the Coere tab group, with a glow around the page.");
  await untilStep("Finding your recent emails");
  await s.wait(2400);
  s.say("He reads her past emails with Sam, then writes in her style. The bar shows each step and Stop.");
  await untilStep("Writing the email");
  await s.wait(600);

  s.chapter("style");
  release();
  await untilStep("Filling in the email");
  if (!s.fast) {
    await whenShown(s, gmail, '[aria-label="Message Body"]', "Thanks");
    s.say("The email is in her voice, signed the way she signs.");
    await whenShown(s, gmail, ".oG", "Draft saved");
    await s.wait(900);
  }

  await s.waitFor(page, text("Draft saved in Gmail", "*", { within: ".cx-cori-page" }), 30_000);
  await s.film(page);
  s.chapter("draft");
  s.say("The draft waits in Gmail, unsent. Open draft or Delete draft are one press away.");
  await s.glide(page, () => [...page.doc.querySelectorAll(conv("*"))].filter((el) => el.children.length === 0 && el.textContent?.trim() === "Draft saved in Gmail").at(-1));
  await s.wait(3400);

  s.chapter("send");
  s.say("When her line says send, Cori sends.");
  // She has seen him read and write; this run goes a little quicker.
  actions!.speed = 0.6;
  await ask(s, page, "send priya an email saying yes to the study group thursday");
  await s.waitFor(page, () => [...page.doc.querySelectorAll(conv("h2, h3, h4, [role=heading]"))].filter((el) => el.textContent?.includes("Here's my plan"))[1], 30_000);
  await s.wait(2200);
  await whenShown(s, gmail, "#compose-root", "Cc", 60_000).catch(() => undefined);
  await s.film(gmail);
  await whenShown(s, gmail, "#toast-root", "Message sent");
  await s.wait(1400);

  const sentLine = () => [...page.doc.querySelectorAll(conv("*"))].filter((el) => el.children.length === 0 && el.textContent?.trim() === `Sent to ${PRIYA}`).at(-1);
  await s.waitFor(page, sentLine, 60_000);
  await s.film(page);
  s.say("Sent to Priya. Undo send takes it back while Gmail still can.");
  await s.glide(page, sentLine);
  await s.wait(1800);
  await s.click(page, () => [...page.doc.querySelectorAll(conv("button"))].filter((el) => el.textContent?.trim() === "Undo send").at(-1), { after: 400 });
  await s.rest();
  await whenShown(s, gmail, "#toast-root", "Sending undone", 30_000);
  await s.wait(700);
  await s.film(gmail);
  s.say("In Gmail the message is back as a draft, unsent.");
  await s.wait(2600);
  await s.card("Coere Actions", "Cori acts in your browser, and asks before anything you did not ask for.", 2600);
  if (new URLSearchParams(location.search).has("debug")) console.log("UNANSWERED", JSON.stringify([...new Set(s.world.unanswered.map((u) => u.type))]));
}

play({ title: "Coere Actions: Gmail", chapters: CHAPTERS }, film, setup);
