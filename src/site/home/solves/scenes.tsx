"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
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
 * Switching AI to AI: the chat about the Harbor redesign steps back in
 * ChatGPT, and Claude rises in front of it with nothing. With Coere, the
 * line over Claude's box brings the project across, and the answer uses
 * what the ChatGPT chat said: the booking flow. When the scene starts
 * again, only Claude leaves, fading as ChatGPT glides back to the front.
 */
function Switch({ step, coere, live }: Props) {
  const moved = step >= 1;
  // The first message sits high in the window, above the window in front, so the words that show of it once it steps back are whole.
  const history: WindowFrame = {
    label: "Harbor site",
    fromTop: true,
    quiet: moved,
    messages: [you("a", "We're redesigning Harbor"), ai("b"), you("c", "Booking flow first"), ai("d", { lines: 3 })],
  };
  const answer = coere ? ai("r", { text: "Here is the booking flow update." }) : ai("r", { text: "Happy to help. What is Harbor, and who is it for?" });
  const front = (at: number) => asked(at, 2, fresh, coere, { draft: SWITCH_DRAFT, answer: [answer], what: ["your context on Harbor redesign", "your context on Harbor"], logo: logos.chatgpt });
  return (
    <>
      <motion.div
        className="absolute h-[64%] w-[68%]"
        initial={false}
        animate={moved ? { left: "4%", top: "5%", opacity: 0.55 } : { left: "16%", top: "18%", opacity: 1 }}
        transition={moved ? { duration: 0.8, ease, opacity: { duration: 0.8, delay: 0.25 } } : { duration: 0.8, ease, delay: 0.15, opacity: { duration: 0.3 } }}
      >
        <ChatWindow logo={logos.chatgpt} name="ChatGPT" frame={history} live={live} className="h-full" />
      </motion.div>
      {/*
        Claude rises as ChatGPT steps back: it is mostly in before ChatGPT starts to fade, so the scene is
        never one faded window. Leaving, it keeps the chat it ended on while it fades, quickly and before
        ChatGPT glides back, and it opens anew, unseen, before it rises again. In a narrower scene it sits
        a little lower, under ChatGPT's first message, whose height does not shrink with it.
      */}
      <motion.div
        className="absolute top-[30%] left-[20%] h-[66%] w-[76%] @max-[399px]:top-[33%]"
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
 * A new chat in the same AI: the chat where the person gave their project
 * and how they like answers scrolls away, and a new one opens as they
 * start typing them again. With Coere, a short first message is enough,
 * and the answer is short as they like. When the scene starts again, the
 * new chat scrolls away the same way, so nothing is drawn over it.
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
  const answer = coere ? [ai("r", { text: "Here is your week, Harbor redesign first." }), ai("s")] : [ai("r", { text: "Got it. Here is where the Harbor redesign stands." }), ai("s", { lines: 3 })];
  const frame = step === 0 ? history : asked(step, 1, { ...fresh, chat: "new" }, coere, { draft, answer, what: ["who you are and how you like answers"], logo: logos.claude });
  return <ChatWindow logo={logos.claude} name="Claude" frame={frame} live={live} className="absolute inset-x-[5%] inset-y-[7%] @min-[400px]:inset-y-[12%]" />;
}
const NEW_DRAFT = "Again, my project is the Harbor redesign, and I like short answers";
const NEW_DRAFT_COERE = "Plan my week";

/**
 * Inside one long chat: the launch date was given, and the long answers
 * after it bury it, so it fades. Without Coere the AI asks for it, and
 * pasting the whole chat back swells the box. The date stays in sight,
 * dimmed, so the still shows it was given. With Coere, only the date
 * comes back. The scene starts on its still without the last turn, so
 * starting again only takes that turn away. As the message goes, the
 * chat's first message leaves at the top, as a long chat scrolls on, so
 * the date stays in sight; a narrower window also leaves out the turn
 * after the date.
 */
function LongChat({ step, coere, live }: Props) {
  // The step the message goes on, from which the chat's first message has gone up out of sight.
  const sent = step >= (coere ? 4 : 3);
  const base: WindowFrame = {
    label: "Launch plan",
    messages: [
      ...(sent ? [] : [you("p", "Let's plan the launch")]),
      ai("o", { lines: 3 }),
      you("a", "The launch is on May 3", { dim: step >= 1 }),
      ai("b", { lines: 3 }),
      you("c", "Now the press list", { wide: true }),
      ai("d", { wide: true }),
    ],
  };
  const answer = coere ? ai("j", { text: "Here is the email for the May 3 launch." }) : ai("j", { text: "Sure. When is the launch?" });
  const done = [...base.messages, you("q", LONG_DRAFT), answer];
  const pasted: WindowFrame = { ...base, messages: done, pasted: true, draft: "Here is the whole chat again" };
  const frame = asked(step, 2, base, coere, { draft: LONG_DRAFT, answer: [answer], what: ["your context on Launch date"], logo: logos.gemini, after: [pasted] });
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
    steps: (coere) => [1700, 1100, typing(SWITCH_DRAFT), ...(coere ? [LINE_MS] : []), SEND_MS],
  },
  newChat: {
    Drawing: NewChat,
    steps: (coere) => [1800, typing(coere ? NEW_DRAFT_COERE : NEW_DRAFT), ...(coere ? [LINE_MS] : []), SEND_MS],
  },
  longChat: {
    Drawing: LongChat,
    steps: (coere) => [1400, 1300, typing(LONG_DRAFT), coere ? LINE_MS : SEND_MS, coere ? SEND_MS : 1800],
  },
};
