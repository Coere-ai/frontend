import { deepAll, role, text, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { Film } from "./film";
import { buildEnd, call, clearDock, graphSays, sectionSpot, settledDrawn, spotOf, textOf, until } from "./helpers";

/**
 * The film's script, from coere-v2 tools/demo-video/v2.demo.ts and its
 * parts in v2/ (first-run, memory, later, pearx), cut down to four
 * chapters at a quicker pace: onboarding, the import of every chat,
 * memory built and looked through, and memory going into a new chat.
 * The same pages, clicks and typed text as coere-v2's scripts, with
 * fewer of them and shorter holds.
 */
const ONBOARDING = "onboarding.html";
const PLATFORMS = ["chatgpt", "claude", "gemini"] as const;
const MAYA = { name: "Maya Collins", first: "Maya", initials: "MC" };

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

/** While recording, the real library takes its own time over the saves: the film waits for it, so the next part starts from all of them. */
async function saved(s: Stage, f: Film, chats: number): Promise<void> {
  if (!f.recording) return;
  const end = Date.now() + 300_000;
  while ((await call<{ conversations: number }>(s, "stats"))?.conversations < chats && Date.now() < end) await new Promise((r) => setTimeout(r, 1000));
}

/** Asks memory for its status each second until stopped (only while recording, so the answers go on the tape). */
function watchStatus(s: Stage): { stop(): void } {
  let on = true;
  void (async () => {
    while (on) {
      await call(s, "memory.status");
      await new Promise((r) => setTimeout(r, 1000));
    }
  })();
  return { stop: () => void (on = false) };
}

/** v2/first-run.ts: the opening card, then onboarding, where Maya picks her three AIs and Save starts Extract all. */
async function onboardingPart(s: Stage, f: Film): Promise<Tab> {
  s.chapter("onboarding");
  await f.phase("start");
  const onboarding = await s.open("onboarding", ONBOARDING);
  s.say("Coere builds your memory from your chats and adds it to new ones as you type.");
  await s.card("Coere", "A memory of you, built from your chats with every AI.", 2400);
  await s.waitFor(onboarding, ".cx-ai");
  await shoot(s, onboarding);
  s.say("Installing opens onboarding. Maya picks the AIs she uses.");
  await s.wait(700);
  for (const id of PLATFORMS) await s.click(onboarding, (d) => d.querySelector(`.cx-ai[data-platform="${id}"] [role="checkbox"], .cx-ai[data-platform="${id}"] input[type="checkbox"]`), { after: 250 });
  s.say("Save starts Extract all on each of them.");
  await f.phase("extract", { actions: ["extract"], ms: 7000 });
  await s.click(onboarding, ".ob-save", { after: 300 });
  await s.rest();
  return onboarding;
}

/** v2/first-run.ts and v2/later.ts: Extract all's row for each AI fills as it saves her 324 chats; then, on Claude, new chats save by themselves. */
const CLAUDE_BOX = 'fieldset div.ProseMirror[contenteditable="true"]';
const chatAt = (n: number): Query => (d) => d.querySelectorAll(".fake-chat-list a, .fake-chat-list li")[n] ?? null;

async function importPart(s: Stage, f: Film, onboarding: Tab): Promise<void> {
  await s.waitFor(onboarding, ".ob-rows .ob-row");
  s.chapter("import");
  s.say("Extract all reads each AI and saves every chat, with a live row for each.");
  const done = role("button", "Done", { exact: true });
  await s.waitFor(onboarding, done, 60_000);
  await saved(s, f, 324);
  await f.phase("held");
  s.say("All 324 chats are saved on this computer.");
  await s.wait(1900);

  // Her three new chats on Claude save when she opens it.
  await f.phase("arrive", { actions: ["fresh"], gap: 250 });
  const site = await s.open("claude", "sites/claude.html", { host: "claude.ai", person: MAYA });
  await s.waitFor(site, CLAUDE_BOX);
  await shoot(s, site);
  s.say("New chats save by themselves. Her three newest on Claude are saved when she opens it.");
  await s.glide(site, chatAt(0));
  await s.wait(700);
  await s.glide(site, chatAt(2));
  await s.wait(1900);
  await saved(s, f, 327);
  await s.rest();
  leave(site);
  await shoot(s, onboarding);
  await s.click(onboarding, done, { after: 200 });
}

/**
 * v2/first-run.ts and v2/memory.ts: Build my memory, the graph growing as
 * memory reads every chat, Cori's finish, then the Memory page: the whole
 * graph, a section opened with a click, and a person found by name.
 */
const SECTION = "School";
const PERSON = "Elena Lindqvist";
const SEARCH = role("combobox", "Search memory and chats");

/** Opens the Memory page off camera and finds the section on its graph, while Cori finishes. */
async function prepareMemory(s: Stage, f: Film): Promise<{ page: Tab; hex: string | null }> {
  // Memory finishes its last stage (links and search vectors) off camera, so the page shows no work going on.
  await buildEnd(s);
  await f.phase("memory");
  const page = await s.open("memory", "console.html?tab=memory");
  await s.waitFor(page, SEARCH);
  await clearDock(page);
  // While the player skips ahead the section is found only if the Memory page is where it stops.
  if (s.fast) return { page, hex: null };
  await settledDrawn(page);
  return { page, hex: await sectionSpot(s, page, SECTION) };
}

async function memoryPart(s: Stage, f: Film, onboarding: Tab): Promise<Tab> {
  s.chapter("memory");
  await s.waitFor(onboarding, text("Coere is now going to build your memory", "h1"));
  await until(onboarding, () => /for [\d,]+ chats\./.test(textOf(onboarding, ".ob-estimate")));
  const chats = /for ([\d,]+) chats\./.exec(textOf(onboarding, ".ob-estimate"))?.[1] ?? "her";
  s.say("Then Coere builds her memory. Nothing goes to an AI until she says yes.");
  await s.glide(onboarding, role("group", "What should Coere build memory from?"));
  await s.wait(1500);
  await f.phase("build", { ms: 2000 });
  await s.click(onboarding, role("button", "Build my memory"), { after: 200 });
  await s.rest();

  // Sorting the chats draws no graph yet, so the shot picks up once memories are on it.
  const memories = () => Number(/^([\d,]+) memor/.exec(textOf(onboarding, ".ob-grow-counts"))?.[1]?.replace(/,/g, "") ?? 0);
  await until(onboarding, () => memories() >= 4, 300_000);
  await f.phase("grow", { ms: 12_000 });
  // Recording, the film looks at memory's status each second as the build runs, so the tape holds it as it was when Cori's finish asks for it.
  const watching = f.recording ? watchStatus(s) : null;
  s.say(`It reads all ${chats} chats, and the graph grows as it goes.`);
  await s.wait(5200);
  s.say("Cori works away in the corner. She could close the page, and the build goes on.");
  await s.wait(4000);

  // The build has ended when Cori's finish play starts; skipping past it unseen, Skip ends it at once.
  const finish = await s.waitFor(onboarding, ".ob-finish-skip, .ob-finish-show", 600_000);
  watching?.stop();
  await f.phase("ready");
  if (s.fast && finish.classList.contains("ob-finish-skip")) (finish as HTMLElement).click();
  s.say("Cori finishes the graph with his hammer.");
  const ready = prepareMemory(s, f);
  // She watches him for a moment, then Skip shows the whole graph at once.
  await s.wait(4500);
  // Skipped already when skipping ahead; and the play can end by itself while the pointer moves to Skip.
  if (!s.fast && s.has(onboarding, ".ob-finish-skip")) await s.click(onboarding, ".ob-finish-skip", { after: 300 }).catch(() => undefined);
  await s.waitFor(onboarding, role("heading", "Your memory is ready."), 60_000);
  const counted = () => /[\d,]+ memor(?:y|ies) in \d+ sections?/.exec(textOf(onboarding, ".ob-finish-end"))?.[0];
  await until(onboarding, () => Boolean(counted()));
  s.say(`Her memory is ready: ${counted()}.`);
  await s.wait(2000);

  const { page, hex: found } = await ready;
  leave(onboarding);
  await shoot(s, page);
  s.say("The Memory page draws all of it, with Maya in the middle and a section for each part of her life.");
  await s.wait(3000);
  s.say("A click opens a section, with its folders and memories.");
  const hex = found ?? (s.fast ? null : (await settledDrawn(page), await sectionSpot(s, page, SECTION)));
  const spot = hex ? spotOf(page, hex) : null;
  if (spot) await s.clickAt(page, spot, { after: 0 });
  if (spot) await until(page, () => graphSays(page) === `Showing ${SECTION} up close.`);
  await s.rest();
  await s.wait(2800);
  await s.press(page, "Escape", 700);

  s.say("Search finds a person, and her sheet says how to reach her.");
  await s.click(page, SEARCH, { after: 150 });
  await s.type(page, PERSON, 50);
  await s.waitFor(page, text(/^\d+ results?$/), 20_000);
  await s.wait(600);
  await s.press(page, "Enter");
  const sheet = (d: Document) => [...d.querySelectorAll('[role="complementary"], aside')].find((el) => el.querySelector('[aria-label="Identity"], section[aria-label="Identity"]')) ?? null;
  await s.waitFor(page, sheet, 20_000);
  await s.rest();
  await s.wait(3400);
  await s.click(page, role("button", "Close", { within: sheet }), { after: 300 });
  await s.rest();
  return page;
}

/**
 * v2/pearx.ts and the strip's own specs (fake-memory-search, fake-context-smart):
 * in a fresh ChatGPT chat Maya asks for help with her interview, the blue line
 * says what Coere will add, the list shows it, Add memory brings in a memory
 * she picks with what belongs with it, Ask Cori adds more on his own, and one
 * Enter sends it all. The draft is the owner's, "Help me prepare for this interview".
 */
const DRAFT = "Help me prepare for this interview";
const GPT_BOX = 'div#prompt-textarea.ProseMirror[contenteditable="true"]';
const STRIP = "[data-coere-context-strip] .coere-ctx-strip";
const LIST = "#coere-ctx-list";
/** The word Maya looks for with Add memory: her startup, which the interview is about. */
const WORD = "Tidepool";
const WIDGET = 'section[aria-label="Search memory"]';
/** What Maya asks Cori for, and the prep chat his deeper look brings in with it. */
const CORI_ASK = "my launch day talk";
const PREP = "PearX interview prep";

async function features(s: Stage, f: Film, replies: readonly string[], memory: Tab): Promise<void> {
  await f.phase("pearx");
  const site = await s.open("chatgpt", "sites/chatgpt.html", { host: "chatgpt.com", person: MAYA, replies });
  await s.waitFor(site, GPT_BOX);
  await s.wait(600);
  s.chapter("features");
  leave(memory);
  await shoot(s, site);
  s.say("In a new chat on ChatGPT, Maya asks for help with her interview.");
  await s.click(site, GPT_BOX, { after: 250 });
  await s.type(site, DRAFT, 60);
  await until(site, () => textOf(site, STRIP).includes("PearX"), 30_000);
  await s.rest();
  s.say("As she types, the blue line says what Coere will add: who she is, and her PearX interview.");
  await s.glide(site, STRIP);
  await s.wait(2600);

  s.say("The list shows what goes in.");
  await s.click(site, role("button", "Show the memories that go in", { within: STRIP }), { after: 300 });
  await s.waitFor(site, LIST);
  await s.rest();
  await s.wait(1500);

  s.say("Add memory searches her memory. A pick goes in with what belongs with it.");
  await s.click(site, role("button", "Add memory", { exact: true, within: LIST }), { after: 400 });
  const widget = await s.waitFor(site, WIDGET);
  await s.type(site, WORD, 70);
  await s.waitFor(site, ".coere-ctx-mem-row", 20_000);
  await s.wait(1000);
  await s.click(site, ".coere-ctx-mem-row", { after: 300 });
  await until(site, () => !widget.isConnected, 10_000).catch(() => undefined);
  await s.rest();
  await s.wait(1300);

  s.say("Ask Cori brings in more: she asks for her launch day talk, and he adds her prep chats too.");
  await s.click(site, role("button", "Ask Cori", { exact: true, within: LIST }), { after: 300 });
  await s.type(site, CORI_ASK, 55);
  await s.wait(300);
  await s.press(site, "Enter");
  await until(site, () => textOf(site, LIST).includes(PREP), 30_000);
  await s.wait(400);
  deepAll(site.doc, `${LIST} .coere-ctx-group`)
    .find((g) => /Cori added/.test(g.textContent ?? ""))
    ?.scrollIntoView({ block: "nearest" });
  await s.wait(2400);
  await s.click(site, role("button", "Hide the list", { within: STRIP }), { after: 300 });

  s.say("One Enter sends it all, with her context in front of the draft.");
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
  await s.wait(1500);
  s.say("ChatGPT starts from the work she already did.");
  await until(site, () => site.doc.documentElement.hasAttribute("data-fake-replied"), 30_000);
  await s.wait(2600);
  leave(site);
}

export async function script(s: Stage, f: Film, replies: readonly string[]): Promise<void> {
  leaving.splice(0);
  const onboarding = await onboardingPart(s, f);
  await importPart(s, f, onboarding);
  const memory = await memoryPart(s, f, onboarding);
  await features(s, f, replies, memory);
}
