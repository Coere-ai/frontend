import type { PlatformId } from "@coere/core";
import { PLATFORMS } from "@coere/platforms";
import { BATCH_KEY, type Batch } from "@v2/apps/extension/src/lib/batch-types";
import { deep, deepAll, nameOf, shown } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import { label, scrollTops, winOf } from "./helpers";
import type { Mem } from "./memory";

/**
 * The Coere for Teams first run (tools/demo-video/teams/first-run.ts): the
 * company card filled in for Fernhill Creative with its first clients,
 * Maya's AIs, Extract all, the build step and the graph growing into
 * Company and Clients, then the finish.
 */
const LISTED = 4;

/** A form field by its label's words, as getByLabel finds it. */
const field = (words: string | RegExp) =>
  label(`the field ${String(words)}`, (doc: Document) => {
    const match = (t: string) => (typeof words === "string" ? t.trim().startsWith(words) : words.test(t.trim()));
    for (const l of doc.querySelectorAll("label")) {
      if (!match(l.textContent ?? "")) continue;
      const el = (l.htmlFor ? doc.getElementById(l.htmlFor) : l.querySelector("input, select, textarea")) as HTMLElement | null;
      if (el && shown(el)) return el;
    }
    return deepAll(doc, "input, select, textarea").find((el) => shown(el) && match(el.getAttribute("aria-label") ?? nameOf(el))) ?? null;
  });

const aiBox = (id: PlatformId) => label(`the ${id} box`, (doc: Document) => deep(doc, `.cx-ai[data-platform="${id}"] [role="checkbox"], .cx-ai[data-platform="${id}"] input[type="checkbox"]`));
const bigButton = label("the big button", (doc: Document) => doc.querySelector<HTMLElement>(".ob-save"));

/** The AIs Maya's chats are on, in the order first seen, as agencyPlatforms() lists them. */
export const agencyPlatforms = (mem: Mem): PlatformId[] => [...new Set(mem.chats.map((c) => c.platform))];

/** The first clients a person lists on the first run, one per line, each with its website. */
const clientLines = (mem: Mem, count: number): string =>
  mem.corpus.record.clients
    .slice(0, count)
    .map((c) => [c.name, ...c.domains].join(", "))
    .join("\n");

/** Puts a select on a value, as selectOption does after the click that opened it. */
function selectValue(tab: Tab, el: Element | null, value: string): void {
  const select = el as HTMLSelectElement | null;
  if (!select) return;
  select.value = value;
  select.dispatchEvent(new (winOf(tab).Event)("input", { bubbles: true }));
  select.dispatchEvent(new (winOf(tab).Event)("change", { bubbles: true }));
}

/** Text put in at once, as a paste or Playwright's insertText does. */
function insertText(tab: Tab, text: string): void {
  if (!tab.doc.execCommand("insertText", false, text)) {
    const box = tab.doc.activeElement as HTMLTextAreaElement;
    box.value += text;
    box.dispatchEvent(new (winOf(tab).InputEvent)("input", { bubbles: true, inputType: "insertFromPaste", data: text }));
  }
}

/**
 * The tabs Extract all opens, as chrome.tabs.get answers for them: each is
 * open on its AI in a window of its own. The demo's chrome has no tabs, so
 * the page asks about them here (console/runtime/chrome-runtime.ts).
 */
function knowTabs(s: Stage, tab: Tab): void {
  const tabs = (tab.win as unknown as { chrome: { tabs: Record<string, unknown> } }).chrome.tabs;
  tabs.get = async (id: number) => {
    const batch = s.world.stores.session?.[BATCH_KEY] as Batch | undefined;
    const platform = batch?.entries.find((e) => e.tabId === id)?.platform;
    const host = PLATFORMS.find((p) => p.id === platform)?.hosts[0];
    if (!host) throw new Error(`No tab with id: ${id}.`);
    return { id, windowId: 1, index: id - 2000, url: `https://${host}/`, status: "complete", active: false, discarded: false, frozen: false, title: "" };
  };
}

export async function firstRun(s: Stage, mem: Mem): Promise<Tab> {
  const record = mem.corpus.record;
  s.chapter("install");
  s.say("Coere for Teams builds one memory of the company, its people and its clients.");
  // The title card shows while the first run's page opens behind it.
  const [onboarding] = await Promise.all([s.open("onboarding", "/preview/live/lib/onboarding-v2-solution.html"), s.card("Coere for Teams", "One memory of your company and its clients.", 3000)]);
  knowTabs(s, onboarding);
  const card = label("Your company", (doc: Document) => deepAll(doc, 'section, [role="region"]').find((el) => shown(el) && nameOf(el) === "Your company") ?? null);
  await s.waitFor(onboarding, card);

  s.chapter("company");
  await s.film(onboarding);
  s.say("The first run asks for the company once, with its clients.");
  await s.click(onboarding, field("Company name"), { after: 150 });
  await s.type(onboarding, record.company.name, 50);
  await s.click(onboarding, field("What does it do?"), { after: 100 });
  selectValue(onboarding, field("What does it do?")(onboarding.doc), "agency");
  s.say("Maya pastes the first clients, each with its website.");
  await s.click(onboarding, field(/^Your clients/), { after: 150 });
  insertText(onboarding, clientLines(mem, LISTED));
  await s.waitFor(onboarding, label("the client count", (doc: Document) => {
    const c = card(doc);
    return c && (c.textContent ?? "").includes(`${LISTED} clients`) ? c : null;
  }));
  await s.wait(1200);
  await s.click(onboarding, field("Your name"), { after: 100 });
  await s.type(onboarding, record.self.name, 40);
  await s.click(onboarding, field("Your role"), { after: 100 });
  await s.type(onboarding, record.self.role, 40);
  s.say("Then the AIs she uses at work, and Save.");
  for (const id of agencyPlatforms(mem)) await s.click(onboarding, aiBox(id), { after: 350 });
  await s.wait(500);
  await s.click(onboarding, bigButton, { after: 300 });
  await s.rest();
  // Ticking the AIs scrolled the page down; the rows start at its top.
  scrollTops(onboarding);
  return onboarding;
}

const button = (name: string) => label(`the ${name} button`, (doc: Document) => deepAll(doc, "button").find((b) => shown(b) && nameOf(b) === name) ?? null);
const heading = (text: string | RegExp) =>
  label(`the heading ${String(text)}`, (doc: Document) => deepAll(doc, "h1, h2").find((h) => shown(h) && (typeof text === "string" ? nameOf(h) === text : text.test(nameOf(h)))) ?? null);

export async function extractAll(s: Stage, onboarding: Tab): Promise<void> {
  s.chapter("extract");
  await s.film(onboarding);
  s.say("Extract all saves every chat from each AI.");
  await s.wait(5000);
  const done = button("Done");
  await s.waitFor(onboarding, done, 60_000);
  await s.wait(1600);
  await s.click(onboarding, done, { after: 200 });
  await s.waitFor(onboarding, heading("Coere is now going to build your company's memory"));
  await s.waitFor(onboarding, label("the estimate", (doc: Document) => {
    const el = doc.querySelector(".ob-estimate");
    return el && /for [\d,]+ chats\./.test(el.textContent ?? "") ? el : null;
  }), 30_000);
  await s.wait(900);
}

export async function theBuild(s: Stage, onboarding: Tab, mem: Mem): Promise<void> {
  s.chapter("build");
  s.say("Cori asks what to build the company's memory from.");
  await s.glide(onboarding, label("the checklist", (doc: Document) => deepAll(doc, '[role="group"], fieldset').find(shown) ?? null));
  await s.wait(3600);
  await s.click(onboarding, button("Build my memory"), { after: 200 });
  await s.rest();
  await s.waitFor(onboarding, label("the growing graph", (doc: Document) => doc.querySelector(".ob-grow-canvas")));
  s.say("The graph grows into Company and Clients as Coere reads the chats.");
  // Skipping ahead, the build's end is enough: the finish screen's own animation is not waited out.
  if (s.fast) {
    while (mem.written !== null) await new Promise((r) => setTimeout(r, 50));
    return;
  }
  await s.waitFor(onboarding, heading("Your memory is ready."), 60_000);
  s.say("The memory is ready.");
  await s.wait(4000);
}
