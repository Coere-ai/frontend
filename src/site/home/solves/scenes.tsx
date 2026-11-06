"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import type { SceneKey } from "@/site/content/solves";
import { ChatWindow, ease, type MemoryLine, type Message, type WindowFrame } from "./chat-window";

/** The steps every scene plays, 0 to LAST. The last is the still that tells the story. */
export const LAST = 3;

/** How long each step stays before the next, in ms. The last step's hold is the row's. */
export const STEP_MS = [1500, 2000, 1800];

type Props = { step: number; coere: boolean };

const logos = { chatgpt: "/openai.svg", claude: "/claude-color.svg", gemini: "/gemini-color.svg" };
const you = (id: string, text: string): Message => ({ id, who: "you", text });
const ai = (id: string, text?: string): Message => ({ id, who: "ai", text });

/**
 * Coere's line over the chat box, in the extension's own words: what it
 * will add while the person types, and what it added once they send.
 */
function coereLine(step: number, what: string, logo: string): MemoryLine {
  return { text: `Coere ${step === LAST ? "added" : "will add"} ${what}`, logo };
}

/**
 * Switching AI to AI: the chat about the Harbor redesign stays behind in
 * ChatGPT, and once it has settled Claude opens in front of it with
 * nothing. With Coere, the line over Claude's box brings the project
 * across.
 */
function Switch({ step, coere }: Props) {
  const moved = step >= 1;
  // One message, high in the window, so no words sit cut under the window in front.
  const history: WindowFrame = { label: "Harbor site", fromTop: true, quiet: moved, messages: [you("a", "We're redesigning Harbor"), ai("b")] };
  const line = coereLine(step, "the Harbor redesign", logos.chatgpt);
  const fresh: WindowFrame = { label: "New chat", messages: [], greeting: "How can I help you today?" };
  const asked = [you("q", "Draft the Harbor update")];
  const front: WindowFrame = !coere
    ? step === 2
      ? { ...fresh, greeting: undefined, messages: asked }
      : step === 3
        ? { ...fresh, greeting: undefined, messages: [...asked, ai("r", "Happy to help. What is Harbor, and who is it for?")] }
        : fresh
    : step === 2
      ? { ...fresh, draft: "Draft the Harbor update", line }
      : step === 3
        ? { ...fresh, greeting: undefined, line, messages: [...asked, ai("r", "Here is the update for the redesign.")] }
        : fresh;

  return (
    <>
      <motion.div
        className="absolute h-[64%] w-[68%]"
        initial={false}
        animate={moved ? { left: "4%", top: "5%", opacity: 0.55 } : { left: "16%", top: "18%", opacity: 1 }}
        transition={{ duration: 0.8, ease }}
      >
        <ChatWindow logo={logos.chatgpt} name="ChatGPT" frame={history} className="h-full" />
      </motion.div>
      {/* Claude comes in once ChatGPT has settled. Most of its entrance is the rise; the fade is short, so nothing reads through it. */}
      <motion.div
        className="absolute top-[31%] left-[20%] h-[64%] w-[76%]"
        initial={false}
        animate={moved ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={moved ? { y: { duration: 0.7, ease, delay: 0.75 }, opacity: { duration: 0.25, delay: 0.75 } } : { duration: 0.3 }}
      >
        <ChatWindow logo={logos.claude} name="Claude" frame={front} className="h-full" />
      </motion.div>
    </>
  );
}

/**
 * A new chat in the same AI: the project and the preference are gone, and
 * the person types them again. With Coere, their first message is enough.
 */
function NewChat({ step, coere }: Props) {
  const history: WindowFrame = {
    label: "Harbor redesign",
    messages: [you("a", "My project is the Harbor redesign"), ai("b"), you("c", "I like short answers"), ai("d")],
  };
  const fresh: WindowFrame = { label: "New chat", messages: [], greeting: "How can I help you today?" };
  const again = "Again, my project is the Harbor redesign, and I like short answers";
  const line = coereLine(step, "the Harbor redesign and short answers", logos.claude);
  const frame: WindowFrame =
    step === 0
      ? history
      : step === 1
        ? fresh
        : !coere
          ? step === 2
            ? { ...fresh, draft: again }
            : { ...fresh, greeting: undefined, messages: [you("q", again), ai("r")] }
          : step === 2
            ? { ...fresh, draft: "Plan my week", line }
            : { ...fresh, greeting: undefined, line, messages: [you("q", "Plan my week"), ai("r", "Here is your week, Harbor first."), ai("s")] };

  return <ChatWindow logo={logos.claude} name="Claude" frame={frame} className="absolute inset-x-[5%] inset-y-[9%]" />;
}

/**
 * Inside one long chat: the launch date is given, a long answer buries it
 * and it fades, the AI asks for it, and pasting the whole chat back swells
 * the box. The date stays in sight at the top, dimmed, so the still shows
 * it was given. With Coere, only the date comes back.
 */
function LongChat({ step, coere }: Props) {
  const said = { ...you("a", "The launch is on May 3"), dim: step >= 1 };
  const base: WindowFrame = { label: "Launch plan", messages: step === 0 ? [said] : [said, { ...ai("b"), lines: 3 }] };
  const asked = [...base.messages, you("i", "Write the launch email")];
  const line = coereLine(step, "the launch date, May 3", logos.gemini);
  const frame: WindowFrame =
    step <= 1
      ? base
      : !coere
        ? step === 2
          ? { ...base, messages: [...asked, ai("j", "Sure. When is the launch?")] }
          : { ...base, messages: [...asked, ai("j", "Sure. When is the launch?")], pasted: true, draft: "Here is the whole chat again" }
        : step === 2
          ? { ...base, draft: "Write the launch email", line }
          : { ...base, line, messages: [...asked, ai("j", "Here is the email for the May 3 launch.")] };

  return <ChatWindow logo={logos.gemini} name="Gemini" frame={frame} className="absolute inset-x-[5%] inset-y-[4%]" />;
}

/** Each scene's drawing, by its key in the words. */
export const sceneDrawings: Record<SceneKey, (props: Props) => ReactNode> = { switch: Switch, newChat: NewChat, longChat: LongChat };
