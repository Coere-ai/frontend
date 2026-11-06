"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import type { SceneKey } from "@/site/content/solves";
import { ChatWindow, ease, type Message, type WindowFrame } from "./chat-window";

/** The steps every scene plays, 0 to LAST. The last is the still that tells the story. */
export const LAST = 3;

/** How long each step stays before the next, in ms. The last step's hold is the row's. */
export const STEP_MS = [1500, 1700, 1800];

type Props = { step: number; coere: boolean };

const logos = { chatgpt: "/openai.svg", claude: "/claude-color.svg", gemini: "/gemini-color.svg" };
const you = (id: string, text: string): Message => ({ id, who: "you", text });
const ai = (id: string, text?: string): Message => ({ id, who: "ai", text });

/**
 * Switching AI to AI: the chat that knows Maya's work stays behind in
 * ChatGPT, and Claude opens in front of it with nothing. With Coere, the
 * line over Claude's box brings what matters across.
 */
function Switch({ step, coere }: Props) {
  const moved = step >= 1;
  const history: WindowFrame = {
    label: "Harbor site",
    fromTop: true,
    messages: [you("a", "I run Fernhill Creative"), ai("b"), you("c", "We're redesigning the Harbor site"), ai("d")],
  };
  const line = { text: `${step === LAST ? "Added" : "Adding"} Fernhill and the Harbor redesign`, from: "ChatGPT", logo: logos.chatgpt };
  const fresh: WindowFrame = { label: "New chat", messages: [], greeting: "How can I help you today?" };
  const front: WindowFrame = !coere
    ? step === 2
      ? { ...fresh, greeting: undefined, messages: [you("q", "Draft the Harbor update")] }
      : step === 3
        ? { ...fresh, greeting: undefined, messages: [you("q", "Draft the Harbor update"), ai("r", "Happy to help. What is Harbor, and who is it for?")] }
        : fresh
    : step === 2
      ? { ...fresh, draft: "Draft the Harbor update", line }
      : step === 3
        ? { ...fresh, greeting: undefined, line, messages: [you("q", "Draft the Harbor update"), ai("r", "Here is the Harbor update for Fernhill, kept short.")] }
        : fresh;

  return (
    <>
      <motion.div
        className="absolute h-[64%] w-[68%]"
        initial={false}
        animate={moved ? { left: "4%", top: "5%", opacity: 0.55 } : { left: "16%", top: "18%", opacity: 1 }}
        transition={{ duration: 0.9, ease }}
      >
        <ChatWindow logo={logos.chatgpt} name="ChatGPT" frame={history} className="h-full" />
      </motion.div>
      <motion.div
        className="absolute top-[31%] left-[20%] h-[64%] w-[76%]"
        initial={false}
        animate={moved ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 0, y: 24 }}
        transition={{ duration: 0.7, ease, delay: moved ? 0.35 : 0 }}
      >
        <ChatWindow logo={logos.claude} name="Claude" frame={front} className="h-full" />
      </motion.div>
    </>
  );
}

/**
 * A new chat in the same AI: the project and the preference are gone, and
 * Maya types them again. With Coere, her first message is enough.
 */
function NewChat({ step, coere }: Props) {
  const history: WindowFrame = {
    label: "Harbor redesign",
    messages: [you("a", "My project is the Harbor site redesign"), ai("b"), you("c", "I like short answers"), ai("d")],
  };
  const fresh: WindowFrame = { label: "New chat", messages: [], greeting: "How can I help you today?" };
  const again = "Again, my project is the Harbor site redesign, and I like short answers";
  const line = { text: `${step === LAST ? "Added" : "Adding"} the Harbor redesign and short answers`, from: "Claude", logo: logos.claude };
  const frame: WindowFrame =
    step === 0
      ? history
      : step === 1
        ? fresh
        : !coere
          ? step === 2
            ? { ...fresh, draft: again }
            : { ...fresh, greeting: undefined, messages: [you("q", again)] }
          : step === 2
            ? { ...fresh, draft: "Plan my week", line }
            : { ...fresh, greeting: undefined, line, messages: [you("q", "Plan my week"), ai("r", "Harbor first, in short:"), ai("s")] };

  return <ChatWindow logo={logos.claude} name="Claude" frame={frame} className="absolute inset-[7%]" />;
}

/**
 * Inside one long chat: the launch date scrolls away under newer messages,
 * the AI asks for it, and pasting the whole chat back swells the box.
 * With Coere, only the date comes back.
 */
function LongChat({ step, coere }: Props) {
  const early = [{ ...you("a", "The launch is on May 3"), dim: step >= 1 }, ai("b"), you("c", "Write the landing page"), ai("d")];
  const later = [you("e", "Now the FAQ"), ai("f"), you("g", "And the pricing table"), ai("h")];
  const line = { text: `${step === LAST ? "Added" : "Adding"} the launch date, May 3`, from: "This chat", logo: logos.gemini };
  const base: WindowFrame = { label: "Launch plan", messages: step === 0 ? early : [...early, ...later] };
  const frame: WindowFrame =
    step <= 1
      ? base
      : !coere
        ? step === 2
          ? { ...base, messages: [...base.messages, you("i", "Write the launch email"), ai("j", "Sure. When is the launch?")] }
          : { ...base, messages: [...base.messages, you("i", "Write the launch email"), ai("j", "Sure. When is the launch?")], pasted: true, draft: "Here is the whole chat again" }
        : step === 2
          ? { ...base, draft: "Write the launch email", line }
          : { ...base, line, messages: [...base.messages, you("i", "Write the launch email"), ai("j", "Here is the email for the May 3 launch.")] };

  return <ChatWindow logo={logos.gemini} name="Gemini" frame={frame} className="absolute inset-[7%]" />;
}

/** Each scene's drawing, by its key in the words. */
export const sceneDrawings: Record<SceneKey, (props: Props) => ReactNode> = { switch: Switch, newChat: NewChat, longChat: LongChat };
