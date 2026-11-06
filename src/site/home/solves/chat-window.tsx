"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { StripLine, type MemoryLine } from "./strip-line";
import { Typed } from "./typed";

/** One message in a drawn chat. An AI message with no text is drawn as quiet lines, two unless it says more. */
export type Message = { id: string; who: "you" | "ai"; text?: string; dim?: boolean; lines?: 2 | 3 };

export type { MemoryLine };

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
  /** A window left behind: the words in its box fade, so none show cut at its edge. */
  quiet?: boolean;
};

export const ease = [0.22, 1, 0.36, 1] as const;
const soft = { duration: 0.6, ease };

function Logo({ src, size = 14 }: { src: string; size?: number }) {
  return <Image src={src} alt="" width={size} height={size} unoptimized className="shrink-0" />;
}

const LINE_WIDTHS = { 2: [78, 52], 3: [88, 80, 46] };

/** An AI's reply with no words: two or three short lines. */
function Lines({ count = 2 }: { count?: 2 | 3 }) {
  return (
    <span className="flex flex-col gap-1.5 py-0.5">
      {LINE_WIDTHS[count].map((w) => (
        <span key={w} className="h-1.5 rounded-full bg-neutral-200/80" style={{ width: `${w}%` }} />
      ))}
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
        <Lines count={message.lines} />
      )}
    </motion.div>
  );
}

/**
 * The chat box: Coere's line on top when it has one, the draft, and the
 * send button. A draft wraps as a real box does, so a long one shows all
 * the typing.
 */
function Box({ frame, live }: { frame: WindowFrame; live: boolean }) {
  const lit = Boolean(frame.line);
  return (
    <motion.div layout="position" transition={soft} className={`mx-2.5 mb-2.5 shrink-0 overflow-hidden rounded-2xl ring-1 transition-[box-shadow] duration-500 ${lit ? "ring-brand-200" : "ring-neutral-200"}`}>
      <AnimatePresence initial={false}>
        {frame.line ? (
          <motion.div key="line" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={soft} className="overflow-hidden bg-brand-50">
            <StripLine line={frame.line} live={live} />
          </motion.div>
        ) : null}
        {frame.pasted ? (
          <motion.div key="pasted" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.9, ease }} className="overflow-hidden">
            <span className="flex flex-col gap-1.5 px-2.5 pt-2.5">
              {[92, 84, 70].map((w, i) => (
                <span key={i} className="h-1.5 rounded-full bg-neutral-200/80" style={{ width: `${w}%` }} />
              ))}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <span className="flex min-h-8 items-end gap-2 py-1 pr-1 pl-2.5">
        <span className={`line-clamp-3 min-w-0 flex-1 self-center py-0.5 text-[11.5px] leading-snug transition-opacity duration-500 ${frame.quiet ? "opacity-0" : ""} ${frame.draft ? "text-neutral-800" : "text-neutral-400"}`}>
          {frame.draft ? <Typed key={frame.draft} text={frame.draft} live={live} /> : "Ask anything"}
        </span>
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
 * steps moves softly into place. `live` says the window is playing its
 * scene, so a draft types in and Coere's line loads in; on a still they
 * just show.
 */
export function ChatWindow({ logo, name, frame, live = false, className = "" }: { logo: string; name: string; frame: WindowFrame; live?: boolean; className?: string }) {
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
      <div className={`relative flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden px-3 pt-3 pb-2 ${frame.fromTop ? "justify-start" : "justify-end"}`}>
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
      <Box frame={frame} live={live} />
    </div>
  );
}
