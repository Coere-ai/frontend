import { deep, deepAll, nameOf, resolve as resolveQuery, role, shown, text, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { Film } from "./film";
import { DAYS } from "./days";
import type { VoiceBackEnd } from "./voice";
import type { ActionsWorld } from "./actions";
import type { WorkersBackEnd } from "./workers";
import { buildEnd, clearDock, graphSays, key, sectionSpot, settledDrawn, tapOption, textOf, until } from "./helpers";

/**
 * The film's script, ported from coere-v2 tools/demo-video/v2.demo.ts and
 * its parts in v2/ (first-run, tour, memory, later, pearx, voice, act,
 * forget): the same pages, clicks, typed text, order and pacing. Each
 * part says in its comment which of coere-v2's files it follows.
 */
const ONBOARDING = "onboarding.html";
const PLATFORMS = ["chatgpt", "claude", "gemini"] as const;

const resolveIn = (tab: Tab, q: Query) => resolveQuery(tab.doc, q);

/**
 * Tabs the film is done with stay under the next shot until it is on
 * screen, as a person's browser keeps a tab open until they switch away,
 * so nothing blank shows while the next page loads.
 */
const leaving: Tab[] = [];
const leave = (tab: Tab): void => void leaving.push(tab);
async function shoot(s: Stage, tab: Tab): Promise<void> {
  await s.film(tab);
  for (const t of leaving.splice(0)) if (t !== tab) s.close(t);
}

/** A sheet by its name, as getByRole('complementary') finds it: an aside, or anything with that role. */
const complementary = (name: string): Query => (d) =>
  deepAll(d, 'aside, [role="complementary"]').find((el) => shown(el) && nameOf(el) === name) ?? null;

/** v2/first-run.ts: the opening card, onboarding with Maya's three AIs, Extract all, the build step, the graph growing, the finish. */
async function firstRun(s: Stage, f: Film): Promise<Tab> {
  s.chapter("install");
  await f.phase("start");
  const onboarding = await s.open("onboarding", ONBOARDING);
  s.say("Coere builds your memory from your chats and adds it to new ones while you type.");
  await s.card("Coere", "A memory of you, built from your chats with every AI.", 3000);
  await s.waitFor(onboarding, ".cx-ai");
  await shoot(s, onboarding);
  s.say("Installing opens onboarding. Cori asks which AIs you use.");
  await s.wait(2600);

  s.chapter("choose-your-ais");
  s.say("Maya uses ChatGPT, Claude and Gemini.");
  for (const id of PLATFORMS) await s.click(onboarding, (d) => d.querySelector(`.cx-ai[data-platform="${id}"] [role="checkbox"], .cx-ai[data-platform="${id}"] input[type="checkbox"]`), { after: 500 });
  await s.wait(600);
  s.say("Save starts Extract all on each of them.");
  await f.phase("extract", { actions: ["extract"], gap: 120 });
  await s.click(onboarding, ".ob-save", { after: 300 });
  await s.rest();

  s.chapter("extract-all");
  await s.waitFor(onboarding, ".ob-rows .ob-row");
  s.say("Extract all reads each AI and saves every chat, with a row for each.");
  const done = role("button", "Done", { exact: true });
  await s.waitFor(onboarding, done, 60_000);
  await f.phase("held");
  s.say("Every chat is saved on this computer.");
  await s.wait(2200);
  await s.click(onboarding, done, { after: 200 });

  s.chapter("build-your-memory");
  await s.waitFor(onboarding, text("Coere is now going to build your memory", "h1"));
  await until(onboarding, () => /for \d+ chats\./.test(textOf(onboarding, ".ob-estimate")));
  await s.wait(900);
  s.say("Cori asks what to build memory from. Nothing goes to an AI until Maya says yes.");
  await s.glide(onboarding, role("group", "What should Coere build memory from?"));
  await s.wait(3000);
  s.say("New chats will save by themselves, and context goes into new chats as she types.");
  await s.glide(onboarding, ".ob-switches");
  await s.wait(2400);
  await f.phase("build", { ms: 2600 });
  await s.click(onboarding, role("button", "Build my memory"), { after: 200 });
  await s.rest();

  // Sorting the chats draws no graph yet, so the shot picks up once memories are on it.
  const memories = () => Number(/^(\d+) memor/.exec(textOf(onboarding, ".ob-grow-counts"))?.[1] ?? 0);
  await until(onboarding, () => memories() >= 4, 300_000);
  s.chapter("the-graph-grows");
  await f.phase("grow", { ms: 24_000 });
  s.say("Coere reads her chats with Claude and grows the graph as it goes.");
  await s.wait(4800);
  s.say("Cori works away in the corner. She can close the page, and the build goes on.");
  await s.wait(4200);

  // The build has ended when Cori's finish play starts; skipping past it unseen, Skip ends it at once.
  const finish = await s.waitFor(onboarding, ".ob-finish-skip, .ob-finish-show", 600_000);
  s.chapter("your-memory-is-ready");
  await f.phase("ready");
  if (s.fast && finish.classList.contains("ob-finish-skip")) (finish as HTMLElement).click();
  s.say("Cori finishes the graph with his hammer.");
  await s.waitFor(onboarding, role("heading", "Your memory is ready."), 60_000);
  await s.wait(1600);
  await until(onboarding, () => /\d+ memor(y|ies) in \d+ sections?\./.test(textOf(onboarding, ".ob-finish-end")));
  s.say("Your memory is ready. Cori offers to show Maya around.");
  await s.wait(1800);
  return onboarding;
}

/** v2/tour.ts: Show me around turns the tab into the dashboard, and Cori lights one part at a time; two steps, then Skip tour. */
const SAID: Readonly<Record<string, string>> = {
  "Your AIs": "The tour starts at Home, with the AIs Maya uses.",
  "Your memory": "Then the graph: Maya in the middle, a section for each part of her life.",
};

async function tour(s: Stage, f: Film, onboarding: Tab): Promise<ReturnType<typeof prepareMemory>> {
  s.chapter("coris-tour");
  await f.follow(onboarding, () => s.click(onboarding, role("button", "Show me around"), { after: 200 }));
  const memory = prepareMemory(s, f);
  await s.rest();
  const dialog = role("dialog", "Tour of Coere");
  await s.waitFor(onboarding, dialog, 20_000);
  for (let i = 0; i < 2; i++) {
    await s.wait(300);
    s.say(SAID[textOf(onboarding, ".cx-tour-title").trim()] ?? "");
    await s.wait(3200);
    if (i === 1) break;
    await s.click(onboarding, role("button", "Next", { within: dialog }), { after: 700 });
  }
  s.say("");
  await s.click(onboarding, role("button", "Skip tour", { within: dialog }), { after: 600 });
  leave(onboarding);
  return memory;
}

/** v2/memory.ts: the Memory page on the first day, a section opened with a click, and a person found by name. */
const SECTION = "School";
const PERSON = "Elena Lindqvist";
const SEARCH = role("combobox", "Search memory and chats");

/** Opens the Memory page off camera and finds the section on its graph, while the tour still plays. */
async function prepareMemory(s: Stage, f: Film): Promise<{ page: Tab; spot: { x: number; y: number } | null }> {
  // Memory finishes its last stage (links and search vectors) off camera, so the page shows no work going on.
  await buildEnd(s);
  await f.phase("memory");
  const page = await s.open("memory", "console.html?tab=memory");
  await s.waitFor(page, SEARCH);
  await clearDock(page);
  // While the player skips ahead the section is found only if the Memory page is where it stops.
  if (s.fast) return { page, spot: null };
  await settledDrawn(page);
  return { page, spot: await sectionSpot(s, page, SECTION) };
}

async function memoryPage(s: Stage, ready: Promise<{ page: Tab; spot: { x: number; y: number } | null }>): Promise<Tab> {
  const { page, spot: found } = await ready;
  s.chapter("your-memory");
  await shoot(s, page);
  s.say("The Memory page draws what Coere knows, with Maya in the middle.");
  await s.wait(3000);
  s.say("A click opens a section, with its folders and memories.");
  const spot = found ?? (s.fast ? null : (await settledDrawn(page), await sectionSpot(s, page, SECTION)));
  if (spot) await s.clickAt(page, spot, { after: 0 });
  if (spot) await until(page, () => graphSays(page) === `Showing ${SECTION} up close.`);
  await s.rest();
  await s.wait(3200);
  await s.press(page, "Escape", 900);

  s.say("Search finds a person, whose sheet starts with how to reach them.");
  await s.click(page, SEARCH, { after: 150 });
  await s.type(page, PERSON, 60);
  await s.waitFor(page, text(/^\d+ results?$/), 20_000);
  await s.wait(900);
  await s.press(page, "Enter");
  const sheet = (d: Document) => [...d.querySelectorAll('[role="complementary"], aside')].find((el) => el.querySelector('[aria-label="Identity"], section[aria-label="Identity"]')) ?? null;
  await s.waitFor(page, sheet, 20_000);
  await s.rest();
  await s.wait(3000);
  s.say("Under it, what her chats say about Elena, each with the chat it came from.");
  await s.wait(2000);
  await s.click(page, role("button", "Close", { within: sheet }), { after: 400 });
  await s.rest();
  return page;
}

/** v2/later.ts and stage/hint.ts: six days later new chats save by themselves on a visit, Cori's tip shows once, the graph grows; then Home on the last day. */
const CLAUDE_BOX = 'fieldset div.ProseMirror[contenteditable="true"]';

async function daysLater(s: Stage, f: Film, firstDay: Tab): Promise<void> {
  leave(firstDay);
  s.chapter("new-chats-come-in");
  s.say("Six days later, Maya has new chats on ChatGPT, Claude and Gemini.");
  const card = s.card("Six days later", "Maya has had 4 new chats on her AIs.", 2400);
  f.day(DAYS.waveOne);
  await f.phase("waveOne", { clock: "waveOne" });
  // The Memory page opens on the new day while the card shows.
  const page = await s.open("memory-6", "console.html?tab=memory");
  await s.waitFor(page, SEARCH);
  await clearDock(page);
  await settledDrawn(page, 20_000, s.fast);
  await card;
  // Cori's tip shows on the first visit to an AI.
  s.world.remove("local", ["coere.cori.hint"]);
  await f.phase("arrive", { actions: ["waveOne"], gap: 900, claude: 1500 });
  const site = await s.open("claude", "sites/claude.html", { host: "claude.ai", person: MAYA });
  await s.waitFor(site, CLAUDE_BOX);
  await s.wait(800);
  await shoot(s, site);
  s.say("When she opens an AI, Coere saves her new chats by itself.");
  await s.glide(site, ".fake-sidebar-scroll");
  await s.wait(2200);
  const hint = role("status", "Tip from Cori");
  await s.waitFor(site, hint, 20_000);
  s.say("The first time she opens an AI, Cori shows how to call him: Right Option.");
  await s.rest();
  await s.wait(2600);
  await s.click(site, CLAUDE_BOX, { after: 300 });
  await s.rest();
  await tapOption(site);
  await s.waitFor(site, '[data-testid="agent-panel"]');
  s.say("A tap brings out his chat, and the card is gone for good.");
  await s.wait(2000);
  await s.press(site, "Escape", 600);
  await f.phase("reading", { ms: 7000 });
  await shoot(s, page);
  s.say("Then it reads them, and the graph grows.");
  await s.rest();
  await s.wait(6500);
  s.say("");
  leave(site);
  await buildEnd(s);

  s.say("Six more days pass, and more chats come in.");
  const today = s.card("Today", "Six more days of chats.", 2200);
  f.day(DAYS.today);
  await f.phase("today", { clock: "today", actions: ["waveTwo"], gap: 150, claude: 0, ms: 2000 });
  leave(page);
  // The day's chats are saved and read while the card shows, as in the film.
  await buildEnd(s);
  await f.phase("home");
  const home = await s.open("home", "console.html?tab=home");
  await until(home, () => /memor(y|ies) from [\d,]+ chats?$/.test(textOf(home, ".cx-summary .sm-headline")));
  await clearDock(home);
  await today;
  await shoot(s, home);
  s.say("Home counts what Coere remembers, and Recently saved leads with the newest chats.");
  await s.glide(home, ".sm-recent-title");
  await s.wait(3600);
  await s.rest();
  leave(home);
}

/**
 * v2/pearx.ts: in a fresh ChatGPT chat Maya asks for help with her interview, the blue line says
 * what Coere will add, the list shows it and the buttons for more, and one Enter sends it all.
 * The draft is the owner's, "Help me prepare for this interview"; for it the real memory adds her
 * PearX interview memories, and Maya adds her prep chat herself with Add chat.
 */
const DRAFT = "Help me prepare for this interview";
const GPT_BOX = 'div#prompt-textarea.ProseMirror[contenteditable="true"]';
const STRIP = "[data-coere-context-strip] .coere-ctx-strip";
const LIST = "#coere-ctx-list";
const PREP = "PearX interview prep";
const MAYA = { name: "Maya Collins", first: "Maya", initials: "MC" };

async function pearx(s: Stage, f: Film, replies: readonly string[]): Promise<void> {
  await f.phase("pearx");
  const site = await s.open("chatgpt", "sites/chatgpt.html", { host: "chatgpt.com", person: MAYA, replies });
  await s.waitFor(site, GPT_BOX);
  await s.wait(1500);
  s.chapter("context-as-you-type");
  await shoot(s, site);
  s.say("In a fresh chat on ChatGPT, Maya asks for help with her PearX interview.");
  await s.click(site, GPT_BOX, { after: 300 });
  await s.type(site, DRAFT, 75);
  await until(site, () => textOf(site, STRIP).includes("PearX"), 30_000);
  await s.rest();
  s.say("The blue line says what Coere will add: who she is, and her memories about the PearX interview.");
  await s.glide(site, STRIP);
  await s.wait(3400);

  s.say("The list shows what goes in, and the buttons that bring in more.");
  await s.click(site, role("button", "Show the memories that go in", { within: STRIP }), { after: 400 });
  await s.waitFor(site, LIST);
  await s.rest();
  await s.wait(2600);
  s.say("Add chat finds her prep chat by name, and it goes in too.");
  await s.click(site, role("button", "Add chat", { exact: true, within: LIST }), { after: 500 });
  await s.waitFor(site, role("textbox", "Search your chats", { within: LIST }));
  await s.type(site, "PearX", 90);
  const add = role("button", `Add ${PREP}`, { exact: true, within: "#coere-ctx-more-chats" });
  await s.waitFor(site, add, 20_000);
  await s.wait(700);
  await s.click(site, add, { after: 600 });
  await until(site, () => textOf(site, STRIP).includes(`'${PREP}'`), 20_000);
  await s.press(site, "Escape", 500);
  for (const name of ["Add memory", "Ask Cori"]) {
    await s.glide(site, role("button", name, { exact: true, within: LIST }));
    await s.wait(700);
  }
  await s.wait(600);
  await s.click(site, role("button", "Hide the list", { within: STRIP }), { after: 300 });

  s.say("One Enter puts the chat in as a file, with her context in front of the draft, and sends.");
  (site.doc.querySelector(GPT_BOX) as HTMLElement).focus();
  await s.press(site, "End");
  await s.press(site, "Enter");
  await until(site, () => ((site.win as unknown as { __coereFakeSentText?: string[] }).__coereFakeSentText ?? []).length >= 1, 30_000);
  await s.rest();
  // The site clears its box and the file beside it once a message is sent; the stand in leaves both, so they are cleared here.
  (site.doc.querySelector(GPT_BOX) as HTMLElement).focus();
  site.doc.execCommand("selectAll");
  site.doc.execCommand("delete");
  site.doc.querySelectorAll(".fake-file-chip").forEach((chip) => chip.remove());
  await s.wait(2400);
  s.say("ChatGPT starts from the work she already did.");
  await until(site, () => site.doc.documentElement.hasAttribute("data-fake-replied"), 30_000);
  await s.wait(3000);
  leave(site);
}

/**
 * v2/voice.ts: with Voice mode on (turned on in Settings off camera), Maya holds Right Option on
 * ChatGPT, Cori's card listens with her words as she says them, and letting go sends them; Cori
 * answers in his chat and out loud (in silence here, as in the film). voice.ts is the back end.
 */
const FAKE_LINE = "What can you do?";
const voiceCard = (d: Document) => deep(d, '[data-testid="voice-card"][data-place="corner"]');

async function voiceChapter(s: Stage, f: Film, voice: VoiceBackEnd): Promise<void> {
  await f.phase("voice");
  s.world.write("local", { "coere.voice": { v: 1, on: true, speak: true, rate: "normal" } });
  const site = await s.open("voice", "sites/chatgpt.html", { host: "chatgpt.com", person: MAYA });
  (site.win as unknown as { chrome: { runtime: { connect: unknown } } }).chrome.runtime.connect = voice.connect("voice", "https://chatgpt.com/");
  await voice.ready;
  await s.waitFor(site, GPT_BOX);
  await s.wait(1200);
  s.chapter("voice-mode");
  await shoot(s, site);
  s.say("With Voice mode on, she holds Right Option and asks Cori out loud.");
  await s.wait(1600);
  key(site, "Alt", { code: "AltRight", location: 2, type: "keydown" });
  await until(site, () => voiceCard(site.doc)?.getAttribute("data-phase") === "listening", 10_000);
  const words = () => (deep(voiceCard(site.doc) ?? site.doc, '[data-testid="voice-words"]')?.textContent ?? "").trim();
  await until(site, () => words() === FAKE_LINE, 15_000);
  await s.wait(1200);
  key(site, "Alt", { code: "AltRight", location: 2, type: "keyup" });
  s.say("She lets go. Cori answers in his chat and says it out loud.");
  await s.waitFor(site, (d) => deep(d, '[data-testid="agent-panel"] [data-turn="answer"]'), 30_000);
  await s.glide(site, '[data-testid="agent-panel"]');
  await s.wait(3800);
  await s.rest();
  await s.press(site, "Shift");
  leave(site);
}

/**
 * v2/act.ts askCoriToAct: with Browser Use on (turned on off camera, as Settings turns it on), Maya
 * asks the Cori page for an email in her own words, picks which Sam, and watches Cori write it in
 * his own Gmail tab, in her style, with Take over and Stop on the bar. actions.ts is the worker part.
 */
const SAM = "sam.lee@northfield.edu";
const inCori = (selector: string) => (d: Document) => [...d.querySelectorAll(`.cx-cori-page ${selector}`)];
const lastText = (words: string): Query => (d) => inCori("*")(d).filter((el) => el.children.length === 0 && el.textContent?.trim() === words).at(-1) ?? null;

async function askCoriToAct(s: Stage, f: Film, actions: ActionsWorld): Promise<Tab> {
  await f.phase("act", { scenario: "actions-maya" });
  s.world.write("local", { "coere.browser_use": { on: true, level: "autonomous", model: "bolt", blocked: [], grantedAt: f.now() } });
  s.chapter("ask-cori-to-act");
  s.say("With Browser Use on, Cori can act in her browser too.");
  const opening = s.open("cori", "console.html?tab=cori");
  await s.card("Cori", "An optional app built on the same memory.", 2400);
  const page = await opening;
  await s.waitFor(page, ".cx-cori-page textarea");
  // The page opens on her last chat with Cori, the one she spoke; the email goes in a chat of its own.
  const fresh = resolveIn(page, role("button", "New chat", { within: ".cx-cori-page" })) as HTMLElement | null;
  fresh?.click();
  await s.waitFor(page, (d) => inCori("*")(d).find((el) => /Hi, I.m Cori\./.test(el.textContent ?? "") && el.children.length === 0) ?? null);
  await shoot(s, page);
  s.say("On the Cori page she asks for an email in her own words, and Cori shows his plan.");
  await s.click(page, ".cx-cori-page textarea", { after: 200 });
  await s.type(page, "email sam about moving friday to monday", 45);
  await s.wait(350);
  await s.press(page, "Enter");
  await s.rest();
  await s.waitFor(page, lastText("You said Sam. I found two. Is it this one?"), 60_000);
  s.say("Two people in her mail are called Sam, so he asks which one.");
  await s.wait(2200);
  await s.click(page, role("button", SAM, { within: ".cx-cori-page" }), { after: 300 });
  await s.rest();

  const end = Date.now() + 60_000;
  while (!actions.tab() && Date.now() < end) await new Promise((r) => setTimeout(r, 50));
  const gmail = actions.tab();
  if (!gmail) throw new Error("Cori's Gmail tab never opened");
  await actions.settled();
  await s.waitFor(gmail, "coere-layer", 60_000).catch(() => undefined);
  await shoot(s, gmail);
  s.say("He writes it in his own Gmail tab, in her style. Take over and Stop are on the bar.");
  await until(gmail, () => (gmail.doc.querySelector('[aria-label="Message Body"]')?.textContent ?? "").includes("Thanks"), 90_000);
  await s.wait(450);
  await s.wait(2800);
  await until(gmail, () => actions.manager.live().length === 0, 120_000);
  await shoot(s, page);
  s.say("The draft waits in Gmail for her to send.");
  await s.glide(page, lastText("Draft saved in Gmail"));
  await s.wait(2600);
  await s.rest();
  leave(gmail);
  return page;
}

/**
 * v2/act.ts, its workers part: a bigger search split across workers, each in a tab of its own, with a
 * live preview of each in the chat; their finds merge into one table. workers.ts runs them. The long
 * middle of the search passes quickly, as the film cut it.
 */
async function workersPart(s: Stage, f: Film, page: Tab, workers: WorkersBackEnd): Promise<void> {
  await f.phase("workers", { scenario: "actions-maya" });
  s.chapter("workers");
  s.say("A bigger search is split across workers, each in a tab of its own.");
  await s.click(page, ".cx-cori-page textarea", { after: 200 });
  await s.type(page, "find 20 biotech companies with leads", 45);
  await s.wait(350);
  await s.press(page, "Enter");
  await s.rest();
  const cards = (d: Document) => inCori(".cw-grid .cw-cards > li")(d)[0] ?? null;
  await s.waitFor(page, cards, 60_000);
  await s.wait(3600);
  workers.setTempo(s.fast ? 60 : 12);
  const table = (d: Document) => inCori(".cw-table")(d).at(-1) ?? null;
  await s.waitFor(page, table, 400_000);
  await until(page, () => workers.tabs() === 0, 60_000);
  workers.setTempo(1);
  (await s.waitFor(page, table)).scrollIntoView({ block: "nearest" });
  await s.wait(400);
  s.say("Their finds merge into one table, each value with the page it came from.");
  await s.wait(3400);
}

/** v2/forget.ts statistics: Dev Tools in Settings, and the Statistics page it shows, with the interview send counted. */
async function statistics(s: Stage, f: Film): Promise<void> {
  await f.phase("statistics");
  const page = await s.open("settings", "console.html?tab=settings");
  const devTools = role("switch", "Enable Dev Tools");
  await s.waitFor(page, devTools);
  await clearDock(page);
  s.chapter("statistics");
  (await s.waitFor(page, devTools)).scrollIntoView({ block: "center" });
  await shoot(s, page);
  s.say("In Settings, Enable Dev Tools adds Statistics to the dashboard.");
  await s.click(page, devTools, { after: 600 });
  await until(page, () => resolveIn(page, devTools)?.getAttribute("aria-checked") === "true");
  await s.click(page, role("tab", "Statistics", { within: role("tablist", "Sections") }), { after: 300 });
  await s.waitFor(page, role("heading", "AI usage"), 20_000);
  await s.rest();
  s.say("It counts the tokens memory saved on her PearX send, and what building it cost.");
  await s.wait(4500);
  leave(page);
}

/** v2/forget.ts forgetTopic: Maya asks Cori to delete everything about a project, sees it all lit on the graph, and confirms. */
const TOPIC = "Sparrowhawk";
/** Cori's chat box and his newest line, on the Cori page or in v1's sheet (cori-dashboard.ts). */
const CORI_BOX = '[data-testid="coere-cori"] textarea, .cx-cori-page textarea';

async function forgetTopic(s: Stage, f: Film): Promise<void> {
  await f.phase("forget");
  const page = await s.open("memory-12", "console.html?tab=memory");
  await s.waitFor(page, SEARCH);
  await clearDock(page);
  await settledDrawn(page, 20_000, s.fast);
  s.chapter("delete-a-topic");
  await shoot(s, page);
  s.say(`Maya asks Cori to delete everything about ${TOPIC}, her old side project.`);
  await s.click(page, ".cx-cori-seat", { after: 500 });
  const fresh = role("button", "New chat", { within: ".cx-cori-page" });
  if (s.has(page, fresh)) await s.click(page, fresh, { after: 400 });
  await s.click(page, CORI_BOX, { after: 150 });
  await s.type(page, `delete everything about ${TOPIC}`, 55);
  await s.press(page, "Enter");
  const last = (d: Document) => {
    const all = d.querySelectorAll(':is([data-testid="coere-cori"], .cx-cori-page) :is([data-turn="answer"], [data-turn="said"])');
    return all[all.length - 1] ?? null;
  };
  await until(page, () => (resolveIn(page, last)?.textContent ?? "").includes(`about ${TOPIC}`), 30_000);
  await until(page, () => !page.doc.querySelector(".cr-typed"), 15_000);
  await s.wait(1800);
  s.say("Cori counts what it found. Review shows all of it first.");
  await s.click(page, role("button", "Review", { within: last }), { after: 300 });
  const sheet = complementary(`Delete everything about ${TOPIC}?`);
  await s.waitFor(page, sheet, 20_000);
  await s.rest();
  s.say("The graph lights the project and its memories, and the sheet says what goes.");
  await s.wait(4000);
  await s.click(page, role("button", "Delete", { exact: true, within: sheet }), { after: 300 });
  const receipt = complementary(`Delete everything about ${TOPIC}`);
  await until(page, () => textOf(page, receipt).includes("Checked: nothing about it is left in your memory."), 60_000);
  s.say("Then Coere checks that nothing about it is left.");
  await s.rest();
  await s.wait(2800);
  await s.click(page, role("button", "Done", { within: receipt }), { after: 400 });
  leave(page);
}

export async function script(s: Stage, f: Film, replies: readonly string[], voice: VoiceBackEnd, actions: ActionsWorld, workers: WorkersBackEnd): Promise<void> {
  leaving.splice(0);
  f.day(DAYS.start);
  const onboarding = await firstRun(s, f);
  const firstDay = await memoryPage(s, await tour(s, f, onboarding));
  await daysLater(s, f, firstDay);
  await pearx(s, f, replies);
  await voiceChapter(s, f, voice);
  const cori = await askCoriToAct(s, f, actions);
  await workersPart(s, f, cori, workers);
  leave(cori);
  await statistics(s, f);
  await forgetTopic(s, f);
  s.say("Coere v2: a memory built from your chats, added as you type, and an app that acts on it.");
  await s.card("Coere", "Your memory, from every AI, in every new chat.", 3500);
}
