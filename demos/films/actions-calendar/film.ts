import { play } from "../../stage/player";
import { deepAll, shown, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";
import { actionsWorld, type ActionsWorld } from "./bridge";
import { consoleWorld } from "./console-world";
import { answerAction } from "./cori";

/**
 * Coere Actions in Google Calendar, ported beat by beat from coere-v2's
 * tools/demo-video/actions-calendar.demo.ts: Maya asks Cori on the
 * dashboard's Cori page for a design review with two people at a time in
 * New York, under Human Review. The plan waits for Start, the review card
 * shows the event with its guests before anything is saved, and Cori
 * fills and saves it in his own Calendar tab with the invitations. Then,
 * at Autonomous, a due date comes from her memory. Every surface is
 * Coere's own code: the dashboard, Cori's chat with its plan and cards,
 * the run in the service worker's RunManager, and the page script with
 * its Calendar recipe and overlay in coere-v2's fake Calendar.
 */

const CHAPTERS = [
  { id: "ask", title: "Ask Cori" },
  { id: "review", title: "Review the event" },
  { id: "saved", title: "Saved" },
  { id: "memory", title: "From your memory" },
];

const EVENT = "put a design review with sam lee and priya raman on my calendar for november 19 at 2pm new york time and invite them";
const DUE = "add my cs 162 project 3 due date to my calendar";
const DASHBOARD = "/preview/live/lib/console-v2.html";
const BROWSER_USE = "coere.browser_use";

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

/** The Browser Use record (lib/browser-use.ts), as Settings writes it after Allow. */
function browserUse(world: World, level: "review" | "autonomous"): void {
  world.write("local", { [BROWSER_USE]: { on: true, level, model: "bolt", blocked: [], grantedAt: Date.now() } });
}

function setup(world: World): void {
  pinStage();
  actions = actionsWorld(world, () => stageNow !== null && !stageNow.fast);
  (window as unknown as { __demo: { extra: Record<string, unknown> } }).__demo.extra.calendar = actions.bridge;
  consoleWorld(world);
  // Cori said hello on an earlier day; she has Human Review on.
  world.write("local", { "coere.cori.hello": { at: Date.now() - 86_400_000 } });
  browserUse(world, "review");
  world.on("cori.ask", (m) => answerAction(String((m.input as { line?: string } | undefined)?.line ?? "")));
}

const conv = ".cx-cori-page";

/** Elements in Cori's conversation, inside the shadow roots its cards are drawn in too. */
const inConv = (doc: Document, selector: string): Element[] => {
  const scope = doc.querySelector(conv);
  return scope ? deepAll(scope, selector) : [];
};

/** The last drawn element in Cori's conversation whose own text is exactly `words`, as a locator's `.last()` finds it. */
const lastText = (words: string, selector = "*"): Query => (doc) =>
  inConv(doc, selector)
    .filter((el) => shown(el) && (el.textContent ?? "").replace(/\s+/g, " ").trim() === words && ![...el.children].some((c) => (c.textContent ?? "").trim() === words))
    .at(-1);

const lastButton = (words: string): Query => (doc) =>
  inConv(doc, "button")
    .filter((el) => shown(el) && (el.textContent ?? "").replace(/\s+/g, " ").trim() === words)
    .at(-1);

/** How many times Cori's conversation shows a line now. */
const countText = (tab: Tab, words: string): number =>
  inConv(tab.doc, "*").filter((el) => el.children.length === 0 && (el.textContent ?? "").trim() === words).length;

/** Types a line into the Cori page's box at a person's pace and sends it. */
async function ask(s: Stage, page: Tab, line: string): Promise<void> {
  await s.click(page, `${conv} textarea`, { after: 200 });
  await s.type(page, line, 45);
  await s.wait(350);
  await s.press(page, "Enter");
  await s.rest();
}

/** Waits, polling, until a test holds. */
async function until(test: () => boolean, what: string, timeout = 120_000): Promise<void> {
  const end = Date.now() + timeout;
  while (!test()) {
    if (Date.now() > end) throw new Error(`never: ${what}`);
    await new Promise((r) => setTimeout(r, 50));
  }
}

/** Cori's own tab, once the run opened it and it loaded. */
async function coriTab(timeout = 90_000): Promise<Tab> {
  const end = Date.now() + timeout;
  for (;;) {
    const tab = actions!.tab();
    if (tab) {
      await actions!.settled();
      return tab;
    }
    if (Date.now() > end) throw new Error("Cori's tab never opened");
    await new Promise((r) => setTimeout(r, 50));
  }
}

const liveEvents = () => actions!.bridge.store.events.filter((e) => e.deletedAt === null);

async function film(s: Stage): Promise<void> {
  stageNow = s;
  actions!.stage = s;

  s.say("Cori can put events on Maya's calendar.");
  const opening = s.open("cori", `${DASHBOARD}?tab=cori`);
  await s.card("Coere Actions: Calendar", "Cori adds events from your words and your memory.", 2600);
  const page = await opening;
  await s.waitFor(page, `${conv} textarea`);
  await s.film(page);

  s.chapter("ask");
  s.say("Maya asks for a meeting with two people, at a time in New York.");
  await ask(s, page, EVENT);
  await s.waitFor(page, lastText("Here's my plan"), 30_000);
  s.say("She has Human Review on, so the plan waits for Start.");
  await s.wait(2600);
  await s.click(page, lastButton("Start"), { after: 400 });
  await s.rest();

  s.chapter("review");
  const save = lastText("Allow Cori to save this event in Google Calendar");
  await s.waitFor(page, save, 90_000);
  s.say("Before anything is saved, Cori shows the event: the title, 2 PM New York time, and both guests from her memory.");
  await s.glide(page, save);
  await s.wait(4200);
  await s.click(page, lastButton("Allow"), { after: 300 });
  await s.rest();

  s.chapter("saved");
  const calendar = await coriTab();
  await s.waitFor(calendar, "coere-layer", 60_000).catch(() => undefined);
  await s.film(calendar);
  s.say("In his own Calendar tab, Cori fills in the event, adds the guests and saves it with the invitations.");
  await until(() => /^(done|stopped|stuck)$/.test(actions!.status()) && liveEvents().length === 1, "the event saved");
  await s.wait(2600);
  s.say("It sits at 11 AM on her calendar, which is 2 PM in New York.");
  await s.wait(3200);

  browserUse(s.world, "autonomous");
  await s.film(page);
  s.say("The chat says it was added, with Delete event if she changes her mind.");
  await s.waitFor(page, lastText("Event added to your calendar"), 30_000);
  await s.glide(page, lastText("Event added to your calendar"));
  await s.wait(3200);

  s.chapter("memory");
  s.say("A date she never typed comes from her memory. With Autonomous on, Cori just does it.");
  await ask(s, page, DUE);
  await until(() => liveEvents().length === 2, "the due date saved");
  await until(() => countText(page, "Event added to your calendar") >= 2, "the second result in the chat", 30_000);
  await s.wait(3000);

  await actions!.settled();
  await s.film(calendar);
  s.say("Both are on her calendar now.");
  await s.wait(1000);
  // Her due date is an all day event, at the top of the week, above the hours the week opens on.
  await s.glide(calendar, (doc) => doc.querySelectorAll("[data-day]")[3]);
  await s.wheel(calendar, -480, 16);
  await s.rest();
  const due = calendar.doc.querySelector(".allday .ev")?.getBoundingClientRect();
  if (due) {
    await s.camera({ x: due.x + due.width / 2 - 420, y: 0, w: 840 }, 1100);
    await s.wait(2000);
    await s.camera(null, 900);
  } else await s.wait(2200);
  await s.click(calendar, '[aria-label="Next week"]', { after: 300 });
  await s.rest();
  await s.wait(3000);
  await s.card("Coere Actions", "Cori acts in your browser, and asks before anything you did not ask for.", 2600);
  s.say("Cori only invites the people you name.");
  if (s.world.unanswered.length) console.log("unanswered", JSON.stringify([...new Set(s.world.unanswered.map((u) => u.type))]));
}

play({ title: "Coere Actions: Calendar", chapters: CHAPTERS }, film, setup);
