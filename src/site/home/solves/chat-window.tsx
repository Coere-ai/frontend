"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";

/** One message in a drawn chat. An AI message with no text is drawn as two quiet lines. */
export type Message = { id: string; who: "you" | "ai"; text?: string; dim?: boolean };

/** Coere's line over the chat box, as the extension draws it: what it adds and where from. */
export type MemoryLine = { text: string; from: string; logo: string };

/** What one window shows at one step of its scene. */
export type WindowFrame = {
  label?: string;
  greeting?: string;
  messages: Message[];
  draft?: string;
  line?: MemoryLine;
  /** The person pasted the whole chat back in: the box swells with it. */
  pasted?: boolean;
  /** Messages from the top down, as a chat reads when it opens, rather than up from the box. */
  fromTop?: boolean;
};

export const ease = [0.22, 1, 0.36, 1] as const;
const soft = { duration: 0.6, ease };

function Logo({ src, size = 14 }: { src: string; size?: number }) {
  return <Image src={src} alt="" width={size} height={size} unoptimized className="shrink-0" />;
}

/** An AI's reply with no words: two short lines. */
function Lines() {
  return (
    <span className="flex flex-col gap-1.5 py-1">
      <span className="h-1.5 w-[78%] rounded-full bg-neutral-200/80" />
      <span className="h-1.5 w-[52%] rounded-full bg-neutral-200/80" />
    </span>
  );
}

function Bubble({ message }: { message: Message }) {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: message.dim ? 0.3 : 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={soft}
      className={message.who === "you" ? "ml-auto max-w-[86%]" : "mr-auto w-full max-w-[92%]"}
    >
      {message.who === "you" ? (
        <span className="block rounded-2xl bg-neutral-100 px-2.5 py-1.5 text-[11.5px] leading-snug text-neutral-800">{message.text}</span>
      ) : message.text ? (
        <span className="block py-0.5 text-[11.5px] leading-snug text-neutral-700">{message.text}</span>
      ) : (
        <Lines />
      )}
    </motion.div>
  );
}

/** The chat box: Coere's line on top when it has one, the draft, and the send button. */
function Box({ frame }: { frame: WindowFrame }) {
  const lit = Boolean(frame.line);
  return (
    <motion.div layout="position" transition={soft} className={`mx-2.5 mb-2.5 shrink-0 overflow-hidden rounded-2xl ring-1 transition-[box-shadow] duration-500 ${lit ? "ring-brand-200" : "ring-neutral-200"}`}>
      <AnimatePresence initial={false}>
        {frame.line ? (
          <motion.div key="line" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={soft} className="overflow-hidden bg-brand-50">
            <span className="flex items-center gap-2 px-2.5 py-1 text-[10.5px] leading-snug text-neutral-700">
              <span className="min-w-0 flex-1">{frame.line.text}</span>
              <span className="flex shrink-0 items-center gap-1 text-neutral-500">
                {frame.line.from}
                <Logo src={frame.line.logo} size={11} />
              </span>
            </span>
          </motion.div>
        ) : null}
        {frame.pasted ? (
          <motion.div key="pasted" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.9, ease }} className="overflow-hidden">
            <span className="flex flex-col gap-1.5 px-2.5 pt-2.5">
              {[92, 84, 96, 70, 88, 94, 60].map((w, i) => (
                <span key={i} className="h-1.5 rounded-full bg-neutral-200/80" style={{ width: `${w}%` }} />
              ))}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <span className="flex h-8 items-center gap-2 pr-1 pl-2.5">
        <span className={`min-w-0 flex-1 truncate text-[11.5px] ${frame.draft ? "text-neutral-800" : "text-neutral-400"}`}>{frame.draft ?? "Ask anything"}</span>
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-neutral-950 text-white">
          <ArrowRightIcon size={12} strokeWidth={2} className="-rotate-90" />
        </span>
      </span>
    </motion.div>
  );
}

/**
 * A chat window drawn in the site's own lines: the AI's name, the
 * messages from the bottom up, and the chat box. Whatever changes between
 * steps moves softly into place.
 */
export function ChatWindow({ logo, name, frame, className = "" }: { logo: string; name: string; frame: WindowFrame; className?: string }) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-36px_rgba(0,0,0,0.35)] ring-1 ring-neutral-200 ${className}`}>
      <div className="flex h-8 shrink-0 items-center gap-2 border-b border-neutral-100 px-3 text-[11.5px] font-medium text-neutral-800">
        <Logo src={logo} />
        {name}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={frame.label ?? ""} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="ml-auto truncate font-normal text-neutral-400">
            {frame.label}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className={`relative flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-3 pt-3 pb-2 ${frame.fromTop ? "justify-start" : "justify-end"}`}>
        <AnimatePresence initial={false}>
          {frame.greeting ? (
            <motion.p key="greeting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={soft} className="absolute inset-0 grid place-items-center text-[12.5px] text-neutral-500">
              {frame.greeting}
            </motion.p>
          ) : null}
        </AnimatePresence>
        <AnimatePresence initial={false} mode="popLayout">
          {frame.messages.map((m) => (
            <Bubble key={m.id} message={m} />
          ))}
        </AnimatePresence>
      </div>
      <Box frame={frame} />
    </div>
  );
}
