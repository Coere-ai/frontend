import { checkRewrite } from "@v2/packages/memory/src/actions/rewrite/check";
import { fixGrammar, improve } from "@v2/tests/fake-claude/scenarios/actions-rewrite";
import { down, up, type Point } from "../../stage/input";
import { play } from "../../stage/player";
import { deepAll, shown, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { Message, World } from "../../stage/world";

/**
 * Cori Rewrite, ported beat by beat from coere-v2's
 * tools/demo-video/cori-rewrite.demo.ts. In Gmail Maya selects a paragraph
 * full of slips and presses Rewrite's shortcut; Cori's picker offers
 * Rewrite, Improve and Fix grammar only. The fixed text goes in at once
 * with each change boxed in blue, and Looks good keeps it. In Google Docs
 * she tries Improve and Go back returns her words exactly; in Claude's
 * chat box Fix grammar only cleans a message before she sends it. Cori's
 * worker run, page script, picker, cards and boxes are Coere's own code
 * (rewrite.ts); the writing model's answers come from the World below,
 * from coere-v2's fake thinking model, checked by the engine's own guard.
 */

const MAYA = { name: "Maya Collins", first: "Maya", initials: "MC" };
const SLIPPED = "i wanted to follow up on teh proposal we discused last week. Their are a few changes we need before friday, and the budget is still $4,200.";
const CHAT = "i need help planning teh week before friday. Their are two labs due and i want to recieve feedback on my scheduler first.";
const PARA = "In my operating systems course I wrote a thread scheduler with priority donation";
const DOC_ID = "1Qk7mZ2xV9pLr4TnW8sYb3HcJ6uFd0eGaRtE5wKq";

/** How long the fake thinking model took to answer in the film. */
const LATENCY_MS = 1400;

type WriteArgs = { request: Parameters<typeof checkRewrite>[0] };

function setup(world: World): void {
  world
    .engine("memory.act.context", () => ({
      person: { name: "Maya Collins", timeZone: "America/Los_Angeles", today: "2026-10-27" },
      style: ["Short plain sentences, warm sign off."],
      facts: [],
      people: [],
      form: {},
    }))
    // act-write@1 for a rewrite: the fake model's answer, then the engine's own check (Fix grammar only's guard puts back what is not grammar).
    .engine("memory.act.write", async (m: Message) => {
      const { request } = m.args as WriteArgs;
      await new Promise((r) => setTimeout(r, LATENCY_MS));
      const mode = request.plan.fields.find((f) => f.name === "mode")?.value;
      const raw = mode === "grammar" ? fixGrammar(request.source) : improve(request.source);
      const checked = checkRewrite(request, raw, () => false);
      if (!checked) return { ok: false, failure: "invalid", usdMicros: 0 };
      return { ok: true, usdMicros: 300, written: { kind: "rewrite", rewrite: { text: checked.text }, putBack: checked.putBack } };
    })
    .engine("memory.act.log", () => ({}))
    .engine("memory.act.abort", () => ({}))
    // Coere's content script on Claude: nothing in memory fits this message, and the sidebar's chats save quietly.
    .engine("memory.contextFor", () => ({ pending: [], also: [], topic: [], tokens: 0, sources: [], chats: [], block: "" }))
    .engine("memory.skipChats", () => [])
    .engine("upsertConversation", (m: Message) => {
      const conv = (m.args as { conv?: { platformConvId?: string } }).conv;
      return { id: `claude:${conv?.platformConvId ?? ""}`, hash: "", chunks: 1, bytes: 0, unchanged: true };
    });
}

/** A button of Cori's card by its words, never the tip's Go back over a changed word. */
const cardButton = (words: string): Query => (doc) =>
  deepAll(doc, "coere-layer button").find((b) => shown(b) && !b.closest(".coere-rw-tip") && (b.textContent ?? "").includes(words)) ??
  deepAll(doc, "button").find((b) => shown(b) && b.getRootNode() !== doc && !b.closest(".coere-rw-tip") && (b.textContent ?? "").includes(words));

/** The change preview's boxes, as the layer drew them. */
const boxes = (tab: Tab): Element[] => deepAll(tab.doc, ".coere-rw-box").filter(shown);

/** Glides to a button in Coere's layer and presses it, as the real mouse does. */
async function pressLayer(s: Stage, tab: Tab, words: string): Promise<void> {
  await s.waitFor(tab, cardButton(words), 60_000);
  await s.wait(350);
  await s.click(tab, cardButton(words), { after: 300 });
}

/** Rests the pointer on a changed word, so its tip shows the words it replaced. */
async function hoverChange(s: Stage, tab: Tab, n: number): Promise<void> {
  const list = boxes(tab)
    .map((b) => b.getBoundingClientRect())
    .sort((a, b) => a.y - b.y || a.x - b.x);
  const box = list[Math.min(n, list.length - 1)];
  if (box) await s.moveTo({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
}

/** Waits until the change preview's boxes are gone. */
async function boxesGone(s: Stage, tab: Tab): Promise<void> {
  for (let i = 0; i < 400 && boxes(tab).length > 0; i++) await new Promise((r) => setTimeout(r, 50));
  await s.wait(50);
}

/** Where one character of `text` sits in an editable page, from a range over it. */
function charBox(tab: Tab, text: string, at: number): DOMRect {
  const walk = tab.doc.createTreeWalker(tab.doc.body, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode() as Text | null; n; n = walk.nextNode() as Text | null) {
    const i = n.data.indexOf(text);
    if (i < 0) continue;
    const range = tab.doc.createRange();
    range.setStart(n, i + at);
    range.setEnd(n, i + at + 1);
    return range.getBoundingClientRect();
  }
  throw new Error(`no "${text.slice(0, 20)}" on the page`);
}

/** A caret at a point, as the browser places one under a press. */
function caretAt(doc: Document, p: Point): Range | null {
  return doc.caretRangeFromPoint?.(p.x, p.y) ?? null;
}

/**
 * Selects text the way a person drags across it: press on the first
 * letter, move across, let go on the last. The page's selection follows
 * the hand, as the browser's own drag would make it.
 */
async function dragSelect(s: Stage, tab: Tab, from: Point, to: Point): Promise<void> {
  await s.moveTo(from);
  await s.wait(180);
  const pointer = document.getElementById("pointer");
  pointer?.classList.add("down");
  const pressed = down(tab.doc, from);
  const anchor = caretAt(tab.doc, from);
  const sel = tab.doc.getSelection()!;
  const follow = (p: Point) => {
    const focus = caretAt(tab.doc, p);
    if (!anchor || !focus) return;
    sel.setBaseAndExtent(anchor.startContainer, anchor.startOffset, focus.startContainer, focus.startOffset);
  };
  const steps = s.fast ? 1 : 28;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    const p = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e };
    await s.moveTo(p, { ms: 26, straight: true });
    follow(p);
  }
  follow(to);
  up(tab.doc, to, pressed);
  pointer?.classList.remove("down");
  await s.wait(300);
}

/** Three presses in a row, as a triple click: fake Docs selects the paragraph under it. */
async function tripleClick(s: Stage, tab: Tab, p: Point): Promise<void> {
  await s.moveTo(p);
  await s.wait(180);
  const pointer = document.getElementById("pointer");
  const el = s.hit(tab, p) ?? tab.doc.body;
  const at = { clientX: p.x, clientY: p.y, bubbles: true, cancelable: true, composed: true, view: tab.win, button: 0 };
  for (let n = 1; n <= 3; n++) {
    pointer?.classList.add("down");
    el.dispatchEvent(new tab.win.PointerEvent("pointerdown", { ...at, pointerId: 1, pointerType: "mouse", isPrimary: true, buttons: 1 }));
    el.dispatchEvent(new tab.win.MouseEvent("mousedown", { ...at, buttons: 1, detail: n }));
    await s.wait(40);
    el.dispatchEvent(new tab.win.PointerEvent("pointerup", { ...at, pointerId: 1, pointerType: "mouse", isPrimary: true }));
    el.dispatchEvent(new tab.win.MouseEvent("mouseup", { ...at, detail: n }));
    el.dispatchEvent(new tab.win.MouseEvent("click", { ...at, detail: n }));
    pointer?.classList.remove("down");
    await s.wait(70);
  }
}

/** Option Shift R: the start Chrome's shortcut sends for this tab. */
async function shortcut(tab: Tab): Promise<void> {
  const rewrite = (tab.win as unknown as { __rewrite: { start(mode: null): Promise<{ started: boolean; refused?: string }> } }).__rewrite;
  const r = await rewrite.start(null);
  if (!r.started) throw new Error(`Rewrite did not start: ${r.refused}`);
}

/** Loads the film's Cori bundle into a tab that has no copy yet (Claude's chat, whose page is the fake site builder's). */
async function addCori(tab: Tab, address: string): Promise<void> {
  (tab.win as unknown as { __demoAddress: string }).__demoAddress = address;
  const script = tab.doc.createElement("script");
  script.src = "../rewrite.js";
  const loaded = new Promise((r) => script.addEventListener("load", r, { once: true }));
  tab.doc.head.append(script);
  await loaded;
}

async function film(s: Stage): Promise<void> {
  await s.card("Cori Rewrite", "Fix or improve your writing where you write it.", 2600);
  s.say("Cori can fix or improve text wherever Maya writes.");

  // Gmail: her own compose window, with a quick paragraph full of slips.
  s.chapter("select");
  const gmail = await s.open("gmail", "google/gmail.html");
  await s.waitFor(gmail, '[aria-label="Message Body"]');
  await s.film(gmail);
  s.say("Maya writes a quick email in Gmail, slips and all.");
  await s.click(gmail, '[aria-label="Message Body"]', { after: 200 });
  await s.type(gmail, "Hi Dana,", 40);
  await s.press(gmail, "Enter", 0);
  gmail.doc.execCommand("insertParagraph");
  await s.wait(60);
  await s.type(gmail, SLIPPED, 18);
  await s.rest();
  await s.wait(800);
  s.say("She selects the paragraph.");
  const first = charBox(gmail, SLIPPED, 0);
  const last = charBox(gmail, SLIPPED, SLIPPED.length - 1);
  await dragSelect(s, gmail, { x: first.x + 1, y: first.y + first.height / 2 }, { x: last.right, y: last.y + last.height / 2 });
  await s.rest();
  await s.wait(1000);

  s.chapter("rewrite");
  s.say("Option Shift R opens Cori's picker beside it: Rewrite, Improve or Fix grammar only.");
  await shortcut(gmail);
  await s.waitFor(gmail, cardButton("Fix grammar only"), 30_000);
  await s.wait(2400);
  await pressLayer(s, gmail, "Fix grammar only");
  await s.rest();

  s.chapter("preview");
  await s.waitFor(gmail, cardButton("Looks good"), 60_000);
  s.say("The fixed text goes in at once. Each change is boxed in blue, only on her screen.");
  await s.wait(3000);
  s.say("Fix grammar only touches spelling, grammar and punctuation. Her words stay hers.");
  await hoverChange(s, gmail, 2);
  await s.wait(3200);

  s.chapter("accept");
  s.say("Looks good keeps it.");
  await pressLayer(s, gmail, "Looks good");
  await s.rest();
  await boxesGone(s, gmail);
  await s.wait(2200);

  // Docs: Improve on a paragraph of her cover letter, then Go back.
  s.chapter("docs");
  const docs = await s.open("docs", "google/docs.html");
  await s.waitFor(docs, "canvas.kix-canvas-tile-content");
  await s.wait(800);
  await s.film(docs);
  s.close(gmail);
  s.say("In Google Docs she wants a paragraph of her cover letter to read better.");
  await s.wait(2600);
  const truth = (docs.win as unknown as { RewriteTruth: { docsRects(t: string, a: number, b: number): DOMRect[] } }).RewriteTruth;
  const seed = await letter(docs);
  const at = truth.docsRects(seed, Math.max(0, seed.indexOf(PARA)), Math.max(0, seed.indexOf(PARA)) + 4);
  await tripleClick(s, docs, { x: at[0]!.x + 4, y: at[0]!.y + 8 });
  await s.rest();
  await s.wait(1200);
  await shortcut(docs);
  await s.waitFor(docs, cardButton("Improve"), 30_000);
  s.say("This time she picks Improve.");
  await s.wait(1200);
  await pressLayer(s, docs, "Improve");
  await s.rest();
  await s.waitFor(docs, cardButton("Go back"), 60_000);
  s.say("Improve may reword a sentence, and it keeps every fact she wrote.");
  await s.wait(3600);
  s.say("She prefers her own words. Go back returns them exactly.");
  await pressLayer(s, docs, "Go back");
  await s.rest();
  await boxesGone(s, docs);
  await s.wait(2400);

  // Claude's chat box: a message cleaned up before she sends it.
  s.chapter("chat");
  const site = await s.open("claude", "sites/claude.html", { host: "claude.ai", person: MAYA });
  await addCori(site, "https://claude.ai/new");
  await s.waitFor(site, ".ProseMirror");
  await s.film(site);
  s.close(docs);
  s.say("It works in any text box, like her chat with Claude.");
  await s.click(site, ".ProseMirror", { after: 200 });
  await s.type(site, CHAT, 22);
  await s.press(site, /Mac/i.test(site.win.navigator.platform) ? "Meta+a" : "Control+a", 0);
  selectAllIn(site);
  await s.rest();
  await s.wait(700);
  await shortcut(site);
  await s.waitFor(site, cardButton("Fix grammar only"), 30_000);
  await s.wait(900);
  await pressLayer(s, site, "Fix grammar only");
  await s.rest();
  await s.waitFor(site, cardButton("Looks good"), 60_000);
  s.say("Fixed in place, ready to send.");
  await s.wait(2800);
  await pressLayer(s, site, "Looks good");
  await s.rest();
  await s.wait(1800);
  s.say("The blue boxes are only on her screen. Nobody else sees them.");
  await s.card("Cori Rewrite", "Nothing is written into your document until you keep it.", 2600);
  s.close(site);
  if (s.world.unanswered.length) console.log("unanswered", JSON.stringify(s.world.unanswered));
}

/** The cover letter's text as fake Docs holds it, from the page's boot state. */
async function letter(tab: Tab): Promise<string> {
  const boot = JSON.parse(tab.doc.getElementById("boot")?.textContent ?? "{}") as { id?: string; text?: string };
  if (boot.id !== DOC_ID) throw new Error("not the cover letter");
  return boot.text ?? "";
}

/** Ctrl or Cmd A in the chat box: the whole message, if the editor's own key binding did not already take it. */
function selectAllIn(tab: Tab): void {
  const box = tab.doc.querySelector(".ProseMirror");
  const sel = tab.doc.getSelection();
  if (!box || !sel || sel.toString().trim().length >= CHAT.length - 2) return;
  const range = tab.doc.createRange();
  range.selectNodeContents(box);
  sel.removeAllRanges();
  sel.addRange(range);
}

play(
  {
    title: "Cori Rewrite",
    chapters: [
      { id: "select", title: "Select text" },
      { id: "rewrite", title: "Rewrite with Cori" },
      { id: "preview", title: "Preview" },
      { id: "accept", title: "Looks good" },
      { id: "docs", title: "Improve and go back" },
      { id: "chat", title: "Fix a chat message" },
    ],
  },
  film,
  setup,
);
