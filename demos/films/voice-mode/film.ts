import { play } from "../../stage/player";
import { focused } from "../../stage/input";
import { deep, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";
import type { World } from "../../stage/world";
import { setupCori } from "./cori";
import { voiceBackEnd, type VoiceBackEnd } from "./voice";

/**
 * Voice mode, ported beat by beat from coere-v2's
 * tools/demo-video/voice-mode.demo.ts (voice-mode.md 6 to 8): with Voice
 * mode on in Settings, on ChatGPT Maya holds Right Option and asks Cori out
 * loud. Coere's own listening card pops up with the meter and her words as
 * the made up speech model hears them, letting go sends them to Cori's
 * chat as her line, and Cori answers and says it (in silence here, as in
 * the film). Escape while she holds it cancels.
 *
 * Every surface is Coere's: the content script's voice parts on the page
 * (the hold reader, the listening card, the hold to talk button and Stop),
 * the service worker's voice router and Cori host, and the offscreen
 * document's voice host with the fake build's engines (voice.ts).
 */

const MAYA = { name: "Maya Collins", first: "Maya", initials: "MC" };
/** The line the fake builds' speech model reveals word by word (public/voice-fake/speech.json). */
const FAKE_LINE = "What can you do?";

const CHAPTERS = [
  { id: "hold", title: "Hold Right Option" },
  { id: "let-go", title: "Let go" },
  { id: "cancel", title: "Cancel" },
];

/** The chat box of the replica ChatGPT. */
const composer: Query = ".ProseMirror";
const card = (doc: Document): Element | null => deep(doc, '[data-testid="voice-card"][data-place="corner"]');
const phaseOf = (tab: Tab): string | null => card(tab.doc)?.getAttribute("data-phase") ?? null;
const wordsOf = (tab: Tab): string => (deep(card(tab.doc) ?? tab.doc, '[data-testid="voice-words"]')?.textContent ?? "").trim();
const agentPanel: Query = '[data-testid="agent-panel"]';
const answer: Query = (doc) => deep(doc, '[data-testid="agent-panel"] [data-turn="answer"]');
const stopButton: Query = '[data-testid="voice-stop"]';

let back: VoiceBackEnd | null = null;
let stageNow: Stage | null = null;

/** Polls until `test` holds, or gives up after `ms`. */
async function until(test: () => boolean, ms = 20_000): Promise<boolean> {
  const end = Date.now() + ms;
  while (!test()) {
    if (Date.now() > end) return false;
    await new Promise((r) => setTimeout(r, 40));
  }
  return true;
}

/** Right Option going down or up, on what has the focus, as the keyboard sends it. */
function rightOption(tab: Tab, type: "keydown" | "keyup"): void {
  const el = focused(tab.doc) ?? tab.doc.body;
  el.dispatchEvent(new tab.win.KeyboardEvent(type, { key: "Alt", code: "AltRight", location: 2, altKey: type === "keydown", bubbles: true, cancelable: true, composed: true }));
}

/** Opens the replica ChatGPT, with the tab's voice port wired to the voice back end. */
async function openSite(s: Stage): Promise<Tab> {
  const site = await s.open("chat", "sites/chatgpt.html", { host: "chatgpt.com", person: MAYA });
  const runtime = (site.win as unknown as { chrome: { runtime: { connect: unknown } } }).chrome.runtime;
  runtime.connect = back!.connect("chat", "https://chatgpt.com/");
  return site;
}

async function film(s: Stage): Promise<void> {
  stageNow = s;
  s.chapter("hold");
  const site = await openSite(s);
  await back!.ready;
  s.say("With Voice mode on in Settings, Maya can talk to Cori instead of typing.");
  await s.card("Voice mode", "Hold Right Option and ask Cori out loud.", 2800);
  await s.waitFor(site, composer);
  await s.wait(1200);
  await s.film(site);
  s.say("On ChatGPT, she holds Right Option and asks Cori a question.");
  await s.wait(1800);
  rightOption(site, "keydown");
  if (!(await until(() => phaseOf(site) === "listening", 10_000))) throw new Error("Cori's card never listened");
  s.say("Cori listens. The bars follow her voice, and her words show as she says them.");
  if (!(await until(() => wordsOf(site) === FAKE_LINE, 15_000))) throw new Error(`the card heard "${wordsOf(site)}"`);
  await s.wait(1200);

  s.chapter("let-go");
  s.say("She lets go, and her words go to Cori as her line.");
  rightOption(site, "keyup");
  await s.wait(1800);
  await s.waitFor(site, answer, 30_000);
  await s.waitFor(site, stopButton, 30_000);
  s.say("Cori answers in the chat and says his reply out loud. Stop, or any key, quiets him.");
  await s.glide(site, agentPanel);
  await s.wait(4600);
  await s.rest();
  await s.press(site, "Shift");

  s.chapter("cancel");
  s.say("Pressed by mistake? Escape while she holds it cancels, and nothing is sent.");
  await s.clickAt(site, { x: 700, y: 120 }, { after: 200 });
  // A press on the bare page takes the focus out of Cori's box, as the browser does; the stage's press moves it only to something focusable.
  (focused(site.doc) as HTMLElement | null)?.blur();
  // She pressed it by mistake and says nothing: the microphone hears the room.
  back!.hear("quiet");
  rightOption(site, "keydown");
  if (!(await until(() => phaseOf(site) === "listening", 10_000))) throw new Error("Cori's card never listened again");
  await s.wait(1600);
  await s.press(site, "Escape");
  await until(() => phaseOf(site) === "idle", 5000);
  rightOption(site, "keyup");
  await s.wait(2600);
  s.say("The speech models run in her browser. Her voice never leaves the computer.");
  await s.card("Voice mode", "Your voice is turned into words on this computer.", 2600);
  if (s.world.unanswered.length) console.log("UNANSWERED", JSON.stringify(s.world.unanswered));
}

function setup(world: World): void {
  back?.dispose();
  back = voiceBackEnd(() => stageNow?.fast ?? false);
  // Voice mode was turned on in Settings off camera, and Cori said hello on an earlier day.
  world.write("local", {
    "coere.voice": { v: 1, on: true, speak: true, rate: "normal" },
    "coere.cori.hello": { at: Date.now() - 86_400_000 },
  });
  setupCori(world);
  // Cori's chat keeps its history, as memory's Cori chats store does (memory.chat.append): one conversation, started on ChatGPT.
  let conv: { id: string; title: string; startedOn: string; createdAt: number; updatedAt: number; turns: number } | null = null;
  world.engine("memory.chat.append", (m) => {
    const a = m.args as { startedOn: string; turn: { text: string } };
    const at = Date.now();
    conv ??= { id: "cc_voice", title: a.turn.text.slice(0, 48), startedOn: a.startedOn, createdAt: at, updatedAt: at, turns: 0 };
    conv.turns += 1;
    conv.updatedAt = at;
    return { conv, n: conv.turns };
  });
  // Coere's content script on ChatGPT: the sidebar's chats save quietly, and none is kept out of memory.
  world
    .engine("memory.skipChats", () => [])
    .engine("upsertConversation", (m) => {
      const conv = (m.args as { conv?: { platformConvId?: string } }).conv;
      return { id: `chatgpt:${conv?.platformConvId ?? ""}`, hash: "", chunks: 1, bytes: 0, unchanged: true };
    });
}

play({ title: "Voice mode", chapters: CHAPTERS }, film, setup);
