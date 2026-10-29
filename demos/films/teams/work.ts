import type { Stage, Tab } from "../../stage/stage";
import { CLIENT, memoryPage } from "./agency";
import type { Mem } from "./memory";
import { clientViews, contextFor, forgetPreview } from "./views";
import { deep, nameOf, shown } from "../../stage/query";
import { clearDock, label, openByName, roleIn, sideSheet, winOf } from "./helpers";

/**
 * The agency at work (tools/demo-video/teams/work.ts): Cori says what the
 * team promised a client, a draft on ChatGPT gets that client's context,
 * one client is exported for a teammate, and everything about another
 * client is deleted.
 */

const coriScope = '[data-testid="coere-cori"], .cx-cori-page';
const coriSeat = label("Ask Cori", (doc: Document) => doc.querySelector<HTMLElement>(".cx-cori-seat"));
const coriBox = label("Cori's box", (doc: Document) => doc.querySelector<HTMLElement>(`:is(${coriScope}) textarea`));
const coriLast = (doc: Document) => [...doc.querySelectorAll(`:is(${coriScope}) :is([data-turn="answer"], [data-turn="said"])`)].at(-1) ?? null;

export async function askCori(s: Stage, page: Tab): Promise<void> {
  s.chapter("cori");
  await s.film(page);
  s.say(`Maya asks Cori what the team promised ${CLIENT}.`);
  await s.click(page, coriSeat, { after: 500 });
  await s.click(page, coriBox, { after: 150 });
  await s.type(page, `what did we promise ${CLIENT}?`, 55);
  await s.press(page, "Enter");
  await s.waitFor(page, label("Cori's answer", (doc: Document) => {
    const last = coriLast(doc);
    return last && /promise/i.test(last.textContent ?? "") && !doc.querySelector(".cr-typed") ? last : null;
  }), 30_000);
  await s.rest();
  s.say("Cori answers from memory, with each promise, its date and the AI it came from.");
  await s.wait(5500);
}

const MAYA = { name: "Maya Collins", first: "Maya", initials: "MC" };
const composer = label("ChatGPT's box", (doc: Document) => doc.querySelector<HTMLElement>(".ProseMirror"));
const strip = label("the context strip", (doc: Document) => deep(doc, ".coere-ctx-strip"));
const hintCard = label("Cori's tip", (doc: Document) => deep(doc, '[role="status"][aria-label="Tip from Cori"]'));
const agentPanel = label("Cori's chat", (doc: Document) => deep(doc, '[data-testid="agent-panel"]'));

/** One tap of Right Option, pressed and let go alone, as Cori's keys read it (content/agent/key-taps.ts). */
async function tapRightOption(s: Stage, tab: Tab): Promise<void> {
  const target = tab.doc.activeElement ?? tab.doc.body;
  const base = { key: "Alt", code: "AltRight", location: 2, bubbles: true, cancelable: true, composed: true };
  target.dispatchEvent(new (winOf(tab).KeyboardEvent)("keydown", { ...base, altKey: true }));
  await s.wait(60);
  target.dispatchEvent(new (winOf(tab).KeyboardEvent)("keyup", { ...base, altKey: false }));
}

/** What a reply can say about the dates, from the client's lines that go with the send. */
function replyFor(mem: Mem, draft: string): string {
  const answer = contextFor(mem, draft);
  const named: Array<[RegExp, string]> = [
    [/brand files/, "Your brand files"],
    [/mockups/, "Revised mockups"],
    [/final files/, "Final files"],
    [/staging link/, "Staging link"],
    [/[Ss]tatus call/, "Status call"],
    [/launch/, "Launch"],
  ];
  const rows = answer.block
    .split("\n")
    .filter((l) => l.startsWith("- "))
    .flatMap((l) => {
      const date = /\b(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}\b/.exec(l)?.[0];
      const what = named.find(([re]) => re.test(l))?.[1];
      return date && what ? [`- ${what}: ${date}`] : [];
    });
  return ["Here is a reply you can send.", "", "Hi Dana,", "", "Thanks for checking in. Here are the spring trail campaign dates as we have them:", "", ...rows, "", "Tell me if any of them moved on your side.", "", "Maya"].join("\n");
}

/**
 * Enter in the chat box, as a person's key reaches the page. Coere puts its
 * block in front of the draft as the key goes down, and the browser runs
 * the editor's mutation observer before the editor's own key handler, so
 * the site sends the box as it now stands (content/context-import/send-hook.ts).
 * A key a script dispatches runs every listener in one go, with no such
 * pause, so here the editor is told to read its box right after Coere's
 * turn, as that pause would have let it.
 */
async function pressSend(s: Stage, tab: Tab): Promise<void> {
  const settle = () => tab.doc.dispatchEvent(new (winOf(tab).Event)("selectionchange"));
  tab.win.addEventListener("keydown", settle, { capture: true });
  try {
    await s.press(tab, "Enter", 300);
  } finally {
    tab.win.removeEventListener("keydown", settle, { capture: true });
  }
  // ChatGPT empties its box once a message is sent; the replica keeps it, so it is emptied here as the site would.
  const box = composer(tab.doc);
  if (box) {
    box.focus();
    tab.doc.execCommand("selectAll");
    tab.doc.execCommand("delete");
    box.blur();
  }
}

export async function onTheSite(s: Stage, mem: Mem): Promise<void> {
  const draft = `Help me answer ${CLIENT} about the spring trail campaign dates.`;
  const site = await s.open("chat", "sites/chatgpt.html", { host: "chatgpt.com", person: MAYA, replies: [replyFor(mem, draft)] });
  await s.waitFor(site, composer);
  await s.wait(1200);
  s.chapter("chat");
  await s.film(site);
  // Cori's one time card, the first time she opens an AI (tools/demo-video/stage/hint.ts).
  if (await s.waitFor(site, hintCard, 8000).then(() => true, () => false)) {
    s.say("The first time she opens an AI, Cori shows how to call him: Right Option.");
    await s.rest();
    await s.wait(2600);
    await s.click(site, composer, { after: 300 });
    await s.rest();
    await tapRightOption(s, site);
    await s.waitFor(site, agentPanel);
    s.say("A tap brings out his chat, and the card is gone for good.");
    await s.wait(2000);
    await s.press(site, "Escape");
    await s.wait(600);
  }
  s.say(`On ChatGPT, Maya starts a reply to ${CLIENT}.`);
  await s.click(site, composer, { after: 300 });
  await s.type(site, draft.slice(0, -1), 45);
  // The last key goes as a key, so the strip hears typing even when a short showcase skips here.
  await s.press(site, draft.slice(-1));
  await s.waitFor(site, label("the strip naming the client", (doc: Document) => {
    const el = strip(doc);
    return el && (el.textContent ?? "").includes(`on the client ${CLIENT}`) ? el : null;
  }), 30_000);
  await s.rest();
  s.say("The blue line names the client the draft is about. One client goes with each send.");
  await s.wait(800);
  await s.glide(site, strip);
  await s.wait(1100);
  // Then she sends it: the client's context goes in with the message, and the reply has the dates.
  s.say(`She sends it, and ${CLIENT}'s context goes with it.`);
  await s.click(site, composer, { after: 200 });
  await pressSend(s, site);
  await s.rest();
  await s.waitFor(site, label("the reply", (doc: Document) => (doc.documentElement.hasAttribute("data-fake-replied") ? doc.documentElement : null)), 30_000);
  await s.wait(4500);
}

/** The dashboard's Settings page, off screen until filmed. */
export async function exportClient(s: Stage): Promise<void> {
  const page = await s.open("settings", "/preview/live/lib/console-v2-solution.html?tab=settings");
  const card = label("the Enterprise card", (doc: Document) => [...doc.querySelectorAll<HTMLElement>('section, [role="region"]')].find((el) => nameOf(el) === "Enterprise" && (el.hasAttribute("aria-label") || el.hasAttribute("aria-labelledby"))) ?? null);
  const inCard = (sel: (el: HTMLElement) => boolean, what: string) =>
    label(what, (doc: Document) => {
      const c = card(doc);
      return c ? [...c.querySelectorAll<HTMLElement>("button, select")].find(sel) ?? null : null;
    });
  const choose = inCard((el) => el.tagName === "SELECT" && [...(el as HTMLSelectElement).options].some((o) => o.text === "Choose a client"), "Choose a client");
  const exportButton = inCard((el) => el.tagName === "BUTTON" && (el.textContent ?? "").trim() === "Export a client", "Export a client");
  await s.waitFor(page, exportButton);
  await clearDock(page);
  card(page.doc)!.scrollIntoView({ block: "start" });
  await s.wait(600);
  s.chapter("share");
  await s.film(page);
  s.say("The Enterprise card holds the company, its people and its clients.");
  await s.wait(3000);
  s.say(`To hand ${CLIENT} to a teammate, Maya exports that one client.`);
  await s.click(page, choose, { after: 200 });
  const select = choose(page.doc) as HTMLSelectElement;
  const option = [...select.options].find((o) => o.text === CLIENT);
  if (option) {
    select.value = option.value;
    select.dispatchEvent(new (winOf(page).Event)("input", { bubbles: true }));
    select.dispatchEvent(new (winOf(page).Event)("change", { bubbles: true }));
  }
  await s.wait(300);
  await s.click(page, exportButton, { after: 400 });
  const dialog = label("Export memory", (doc: Document) => [...doc.querySelectorAll<HTMLElement>('dialog, [role="dialog"]')].find((d) => shown(d) && nameOf(d) === "Export memory") ?? null);
  const go = label("Export", (doc: Document) => {
    const d = dialog(doc);
    return d ? [...d.querySelectorAll<HTMLElement>("button")].find((b) => (b.textContent ?? "").trim() === "Export") ?? null : null;
  });
  await s.click(page, go, { after: 300 });
  await s.waitFor(page, label("the export's line", (doc: Document) => {
    const d = dialog(doc);
    return d && new RegExp(`${CLIENT}: [\\d,]+ memor(y|ies)`).test(d.textContent ?? "") ? d : null;
  }), 30_000);
  await s.rest();
  s.say("The line says what the file holds before she saves it.");
  await s.wait(4200);
  await s.press(page, "Escape");
}

/**
 * The client Maya listed, other than the one the film follows, whose set is
 * small enough to read at a glance, else the smallest (tools/demo-video/teams/work.ts).
 */
function smallClient(mem: Mem): string {
  const sizes: Array<[string, number]> = [];
  for (const c of clientViews(mem).filter((x) => x.state === "kept")) {
    if (c.name === CLIENT) continue;
    const p = forgetPreview(mem, c.name, null);
    if (p.kind === "set") sizes.push([c.name, p.total]);
  }
  const fits = sizes.filter(([, n]) => n >= 3 && n <= 6).sort((a, b) => b[1] - a[1]);
  const smallest = sizes.filter(([, n]) => n >= 3).sort((a, b) => a[1] - b[1]);
  const pick = fits[0] ?? smallest[0];
  if (!pick) throw new Error("no client with a set to show");
  return pick[0];
}

export async function deleteClient(s: Stage, mem: Mem): Promise<void> {
  const page = await memoryPage(s, "forget");
  const gone = smallClient(mem);
  s.chapter("delete");
  await s.film(page);
  s.say(`When the work with ${gone} ends, Maya deletes everything about it.`);
  await openByName(s, page, gone);
  await s.click(page, roleIn(sideSheet(gone), "button", `Delete everything about ${gone}`, true), { after: 300 });
  const confirm = sideSheet(`Delete everything about ${gone}?`);
  await s.waitFor(page, confirm);
  await s.rest();
  s.say("The graph lights all of it, and the sheet says what goes.");
  await s.wait(4500);
  await s.click(page, roleIn(confirm, "button", "Delete", true), { after: 300 });
  const receipt = sideSheet(`Delete everything about ${gone}`);
  await s.waitFor(page, label("the receipt's check", (doc: Document) => {
    const r = receipt(doc);
    return r && (r.textContent ?? "").includes("Checked: nothing about it is left in your memory.") ? r : null;
  }), 60_000);
  await s.rest();
  s.say("Then Coere checks that nothing about it is left.");
  await s.wait(3600);
}
