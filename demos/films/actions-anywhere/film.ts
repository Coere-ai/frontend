import { BROWSER_USE_KEY } from "@v2/apps/extension/src/lib/browser-use";
import type { createPagesStore } from "@v2/tests/fake-pages/store";
import type { fakePages } from "@v2/tests/fake-pages/hosts";
import { play } from "../../stage/player";
import { role, text, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";
import { actionsWorld, type ActionsWorld } from "./bridge";
import { consoleWorld } from "./console-world";
import { answerAction } from "./cori";

/**
 * Coere Actions on any site, after coere-v2's
 * tools/demo-video/actions-anywhere.demo.ts: on her class's quiz Maya asks
 * Cori from the toolbar popup to do the questions. Cori reads the page as
 * text, answers each question and asks before he submits. On the clinic's
 * intake form he fills what her memory holds and leaves the rest. On a
 * practice quiz whose link tells Coere what to do, he stops. Every surface
 * is Coere's own code: the toolbar popup with Cori's chat, his plan and
 * the task card, the run in the service worker's RunManager, and the page
 * script with its glow, control bar and cards on coere-v2's own fake quiz
 * and form pages, served by their own servers.
 */

const CHAPTERS = [
  { id: "quiz", title: "A quiz" },
  { id: "answers", title: "Cori answers" },
  { id: "submit", title: "Submit asks you" },
  { id: "form", title: "A form from memory" },
  { id: "research", title: "Research across sites" },
  { id: "orders", title: "A page that gives orders" },
];

const QUIZ = "https://quiz.northfield.edu/quiz/3/q/1";
const FORM = "https://forms.harborclinic.org/intake";
const PRACTICE = "https://quiz.northfield.edu/quiz/4/q/1";
const SEARCH = "https://www.google.com/";
const STOPPED = "This page asked me to do something you didn't ask for. I stopped.";

type Servers = { fakePages: typeof fakePages; createPagesStore: typeof createPagesStore };

let actions: ActionsWorld | null = null;
let stageNow: Stage | null = null;
let servers: Promise<Servers> | null = null;

/** coere-v2's fake page servers, bundled beside the film (sites.mjs), loaded once. */
function loadServers(): Promise<Servers> {
  servers ??= new Promise<Servers>((done, fail) => {
    const script = document.createElement("script");
    script.src = "fake-pages.js";
    script.onload = () => done((globalThis as unknown as { __fakePages: Servers }).__fakePages);
    script.onerror = () => fail(new Error("fake-pages.js did not load"));
    document.head.append(script);
  });
  return servers;
}

/**
 * A page in a tab that scrolls an element into view (the kit's clicks do)
 * also scrolls the frames' boxes in the top page, which never scroll in a
 * browser window; each such scroll is put back at once.
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
  (window as unknown as { __demo: { extra: Record<string, unknown> } }).__demo.extra.anywhere = actions.bridge;
  consoleWorld(world);
  // Browser Use is on, Autonomous with Bolt, as Settings writes it after Allow.
  world.write("local", { [BROWSER_USE_KEY]: { on: true, level: "autonomous", model: "bolt", blocked: [], grantedAt: Date.now() - 86_400_000 } });
  world.on("cori.ask", (m) => answerAction(String((m.input as { line?: string } | undefined)?.line ?? "")));
}

/** Opens a site's page in a tab, and keeps the tab's document current through the page's own loads. */
async function openPage(s: Stage, name: string, url: string): Promise<Tab> {
  const tab = await s.open(name, `page.html?at=${encodeURIComponent(url)}`);
  tab.frame.addEventListener("load", () => {
    tab.doc = tab.frame.contentDocument!;
    tab.win = tab.frame.contentWindow!;
  });
  return tab;
}

/**
 * The toolbar popup over a page, as a press on Coere's toolbar button
 * opens it, and a line asked of Cori in it at a person's pace. The popup
 * stays open on his answer until the film cuts away.
 */
async function askInPopup(s: Stage, under: Tab, line: string, said: string): Promise<Tab> {
  actions!.active = under.name;
  const popup = await s.open("popup", "popup.html");
  popup.frame.style.background = "transparent";
  await s.waitFor(popup, '[data-testid="ap-tab-cori"]');
  const shown = s.film(popup);
  under.frame.classList.add("on");
  await shown;
  s.say(said);
  await s.click(popup, '[data-testid="ap-tab-cori"]', { after: 300 });
  await s.click(popup, '[data-testid="ap-ask"]', { after: 200 });
  await s.type(popup, line, 50);
  await s.press(popup, "Enter");
  await s.rest();
  return popup;
}

/** Waits, polling fast, until a tab's page holds a text, through the page's own loads. */
async function whenShown(tab: Tab, words: string, timeout = 120_000): Promise<void> {
  const until = Date.now() + timeout;
  while (!(tab.doc.body?.textContent ?? "").includes(words)) {
    if (Date.now() > until) throw new Error(`${tab.name} never showed ${words}`);
    await new Promise((r) => setTimeout(r, 40));
  }
}

/** Holds the shot until the newest run reaches a status. */
async function untilRun(status: RegExp, timeout = 120_000): Promise<void> {
  const until = Date.now() + timeout;
  while (!status.test(actions!.status())) {
    if (Date.now() > until) throw new Error(`the run never reached ${status}; it is ${actions!.status()}`);
    await new Promise((r) => setTimeout(r, 50));
  }
}

/** Scrolls under the pointer, a turn of the wheel at a time, until the end of what a selector finds is in view. */
async function wheelTo(s: Stage, tab: Tab, selector: string): Promise<void> {
  for (let i = 0; i < 24; i++) {
    const el = [...tab.doc.querySelectorAll(selector)].at(-1);
    const box = el?.getBoundingClientRect();
    if (!box || box.bottom <= 430) return;
    await s.wheel(tab, Math.min(140, box.bottom - 420), 8);
    await s.wait(60);
  }
}

/** A sideways swipe on a trackpad over a box that scrolls sideways, as the browser scrolls it. */
async function swipe(s: Stage, tab: Tab, selector: string, dx: number, steps = 16): Promise<void> {
  const box = [...tab.doc.querySelectorAll(selector)].at(-1) as HTMLElement | undefined;
  if (!box) return;
  const r = box.getBoundingClientRect();
  await s.moveTo({ x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 120) });
  for (let i = 0; i < steps; i++) {
    const go = box.dispatchEvent(new tab.win.WheelEvent("wheel", { bubbles: true, cancelable: true, deltaX: dx / steps, clientX: r.left + r.width / 2, clientY: r.top + 60 }));
    if (go) box.scrollBy({ left: dx / steps });
    await s.wait(30);
  }
}

/** A button of Coere's layer on the page, by its words. */
const layerButton = (words: string): Query => (doc) =>
  [...(doc.querySelector("coere-layer")?.shadowRoot?.querySelectorAll("button") ?? [])].find((b) => b.textContent?.trim() === words && b.getBoundingClientRect().width > 0);

async function film(s: Stage): Promise<void> {
  stageNow = s;
  if ((window as unknown as { __debugRun?: boolean }).__debugRun) {
    const chapter = s.chapter.bind(s);
    s.chapter = (id) => (console.log("CHAPTER", id, Math.round(performance.now())), chapter(id));
  }
  actions!.stage = s;
  const pages = await loadServers();
  const store = pages.createPagesStore();
  actions!.usePages(pages.fakePages(store).hosts, store);

  const opening = openPage(s, "quiz", QUIZ);
  await s.card("Coere Actions on any site", "Quizzes, forms and research, with you in charge.", 2600);
  s.say("Cori can work on any page Maya has open.");
  const quiz = await opening;
  await s.waitFor(quiz, "#qh");
  await s.film(quiz);
  s.chapter("quiz");
  s.say("Maya has a ten question quiz for her operating systems class.");
  await s.wait(2600);
  // Cori's first step waits for the next chapter, so it starts on the first question every time.
  let release: () => void = () => undefined;
  actions!.hold = new Promise<void>((done) => (release = done));
  const asked = await askInPopup(s, quiz, "do these questions for me", "She opens Coere from the toolbar and asks Cori to do the questions.");
  await s.waitFor(asked, text("Here's my plan"), 30_000);
  s.say("Cori plans the task on this page and starts.");
  await s.wait(2400);
  s.close(asked);
  await s.film(quiz);

  s.chapter("answers");
  release();
  actions!.hold = null;
  s.say("He reads each question as text, the cheapest way, picks an answer and checks it held.");
  await whenShown(quiz, "Question 4");
  s.say("The bar shows the step he is on, with Take over and Stop.");
  await whenShown(quiz, "Question 8");

  s.chapter("submit");
  await untilRun(/^waiting$/);
  s.say("Submitting cannot be undone, so Cori asks first.");
  await s.wait(3200);
  s.say("Maya is happy with the answers and allows it.");
  await s.wait(300);
  await s.click(quiz, layerButton("Allow"), { after: 400 });
  await s.rest();
  await untilRun(/^(done|failed|stopped|stuck)$/, 60_000);
  await s.wait(2400);

  s.chapter("form");
  const form = await openPage(s, "form", FORM);
  await s.waitFor(form, "#intake");
  await s.film(form);
  s.close(quiz);
  s.say("Next, the intake form for her clinic visit.");
  await s.wait(2400);
  const formAsk = await askInPopup(s, form, "fill in this form with my details", "She asks Cori to fill it in with her details.");
  await s.waitFor(formAsk, text("Here's my plan"), 30_000);
  await s.wait(1600);
  s.close(formAsk);
  await s.film(form);
  s.say("Her name, birth date, email, phone and address come from her memory.");
  await untilRun(/^(waiting|done)$/);
  await s.wait(3000);
  s.say("Fields her memory has nothing for stay empty, and so do the optional questions about who she is.");
  await s.moveTo({ x: 720, y: 600 });
  await s.wheel(form, 1500, 30);
  await s.wait(2600);
  s.say("He never types a password or a card number, and he did not submit. She checks it and sends it herself.");
  await s.wheel(form, 900, 20);
  await s.wait(3600);

  // Research: a list from many sites, read by workers in tabs of their own (coere-actions.md 10).
  s.chapter("research");
  const engine = await openPage(s, "search", SEARCH);
  await s.waitFor(engine, 'input[name="q"]');
  await s.film(engine);
  s.close(form);
  s.say("For her internship search, Maya wants a list of biotech companies in Boston.");
  await s.click(engine, 'input[name="q"]', { after: 200 });
  await s.type(engine, "biotech companies in Boston", 55);
  await s.wait(300);
  await s.press(engine, "Enter", 0);
  // A scripted Enter does not submit a form by itself, as a person's does; the form goes as the browser would send it.
  engine.doc.querySelector<HTMLFormElement>('form[role="search"]')?.requestSubmit();
  await s.rest();
  await whenShown(engine, "About");
  await s.wait(1800);
  const research = await askInPopup(s, engine, "find 10 biotech companies in Boston", "Reading every site herself would take an hour. She asks Cori.");
  const cards = ".cw-grid .cw-cards > li";
  await s.waitFor(research, cards, 60_000);
  await s.camera({ x: 340, y: 0, w: 1100 }, 1100);
  s.say("Cori splits the search across two workers. Each one searches and reads company sites in a tab of its own.");
  await s.wait(2600);
  s.say("The chat shows what each worker sees, live, with its own Stop and Take over.");
  await s.glide(research, cards);
  await s.wait(3000);
  await s.rest();
  s.say("Each company he finds goes into the table as it comes in, with the page it came from.");
  await s.moveTo({ x: 1250, y: 330 });
  await wheelTo(s, research, ".cw-table");
  // She scrolls along as the rows come in.
  for (let t = 0; !s.has(research, text("10 of 10 found")) && t < 120; t++) {
    await s.wait(1000);
    if (t % 3 === 2) await wheelTo(s, research, ".cw-table");
  }
  s.say("No company twice, and no value he could not see on a page.");
  await wheelTo(s, research, ".cw-table");
  await s.wait(1200);
  await swipe(s, research, ".cw-table-scroll", 190);
  await s.wait(3000);
  await s.camera(null, 900);
  s.close(research);

  // A model that obeys what pages say, so the film shows the code stopping a planted line on its own.
  s.chapter("orders");
  actions!.gullible = true;
  const practice = await openPage(s, "practice", PRACTICE);
  await s.waitFor(practice, "#qh");
  await s.film(practice);
  s.close(engine);
  s.say("This practice quiz has a link that speaks to an assistant, not to Maya.");
  await s.glide(practice, role("link", /instruction/i));
  await s.wait(2600);
  const third = await askInPopup(s, practice, "do the practice quiz for me", "She asks Cori to do the quiz.");
  await s.waitFor(third, text(STOPPED), 120_000);
  s.say("The page tried to tell Cori what to do. He stops, and nothing it asked for happens.");
  await s.wait(4200);
  s.say("Cori asks before he submits, and stops when a page tries to give him orders.");
  await s.card("Coere Actions", "Cori never types a password or a card number, and stops when a page gives orders.", 2800);
  s.close(third);
  s.close(practice);
  if (new URLSearchParams(location.search).has("debug")) console.log("UNANSWERED", JSON.stringify([...new Set(s.world.unanswered.map((u) => u.type))]));
}

play({ title: "Coere Actions on any site", chapters: CHAPTERS }, film, setup);
