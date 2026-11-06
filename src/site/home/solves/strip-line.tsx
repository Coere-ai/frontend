"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

/**
 * Coere's line over the chat box: whether the message has gone, what goes
 * in its wordings from fullest to shortest, and the mark of the AI it came
 * from.
 */
export type MemoryLine = { sent: boolean; what: readonly string[]; logo: string };

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * The extension's reveal (context-import/strip/reveal.ts), slowed a little
 * so a visitor can follow it: words start turning from blobs once the line
 * has risen, one after the other, and a word that comes later (the
 * "added" that takes the place of "will add") fades in on its own.
 */
const WORDS_START = 0.45;
const STAGGER = 0.045;
const WORD = 0.3;
const CHANGE = 0.35;

/**
 * Each word keyed by the word and how many times it came before, as the
 * extension's wordsOf does, so a word that stays is the same element from
 * one step to the next and only a new word is drawn anew.
 */
function wordsOf(text: string): { key: string; word: string }[] {
  const seen = new Map<string, number>();
  return text.split(" ").map((word) => {
    const n = seen.get(word) ?? 0;
    seen.set(word, n + 1);
    return { key: `${n}:${word}`, word };
  });
}

/**
 * One word. Drawn with the line, it shows as a blob in a deeper blue that
 * turns into the word in its turn; drawn later, it fades in. The words
 * after a change glide to their new place. On a still it just shows.
 */
function Word({ word, at, load, live, gap }: { word: string; at: number; load: boolean; live: boolean; gap: boolean }) {
  const delay = load ? WORDS_START + at * STAGGER : 0;
  return (
    <motion.span layout="position" transition={{ layout: { duration: 0.4, ease } }} className={`relative inline-block ${gap ? "mr-[0.28em]" : ""}`}>
      {load ? <motion.span aria-hidden="true" className="absolute inset-y-[1px] inset-x-0 rounded-[3px] bg-brand-200" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: WORD, delay }} /> : null}
      <motion.span className="relative" initial={live ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: load ? WORD : CHANGE, delay }}>
        {word}
      </motion.span>
    </motion.span>
  );
}

/** The line's type size, and the step down for the narrowest boxes, in px. */
const TYPE = 10.5;
const SMALL = 10;

/** The logo and the gap before it, in px: what dropping the logo gives back to the words. */
const LOGO_ROOM = 19;

/** The words after the lead, in each wording. The lead is the longer one, so a wording that fits keeps fitting after the send. */
const leadOf = (sent: boolean) => (sent ? "Coere added" : "Coere will add");

/**
 * Which wording fits the row, and whether the logo still does, as the
 * extension's line-fit.ts picks: the fullest wording with the logo, then
 * the shorter ones, and on the narrowest boxes the logo gives way to the
 * words. Past that the type steps down half a pixel, so a word is never
 * cut in two. Measured with a hidden copy of the
 * line's own type, and again when the window changes size.
 */
function useFit(what: readonly string[]) {
  const row = useRef<HTMLSpanElement>(null);
  const probe = useRef<HTMLSpanElement>(null);
  const [fit, setFit] = useState({ at: 0, logo: true, small: false });
  const joined = what.join("\n");
  useLayoutEffect(() => {
    const box = row.current;
    const copy = probe.current;
    if (!box || !copy) return;
    const measure = () => {
      const style = getComputedStyle(box);
      const room = box.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const width = (text: string) => {
        copy.textContent = `${leadOf(false)} ${text}`;
        return copy.getBoundingClientRect().width;
      };
      const last = what.length - 1;
      const tries = [...what.map((_, at) => ({ at, logo: true, small: false })), { at: last, logo: false, small: false }, { at: last, logo: false, small: true }];
      const best = tries.find((t) => width(what[t.at]) * (t.small ? SMALL / TYPE : 1) + (t.logo ? LOGO_ROOM : 0) <= room) ?? tries[tries.length - 1];
      setFit((f) => (f.at === best.at && f.logo === best.logo && f.small === best.small ? f : best));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
    // `joined` stands for `what`, whose array is new each draw.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined]);
  return { row, probe, fit };
}

/**
 * The line as the extension draws it: one row of words, then the logo of
 * the AI the context came from. `live` says it came in while the scene
 * plays, so it loads in; a line on a still just shows. The words are in
 * the page from the first frame either way.
 */
export function StripLine({ line, live }: { line: MemoryLine; live: boolean }) {
  const { row, probe, fit } = useFit(line.what);
  const words = wordsOf(`${leadOf(line.sent)} ${line.what[fit.at]}`);
  // The words the line first drew with load in as blobs; a word drawn later only fades.
  const [first] = useState(() => new Set(live ? words.map((w) => w.key) : []));
  return (
    <span ref={row} className={`relative flex items-center gap-2 px-2.5 py-1 leading-snug text-neutral-700 ${fit.small ? "text-[10px]" : "text-[10.5px]"}`}>
      <span ref={probe} aria-hidden="true" className="invisible absolute text-[10.5px] whitespace-nowrap" />
      <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
        {words.map((w, i) => (
          <Word key={w.key} word={w.word} gap={i < words.length - 1} at={i} load={first.has(w.key)} live={live} />
        ))}
      </span>
      {fit.logo ? (
        <motion.span className="shrink-0" initial={live ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: WORD, delay: WORDS_START + words.length * STAGGER }}>
          <Image src={line.logo} alt="" width={11} height={11} unoptimized />
        </motion.span>
      ) : null}
    </span>
  );
}
