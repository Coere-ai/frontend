"use client";

import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { useState, type ReactNode } from "react";
import type { SceneKey } from "@/site/content/solves";
import { ChatWindow, ease, type MemoryLine, type Message, type WindowFrame } from "./chat-window";
import { typingMs } from "./typed";

/** What a drawing is given: the step it is on, the side, and whether it is playing (see ChatWindow). */
type Props = { step: number; coere: boolean; live: boolean };

/**
 * One scene: its drawing, and how long each step stays before the next,
 * in ms, for each side. A scene has one step more than it has times: the
 * last step is the still that tells the story, and how long it holds is
 * the row's.
 */
export type Scene = { Drawing: (props: Props) => ReactNode; steps: (coere: boolean) => number[] };

/** The last step of a scene on a side: its still. */
export const lastStep = (scene: Scene, coere: boolean) => scene.steps(coere).length;

const logos = { chatgpt: "/openai.svg", claude: "/claude-color.svg", gemini: "/gemini-color.svg" };
const you = (id: string, text: string, o: Partial<Message> = {}): Message => ({ id, who: "you", text, ...o });
const ai = (id: string, o: Partial<Message> = {}): Message => ({ id, who: "ai", ...o });

/** A typing step: the draft's letters, then a beat to read it. */
const typing = (draft: string) => typingMs(draft) + 700;
/** Coere's line loading in, and time to read it. */
const LINE_MS = 2000;
/** From the send to the AI's answer. */
const SEND_MS = 1000;

/**
 * Coere's line over the chat box, in the extension's own words
 * (context-import/strip/copy.ts): what it will add while the person
 * types, and what it added once they send.
 */
const coereLine = (sent: boolean, what: readonly string[], logo: string): MemoryLine => ({ sent, what, logo });

const fresh: WindowFrame = { label: "New chat", messages: [], greeting: "How can I help you today?" };

/**
 * The steps after a fresh chat opens, for both sides: the person types,
 * sends and gets an answer. With Coere, its line comes in over the box
 * after the typing, and reads "added" from the send on. `at` is the step
 * the typing starts on. Without Coere, `after` adds steps past the answer.
 */
function asked(step: number, at: number, base: WindowFrame, coere: boolean, o: { draft: string; answer: Message[]; what: readonly string[]; logo: string; after?: WindowFrame[] }): WindowFrame {
  const k = step - at;
  const sent = [...base.messages, you("q", o.draft)];
  // Once a message is in, the greeting of a fresh chat is gone.
  const chat = { ...base, greeting: undefined };
  if (k < 0) return base;
  if (k === 0) return { ...base, draft: o.draft };
  if (!coere) return k === 1 ? { ...chat, messages: sent } : k === 2 ? { ...chat, messages: [...sent, ...o.answer] } : (o.after?.[k - 3] ?? base);
  const line = (done: boolean) => coereLine(done, o.what, o.logo);
  if (k === 1) return { ...base, draft: o.draft, line: line(false) };
  if (k === 2) return { ...chat, messages: sent, line: line(true) };
  return { ...chat, messages: [...sent, ...o.answer], line: line(true) };
}

/**
 * Whether a drawing has started again: a count that goes up each time its
 * step goes back, from the still to the first step. A part keyed by it is
 * drawn anew on each run, so it can come in as a new start rather than
 * play its moves backwards.
 */
function useRun(step: number): number {
  const [seen, setSeen] = useState({ step, run: 0 });
  if (seen.step !== step) setSeen({ step, run: step < seen.step ? seen.run + 1 : seen.run });
  return seen.run;
}

/**
 * Switching AI to AI: the chat about the Harbor redesign opens in ChatGPT,
 * where the person says the booking flow comes first. Then it steps back,
 * and Claude rises in front of it with nothing. With Coere, the line over
 * Claude's box brings the project across, and the answer uses what Coere
 * added and what the ChatGPT chat said. When the scene starts again,
 * Claude and the chat behind it fade, and ChatGPT rises anew in front, as
 * Claude does, so no move plays backwards.
 */
function Switch({ step, coere, live }: Props) {
  const run = useRun(step);
  const moved = step >= 2;
  // The first message sits high in the window, above the window in front, so the words that show of it once it steps back are whole.
  const history: WindowFrame = {
    label: "Harbor site",
    fromTop: true,
    quiet: moved,
    messages: [you("a", "We're redesigning Harbor"), ai("b"), ...(step >= 1 ? [you("c", "Booking flow first"), ai("d", { lines: 3 })] : [])],
  };
  const answer = coere ? [ai("r", { text: "Here is the Harbor update, booking flow first." }), ai("s", { wide: true })] : [ai("r", { text: "Happy to help. What is Harbor, and who is it for?" })];
  const front = (at: number) => asked(at, 3, fresh, coere, { draft: SWITCH_DRAFT, answer, what: ["your context on Harbor redesign", "your context on Harbor"], logo: logos.chatgpt });
  return (
    <>
      <AnimatePresence initial={false}>
        <Behind key={run} moved={moved}>
          <ChatWindow logo={logos.chatgpt} name="ChatGPT" frame={history} live={live} className="h-full" />
        </Behind>
      </AnimatePresence>
      {/*
        Claude rises as ChatGPT steps back: it is mostly in before ChatGPT starts to fade, so the scene is
        never one faded window. Leaving, it keeps the chat it ended on while it fades, quickly, and it opens
        anew, unseen, before it rises again. It sits low enough to leave ChatGPT's first message whole, and
        no taller than its chat needs, so its top is not an empty band.
      */}
      <motion.div
        className="absolute top-[33%] left-[20%] z-[2] h-[66%] w-[76%] @min-[400px]:top-[34%] @min-[400px]:h-[62%]"
        initial={false}
        animate={moved ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={moved ? { y: { duration: 0.7, ease }, opacity: { duration: 0.25 } } : { y: { duration: 0.3 }, opacity: { duration: 0.2 } }}
      >
        <ChatWindow key={moved ? "open" : "left"} logo={logos.claude} name="Claude" frame={front(moved ? step : lastStep(scenes.switch, coere))} live={live && moved} className="h-full" />
      </motion.div>
    </>
  );
}
const SWITCH_DRAFT = "Draft the Harbor update";

/**
 * The ChatGPT window in Switch: in front, then stepped back and faded. A
 * new one rises in front once Claude has faded, over the one it replaces,
 * which keeps its place behind until the new one is in and then fades, so
 * the scene never thins to faint windows only.
 */
function Behind({ moved, children }: { moved: boolean; children: ReactNode }) {
  const present = useIsPresent();
  return (
    <motion.div
      className={`absolute h-[64%] w-[68%] ${present ? "z-[1]" : "z-0"}`}
      initial={{ left: "16%", top: "18%", opacity: 0, y: 24 }}
      animate={moved ? { left: "4%", top: "5%", opacity: 0.55, y: 0 } : { left: "16%", top: "18%", opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.35 } }}
      transition={moved ? { duration: 0.8, ease, opacity: { duration: 0.8, delay: 0.25 } } : { y: { duration: 0.7, ease, delay: 0.2 }, opacity: { duration: 0.2, delay: 0.2 } }}
    >
      {children}
    </motion.div>
  );
}

/** How long a new chat takes to scroll in and its name to change, in ms: the first letter waits for it. */
const SCROLL_MS = 800;

/**
 * A new chat in the same AI: the chat where the person gave their project
 * and how they like answers scrolls away, and a new one opens. Once it is
 * in, they start typing them again. With Coere, a short first message is
 * enough, and the answer is short as they like. When the scene starts
 * again, the new chat scrolls away the same way, so nothing is drawn over
 * it.
 */
function NewChat({ step, coere, live }: Props) {
  const history: WindowFrame = {
    chat: "harbor",
    label: "Harbor redesign",
    messages: [
      you("a", "My project is the Harbor redesign"),
      ai("b", { lines: 3 }),
      you("c", "I like short answers"),
      ai("d"),
    ],
  };
  const draft = coere ? NEW_DRAFT_COERE : NEW_DRAFT;
  // A whole answer under the message, so the new chat reads as a chat and not an empty window.
  const answer = [ai("r", { text: coere ? "Here is your week, Harbor redesign first." : "Got it. Here is where the Harbor redesign stands." }), ai("s", { lines: 3 })];
  const asking = asked(step, 1, { ...fresh, chat: "new" }, coere, { draft, answer, what: ["who you are and how you like answers"], logo: logos.claude });
  const frame = step === 0 ? history : step === 1 ? { ...asking, typeDelay: SCROLL_MS } : asking;
  return <ChatWindow logo={logos.claude} name="Claude" frame={frame} live={live} className="absolute inset-x-[5%] inset-y-[7%] @min-[400px]:inset-y-[12%]" />;
}
const NEW_DRAFT = "Again, my project is the Harbor redesign, and I like short answers";
const NEW_DRAFT_COERE = "Plan my week";

/**
 * Inside one long chat: the launch date was given a while ago, and it is
 * dimmed, as a detail the chat has let go of. Then the press list and its
 * long answer come in and push it up. Without Coere the AI asks for the
 * date, and pasting the whole chat back swells the box. With Coere, only
 * the date comes back. The chat is longer than its window, so its first
 * messages leave at the top as it goes on, and the date stays in sight.
 * When the scene starts again, only what came after the date goes, so the
 * date keeps its dimmed place and every move is forwards.
 */
function LongChat({ step, coere, live }: Props) {
  const base: WindowFrame = {
    label: "Launch plan",
    messages: [
      you("p", "Let's plan the launch"),
      ai("o", { lines: 3 }),
      you("m", "Start with the venue"),
      ai("n", { lines: 3 }),
      you("a", "The launch is on May 3", { dim: true }),
      // Its answer only where the window has room for it, so the date stays in sight at every width.
      ai("b", { wide: true }),
      ...(step >= 1 ? [you("c", "Now the press list"), ai("d")] : []),
    ],
  };
  const answer = coere ? ai("j", { text: "Here is the email for the May 3 launch." }) : ai("j", { text: "Sure. When is the launch?" });
  const done = [...base.messages, you("q", LONG_DRAFT), answer];
  const pasted: WindowFrame = { ...base, messages: done, pasted: true, draft: "Here is the whole chat again" };
  const frame = asked(step, 2, base, coere, { draft: LONG_DRAFT, answer: [answer], what: ["your context on May 3 launch"], logo: logos.gemini, after: [pasted] });
  return <ChatWindow logo={logos.gemini} name="Gemini" frame={frame} live={live} className="absolute inset-x-[5%] inset-y-[2%]" />;
}
const LONG_DRAFT = "Write the launch email";

/**
 * Each scene, by its key in the words. Every step is a whole chat: the
 * setting, the typing, Coere's line on its side, the send and the answer.
 */
export const scenes: Record<SceneKey, Scene> = {
  switch: {
    Drawing: Switch,
    steps: (coere) => [900, 1300, 1100, typing(SWITCH_DRAFT), ...(coere ? [LINE_MS] : []), SEND_MS],
  },
  newChat: {
    Drawing: NewChat,
    steps: (coere) => [1800, SCROLL_MS + typing(coere ? NEW_DRAFT_COERE : NEW_DRAFT), ...(coere ? [LINE_MS] : []), SEND_MS],
  },
  longChat: {
    Drawing: LongChat,
    steps: (coere) => [1000, 1500, typing(LONG_DRAFT), coere ? LINE_MS : SEND_MS, coere ? SEND_MS : 1800],
  },
};
