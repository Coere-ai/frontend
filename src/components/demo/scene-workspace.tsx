"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AgentLogo } from "@/components/agent-logo";
import { LogoMark } from "@/components/logo";
import {
  AssistantMessage,
  BrowserFrame,
  ChatApp,
  Citations,
  CodeBlock,
  Composer,
  ResultTable,
  UserMessage,
} from "./chat-window";
import {
  BRANDS,
  CODING,
  MONTAGE,
  PROJECT,
  RECENTS,
  TRANSFER,
  VARIATIONS,
  montageDelay,
  type Message,
  type Variation,
} from "./data";
import { Cursor, Rolling, formatClock, formatInt } from "./bits";
import { EASE, EASE_HERO, EASE_PULL } from "./timeline";
import type { DemoClock } from "./use-demo-clock";

const TYPED = `I have a project called ${PROJECT}`;

type Flight = { from: number; to: number; top: number; width: number };

/**
 * The pair of windows is one cell of a 3 by 3 grid. Until the zoom out the grid
 * is scaled up so only the middle cell is on screen, which means the camera
 * pulls back off the very same windows you have been watching.
 */
const CELL_W = 1176;
const CELL_H = 532;
const CELL_SCALE = 0.34;
const COLUMNS = 5;
const ROWS = 5;
const CELLS = COLUMNS * ROWS;
const HERO = Math.floor(CELLS / 2);
const GAP = 16;
/** Scale that fits the whole grid on the stage once it is pulled back. */
const WIDE = 1280 / (COLUMNS * CELL_W * CELL_SCALE + (COLUMNS - 1) * GAP);
/** Scale that leaves only the middle cell on screen, at full size. */
const ZOOM = 1 / CELL_SCALE;

/** Acts 2 and 3: the transfer, then the same hand-off everywhere at once. */
export function SceneWorkspace({ clock }: { clock: DemoClock }) {
  const stage = useRef<HTMLDivElement>(null);
  const sourceCapsule = useRef<HTMLDivElement>(null);
  const destSlot = useRef<HTMLDivElement>(null);
  const [flight, setFlight] = useState<Flight | null>(null);

  const montage = useMontage(clock);
  const step = montage >= 0 ? MONTAGE[montage % MONTAGE.length] : null;

  const variation: Variation = step ? VARIATIONS[step.variation] : CODING;
  const sourceBrand = BRANDS[step ? step.source : "chatgpt"];
  const destBrand = BRANDS[step ? step.dest : "claude"];

  const flying = clock.at("fly") && !clock.at("sent");
  const wall = clock.at("wall");
  const { caption, focus } = narration(clock, montage >= 0, wall);

  // Measure both ends of the hand-off from the real layout, so the capsule
  // lands exactly on the slot waiting for it.
  useEffect(() => {
    if (!flying) return;
    const root = stage.current;
    const start = sourceCapsule.current;
    const end = destSlot.current;
    if (!root || !start || !end) return;

    const measure = setTimeout(() => {
      const base = root.getBoundingClientRect();
      const scale = base.width / 1280;
      const a = start.getBoundingClientRect();
      const b = end.getBoundingClientRect();
      setFlight({
        from: (a.left - base.left) / scale,
        to: (b.left - base.left) / scale,
        top: (a.top - base.top) / scale,
        width: a.width / scale,
      });
    }, 0);
    return () => clearTimeout(measure);
  }, [flying]);

  return (
    <div ref={stage} className="absolute inset-0">
      {/* a soft band so the line stays readable once the wall fills the frame */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[160px] bg-gradient-to-b from-white via-white/90 to-transparent"
        initial={false}
        animate={{ opacity: wall ? 1 : 0 }}
        transition={{ duration: 1, ease: EASE }}
      />

      <div className="absolute inset-x-0 top-[26px] z-20 flex justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={caption}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="text-[30px] font-semibold tracking-[-0.03em] text-ink-900/75"
          >
            {caption}
          </motion.p>
        </AnimatePresence>
      </div>

      <motion.div
        data-grid
        className="absolute inset-0 grid place-content-center"
        style={{
          gridTemplateColumns: `repeat(${COLUMNS}, max-content)`,
          gap: GAP,
        }}
        initial={false}
        animate={{ scale: wall ? WIDE : ZOOM }}
        transition={{ duration: 4.6, ease: EASE_PULL }}
      >
        {Array.from({ length: CELLS }, (_, index) => (
          <div
            key={index}
            style={{ width: CELL_W * CELL_SCALE, height: CELL_H * CELL_SCALE }}
          >
            <div
              style={{
                width: CELL_W,
                height: CELL_H,
                transform: `scale(${CELL_SCALE})`,
                transformOrigin: "top left",
              }}
            >
              {index === HERO ? (
                <div className="flex h-full gap-9">
                  <motion.div
                    className="flex-1"
                    initial={{ opacity: 0, y: 36 }}
                    animate={{
                      opacity: clock.at("stage-in")
                        ? focus === "right"
                          ? 0.5
                          : 1
                        : 0,
                      y: clock.at("stage-in") ? 0 : 36,
                    }}
                    transition={{ duration: 1, ease: EASE_HERO }}
                  >
                    <BrowserFrame brand={sourceBrand}>
                      <ChatApp
                        brand={sourceBrand}
                        chats={RECENTS[variation.kind]}
                        activeChat={variation.title}
                        composer={<Composer brand={sourceBrand} />}
                        badge={
                          <ReadingBadge
                            reading={
                              montage < 0 &&
                              clock.at("scan") &&
                              !clock.at("compress")
                            }
                            sent={montage < 0 && clock.at("fly")}
                          />
                        }
                      >
                        <SourcePane
                          clock={clock}
                          brand={sourceBrand}
                          variation={variation}
                          capsuleRef={sourceCapsule}
                          hideCapsule={flying}
                          live={montage < 0}
                        />
                      </ChatApp>
                    </BrowserFrame>
                  </motion.div>

                  <motion.div
                    className="flex-1"
                    initial={{ opacity: 0, y: 36 }}
                    animate={{
                      opacity: clock.at("stage-in")
                        ? focus === "left"
                          ? 0.5
                          : 1
                        : 0,
                      y: clock.at("stage-in") ? 0 : 36,
                    }}
                    transition={{ duration: 1, ease: EASE_HERO, delay: 0.1 }}
                  >
                    <BrowserFrame brand={destBrand}>
                      <ChatApp
                        brand={destBrand}
                        chats={RECENTS[variation.kind]}
                        activeChat={step ? variation.title : "New chat"}
                        composer={
                          <DestComposer
                            clock={clock}
                            brandKey={destBrand.name}
                          />
                        }
                      >
                        <DestPane
                          clock={clock}
                          brand={destBrand}
                          variation={variation}
                          slotRef={destSlot}
                          montage={montage >= 0}
                        />
                      </ChatApp>
                    </BrowserFrame>
                  </motion.div>
                </div>
              ) : (
                <ClonePair
                  clock={clock}
                  step={montage}
                  offset={index}
                  show={wall}
                />
              )}
            </div>
          </div>
        ))}
      </motion.div>

      {/* the capsule crossing the gap, measured from the real layout */}
      <AnimatePresence>
        {flying && flight ? (
          <motion.div
            className="absolute z-30"
            style={{ top: flight.top, width: flight.width }}
            initial={{ x: flight.from, opacity: 0, scale: 0.97 }}
            animate={{ x: flight.to, opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              x: { type: "spring", stiffness: 110, damping: 20, mass: 0.8 },
              opacity: { duration: 0.25, ease: EASE },
            }}
          >
            <CapsuleCard lines={variation.capsule} elevated />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * One of the eight surrounding cells: the same two windows, a different pair of
 * products, switching on the same beat but out of phase with the middle.
 */
function ClonePair({
  clock,
  step,
  offset,
  show,
}: {
  clock: DemoClock;
  step: number;
  offset: number;
  show: boolean;
}) {
  const index = Math.max(0, step);
  const entry = MONTAGE[(index + offset * 3) % MONTAGE.length];
  const variation = VARIATIONS[(entry.variation + offset) % VARIATIONS.length];
  const source = BRANDS[entry.source];
  const dest = BRANDS[entry.dest];

  return (
    <motion.div
      className="flex h-full gap-9"
      initial={false}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 1.8, ease: EASE, delay: show ? 0.4 : 0 }}
    >
      <div className="flex-1">
        <BrowserFrame brand={source}>
          <ChatApp
            brand={source}
            chats={RECENTS[variation.kind]}
            activeChat={variation.title}
            composer={<Composer brand={source} />}
          >
            <SourcePane
              clock={clock}
              brand={source}
              variation={variation}
              capsuleRef={null}
              hideCapsule={false}
              live={false}
            />
          </ChatApp>
        </BrowserFrame>
      </div>
      <div className="flex-1">
        <BrowserFrame brand={dest}>
          <ChatApp
            brand={dest}
            chats={RECENTS[variation.kind]}
            activeChat={variation.title}
            composer={<Composer brand={dest} />}
          >
            <DestPane
              clock={clock}
              brand={dest}
              variation={variation}
              slotRef={null}
              montage
            />
          </ChatApp>
        </BrowserFrame>
      </div>
    </motion.div>
  );
}

/** Coere working, shown in the app header rather than over the thread. */
function ReadingBadge({ reading, sent }: { reading: boolean; sent: boolean }) {
  const show = reading || sent;
  return (
    <motion.span
      className="flex items-center gap-1.5 rounded-full bg-brand-50 px-2 py-1 whitespace-nowrap ring-1 ring-brand-200"
      initial={false}
      animate={{ opacity: show ? 1 : 0, x: show ? 0 : -4 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <LogoMark className="h-2.5 w-2.5 text-brand-500" />
      <span className="text-[9.5px] font-medium text-brand-700">
        {sent ? "Capsule sent" : "Coere is reading this chat"}
      </span>
    </motion.span>
  );
}

/** The line at the top, and which window it points at. */
function narration(clock: DemoClock, montage: boolean, wall: boolean) {
  if (wall) return { caption: "Same memory, every model", focus: null };
  if (montage) return { caption: "Same memory, every model", focus: null };
  if (clock.at("fly"))
    return { caption: "and hands it to Claude", focus: "right" as const };
  if (clock.at("scan"))
    return {
      caption: "Coere reads the chat and compresses it",
      focus: "left" as const,
    };
  if (clock.at("coere-popup"))
    return {
      caption: "Coere spots the project you already explained",
      focus: "right" as const,
    };
  if (clock.at("right-typing"))
    return {
      caption: "You open Claude for the next step",
      focus: "right" as const,
    };
  return {
    caption: "A project you already explained in ChatGPT",
    focus: "left" as const,
  };
}

/** Steps through the montage with gaps that shrink to a fifth of a second. */
function useMontage(clock: DemoClock) {
  const [step, setStep] = useState(-1);
  const running = clock.at("montage") && !clock.at("dash-in");

  useEffect(() => {
    if (!running) {
      const reset = setTimeout(() => setStep(-1), 0);
      return () => clearTimeout(reset);
    }
    let index = 0;
    let timer = setTimeout(function tick() {
      setStep(index);
      const delay = montageDelay(index);
      index += 1;
      timer = setTimeout(tick, delay);
    }, 0);
    return () => clearTimeout(timer);
  }, [running]);

  return running ? step : -1;
}

/** The chat you already had: coding, research or writing. */
function SourcePane({
  clock,
  brand,
  variation,
  capsuleRef,
  hideCapsule,
  live,
}: {
  clock: DemoClock;
  brand: (typeof BRANDS)[string];
  variation: Variation;
  capsuleRef: React.RefObject<HTMLDivElement | null> | null;
  hideCapsule: boolean;
  live: boolean;
}) {
  const reading = live && clock.at("scan") && !clock.at("compress");
  const compressed = live && clock.at("compress") && !clock.at("fly");
  const sent = live && clock.at("fly");

  return (
    <div className="relative h-full overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: compressed ? 0 : sent ? 0.35 : 1 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <motion.div
          className="space-y-2.5 pt-0.5 pl-5"
          initial={false}
          animate={{ y: live && clock.at("scan") ? -30 : 0 }}
          transition={{ duration: 1.4, ease: EASE }}
        >
          {variation.messages.map((message, index) => (
            <motion.div
              key={`${variation.title}-${index}`}
              className="relative"
              initial={false}
              animate={{
                opacity: !live || clock.at("left-thread") ? 1 : 0,
                y: !live || clock.at("left-thread") ? 0 : 8,
              }}
              transition={{
                duration: 0.45,
                ease: EASE,
                delay: live ? 0.1 + index * 0.12 : 0,
              }}
            >
              <Bubble brand={brand} message={message} />

              <motion.span
                className="absolute top-0.5 -left-5 grid h-[15px] w-[15px] place-items-center rounded-full bg-brand-500 text-white"
                initial={false}
                animate={{
                  opacity: reading ? 1 : 0,
                  scale: reading ? 1 : 0.4,
                }}
                transition={{
                  duration: 0.3,
                  ease: EASE,
                  delay: reading ? 0.3 + index * 0.28 : 0,
                }}
              >
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
                  <path
                    d="M2.5 6.2 4.7 8.4 9.5 3.6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.span>
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence>
          {reading ? (
            <motion.div
              className="pointer-events-none absolute inset-x-0 h-20 bg-[linear-gradient(to_bottom,transparent,rgba(82,103,247,0.12),transparent)]"
              initial={{ top: -80 }}
              animate={{ top: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.4, ease: "easeInOut" }}
            />
          ) : null}
        </AnimatePresence>
      </motion.div>

      {/* the capsule Coere builds out of that chat */}
      <motion.div
        className="absolute inset-0 flex flex-col justify-center"
        initial={false}
        animate={{
          opacity: compressed && !hideCapsule ? 1 : 0,
          scale: compressed ? 1 : 0.98,
        }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div ref={capsuleRef}>
          <CapsuleCard lines={variation.capsule} reveal={compressed} />
        </div>
        <Savings show={compressed} />
      </motion.div>
    </div>
  );
}

function Bubble({
  brand,
  message,
}: {
  brand: (typeof BRANDS)[string];
  message: Message;
}) {
  if (message.role === "user") {
    return <UserMessage brand={brand}>{message.text}</UserMessage>;
  }

  return (
    <AssistantMessage brand={brand}>
      <p>{message.text}</p>
      {message.code ? (
        <CodeBlock lines={message.code} filename={message.filename} />
      ) : null}
      {message.table ? (
        <ResultTable head={message.table.head} rows={message.table.rows} />
      ) : null}
      {message.sources ? <Citations items={message.sources} /> : null}
      {message.after ? (
        <p className="text-ink-900/60">{message.after}</p>
      ) : null}
    </AssistantMessage>
  );
}

/** The new chat that ends up with the whole project in it. */
function DestPane({
  clock,
  brand,
  variation,
  slotRef,
  montage,
}: {
  clock: DemoClock;
  brand: (typeof BRANDS)[string];
  variation: Variation;
  slotRef: React.RefObject<HTMLDivElement | null> | null;
  montage: boolean;
}) {
  const landed = montage || clock.at("sent");
  const replying = montage || clock.at("reply");
  // the greeting clears as the capsule arrives, not after it lands
  const clearing = montage || clock.at("fly");

  return (
    <div className="flex h-full flex-col justify-end gap-2.5 overflow-hidden pb-0.5">
      <AnimatePresence>
        {clearing ? null : (
          <motion.div
            key="empty"
            className="flex flex-1 flex-col items-center justify-center gap-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <AgentLogo src={brand.logo} name={brand.name} size={24} />
            <p className="text-[14px] tracking-[-0.01em] text-ink-900/40">
              {brand.greeting}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={slotRef}
        className="flex justify-end"
        initial={false}
        animate={{ opacity: landed ? 1 : 0 }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        <div className="w-full">
          <CapsuleCard lines={variation.capsule} reveal={landed} />
        </div>
      </motion.div>

      <motion.div
        initial={false}
        animate={{ opacity: landed ? 1 : 0 }}
        transition={{ duration: 0.35, ease: EASE, delay: landed ? 0.1 : 0 }}
      >
        <UserMessage brand={brand}>
          {montage ? `Continue this in ${brand.name}` : TYPED}
        </UserMessage>
      </motion.div>

      <motion.div
        initial={false}
        animate={{ opacity: landed ? 1 : 0 }}
        transition={{ duration: 0.35, ease: EASE, delay: landed ? 0.15 : 0 }}
      >
        <AssistantMessage brand={brand}>
          {variation.reply.map((line, index) => (
            <motion.p
              key={line}
              initial={false}
              animate={{ opacity: replying ? 1 : 0 }}
              transition={{
                duration: 0.4,
                ease: EASE,
                delay: replying && !montage ? index * 0.5 : 0,
              }}
            >
              {line}
            </motion.p>
          ))}
        </AssistantMessage>
      </motion.div>

      <CoerePrompt clock={clock} hidden={montage} />
    </div>
  );
}

/** Coere spotting the project, and the click that accepts it. */
function CoerePrompt({ clock, hidden }: { clock: DemoClock; hidden: boolean }) {
  const show = !hidden && clock.at("coere-popup") && !clock.at("fly");
  const accepted = clock.at("cursor-yes");

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className="relative rounded-[14px] bg-white p-3 ring-1 ring-brand-200 ring-inset"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.5, ease: EASE_HERO }}
        >
          <div className="flex items-center gap-2">
            <LogoMark className="h-3.5 w-3.5 text-brand-500" />
            <span className="text-[10.5px] font-medium text-brand-700">
              Coere
            </span>
          </div>

          <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-900/75">
            Found this project in ChatGPT. Want it here?
          </p>

          <div className="mt-2 flex items-center gap-2 rounded-lg bg-ink-900/[0.03] px-2.5 py-1.5">
            <AgentLogo src={BRANDS.chatgpt.logo} name="ChatGPT" size={14} />
            <span className="flex-1 truncate text-[11px] text-ink-900/70">
              {PROJECT}
            </span>
            <span className="text-[10px] text-ink-900/40">
              {TRANSFER.sourceChats} chats, {formatInt(TRANSFER.tokensBefore)}{" "}
              tokens
            </span>
          </div>

          {/* the cursor lives beside the button, so it can never drift off it */}
          <div className="relative mt-2.5 flex items-center gap-2">
            <motion.span
              className="rounded-full bg-brand-600 px-3 py-1.5 text-[11px] font-medium text-white"
              initial={false}
              animate={{ scale: accepted ? [1, 0.95, 1] : 1 }}
              transition={{ duration: 0.32, ease: EASE }}
            >
              {accepted ? "Transferring" : "Transfer context"}
            </motion.span>
            <span className="rounded-full px-2 py-1.5 text-[11px] text-ink-900/40">
              Not now
            </span>

            <motion.span
              className="ml-auto flex items-center gap-1.5 text-[10px] text-brand-600"
              initial={false}
              animate={{ opacity: accepted ? 1 : 0 }}
              transition={{ duration: 0.35, ease: EASE, delay: 0.15 }}
            >
              <motion.span
                className="block h-1.5 w-1.5 rounded-full bg-brand-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.1, repeat: Infinity }}
              />
              reading {TRANSFER.sourceChats} chats
            </motion.span>

            <Cursor
              visible={show && !clock.at("scan")}
              pressed={accepted}
              x={clock.at("cursor-move") ? 52 : 214}
              y={clock.at("cursor-move") ? 12 : 64}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** The composer on the right, typed into by hand. */
function DestComposer({
  clock,
  brandKey,
}: {
  clock: DemoClock;
  brandKey: string;
}) {
  const brand =
    Object.values(BRANDS).find((entry) => entry.name === brandKey) ??
    BRANDS.claude;
  const typing = clock.at("right-typing") && !clock.at("sent");
  const typed = useTypewriter(TYPED, typing);

  if (!typing) return <Composer brand={brand} />;

  return (
    <Composer brand={brand}>
      <p className="truncate text-[11px] text-ink-900/75">
        {typed}
        {typed.length < TYPED.length ? (
          <span className="ml-px inline-block h-3 w-px translate-y-0.5 bg-ink-900/50" />
        ) : null}
      </p>
    </Composer>
  );
}

/** The compressed context, the one object the whole film is about. */
function CapsuleCard({
  lines,
  elevated,
  reveal = true,
}: {
  lines: readonly string[];
  elevated?: boolean;
  reveal?: boolean;
}) {
  return (
    <div
      className={`rounded-[14px] bg-brand-50/80 p-3 ring-1 ring-brand-200 ring-inset ${
        elevated ? "shadow-[0_24px_55px_-26px_rgb(8_14_36_/_0.5)]" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <LogoMark className="h-3 w-3 text-brand-500" />
        <span className="text-[10px] font-medium text-brand-700">
          Capsule, {TRANSFER.sourceChats} chats
        </span>
        <span className="ml-auto text-[9.5px] text-ink-900/40">
          {formatInt(TRANSFER.tokensAfter)} tokens
        </span>
      </div>
      {/* fixed height so swapping variations never nudges the layout */}
      <ul className="mt-2 min-h-[92px] space-y-0.5">
        {lines.map((line, index) => (
          <motion.li
            key={line}
            initial={false}
            animate={{ opacity: reveal ? 1 : 0 }}
            transition={{
              duration: 0.28,
              ease: EASE,
              delay: reveal ? 0.08 + index * 0.06 : 0,
            }}
            className="text-[10.5px] leading-[1.55] text-ink-900/70"
          >
            {line}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/** Tokens and time, before against after. */
function Savings({ show }: { show: boolean }) {
  return (
    <motion.div
      className="mt-3.5 flex gap-7"
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 8 }}
      transition={{ duration: 0.45, ease: EASE, delay: show ? 0.6 : 0 }}
    >
      <Stat
        label="Tokens"
        before={formatInt(TRANSFER.tokensBefore)}
        after={<Rolling value={TRANSFER.tokensAfter} format={formatInt} />}
      />
      <Stat
        label="Time"
        before={formatClock(TRANSFER.secondsBefore)}
        after={formatClock(TRANSFER.secondsAfter)}
      />
    </motion.div>
  );
}

function Stat({
  label,
  before,
  after,
}: {
  label: string;
  before: string;
  after: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[9.5px] text-ink-900/40">{label}</p>
      <p className="mt-0.5 flex items-baseline gap-2">
        <span className="text-[12px] text-ink-900/30 line-through">
          {before}
        </span>
        <span className="text-[20px] font-semibold tracking-[-0.02em] text-brand-600 tabular-nums">
          {after}
        </span>
      </p>
    </div>
  );
}

/** Types text out once, while active. */
function useTypewriter(text: string, active: boolean, speed = 42) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!active) return;
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setTyped(text.slice(0, index));
      if (index >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, active, speed]);

  return typed;
}
