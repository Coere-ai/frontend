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
const you = (id: string, text: string): Message => ({ id, who: "you", text });
const ai = (id: string, text?: string): Message => ({ id, who: "ai", text });

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
 * ChatGPT, and Claude opens in front of it with nothing. With Coere, the
 * line over Claude's box brings the project across.
 */
function Switch({ step, coere, live }: Props) {
  const moved = step >= 1;
  // One message, high in the window, so no words sit cut under the window in front.
  const history: WindowFrame = { label: "Harbor site", fromTop: true, quiet: moved, messages: [you("a", "We're redesigning Harbor"), ai("b")] };
  const answer = coere ? ai("r", "Here is the update on the Harbor redesign.") : ai("r", "Happy to help. What is Harbor, and who is it for?");
  const front = asked(step, 2, fresh, coere, { draft: SWITCH_DRAFT, answer: [answer], what: ["your context on Harbor redesign", "your context on Harbor"], logo: logos.chatgpt });
  return (
    <>
      <motion.div
        className="absolute h-[64%] w-[68%]"
        initial={false}
        animate={moved ? { left: "4%", top: "5%", opacity: 0.55 } : { left: "16%", top: "18%", opacity: 1 }}
        transition={{ duration: 0.8, ease }}
      >
        <ChatWindow logo={logos.chatgpt} name="ChatGPT" frame={history} live={live} className="h-full" />
      </motion.div>
      {/* Claude comes in as ChatGPT steps back, so the scene is never one faded window. Most of its entrance is the rise; the fade is short, so nothing reads through it. */}
      <motion.div
        className="absolute top-[31%] left-[20%] h-[64%] w-[76%]"
        initial={false}
        animate={moved ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={moved ? { y: { duration: 0.6, ease, delay: 0.35 }, opacity: { duration: 0.25, delay: 0.35 } } : { duration: 0.3 }}
      >
        <ChatWindow logo={logos.claude} name="Claude" frame={front} live={live} className="h-full" />
      </motion.div>
    </>
  );
}
const SWITCH_DRAFT = "Draft the Harbor update";

/**
 * A new chat in the same AI: the project and the preference are gone, and
 * the person types them again as the new chat opens, so it is never an
 * empty window. With Coere, a short first message is
 * enough, and the answer is short as they like.
 */
function NewChat({ step, coere, live }: Props) {
  const history: WindowFrame = {
    label: "Harbor redesign",
    messages: [you("a", "My project is the Harbor redesign"), ai("b"), you("c", "I like short answers"), ai("d")],
  };
  const draft = coere ? NEW_DRAFT_COERE : NEW_DRAFT;
  const answer = coere ? [ai("r", "Here is your week, Harbor redesign first.")] : [ai("r")];
  const frame = step === 0 ? history : asked(step, 1, fresh, coere, { draft, answer, what: ["who you are and how you like answers"], logo: logos.claude });
  return <ChatWindow logo={logos.claude} name="Claude" frame={frame} live={live} className="absolute inset-x-[5%] inset-y-[9%]" />;
}
const NEW_DRAFT = "Again, my project is the Harbor redesign, and I like short answers";
const NEW_DRAFT_COERE = "Plan my week";

/**
 * Inside one long chat: the launch date is given, a long answer buries it
 * and it fades. Without Coere the AI asks for it, and pasting the whole
 * chat back swells the box. The date stays in sight at the top, dimmed,
 * so the still shows it was given. With Coere, only the date comes back.
 */
function LongChat({ step, coere, live }: Props) {
  const said = { ...you("a", "The launch is on May 3"), dim: step >= 1 };
  const base: WindowFrame = { label: "Launch plan", messages: [said, { ...ai("b"), lines: 3 }] };
  const answer = coere ? ai("j", "Here is the email for the May 3 launch.") : ai("j", "Sure. When is the launch?");
  const done = [...base.messages, you("q", LONG_DRAFT), answer];
  const pasted: WindowFrame = { ...base, messages: done, pasted: true, draft: "Here is the whole chat again" };
  const frame = asked(step, 2, base, coere, { draft: LONG_DRAFT, answer: [answer], what: ["your context on Launch date"], logo: logos.gemini, after: [pasted] });
  return <ChatWindow logo={logos.gemini} name="Gemini" frame={frame} live={live} className="absolute inset-x-[5%] inset-y-[4%]" />;
}
const LONG_DRAFT = "Write the launch email";

/**
 * Each scene, by its key in the words. Every step is a whole chat: the
 * setting, the typing, Coere's line on its side, the send and the answer.
 */
export const scenes: Record<SceneKey, Scene> = {
  switch: {
    Drawing: Switch,
    steps: (coere) => [1700, 1300, typing(SWITCH_DRAFT), ...(coere ? [LINE_MS] : []), SEND_MS],
  },
  newChat: {
    Drawing: NewChat,
    steps: (coere) => [1800, typing(coere ? NEW_DRAFT_COERE : NEW_DRAFT), ...(coere ? [LINE_MS] : []), SEND_MS],
  },
  longChat: {
    Drawing: LongChat,
    steps: (coere) => [1600, 1500, typing(LONG_DRAFT), coere ? LINE_MS : SEND_MS, coere ? SEND_MS : 1800],
  },
};
