"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useLayoutEffect, useRef, useState, type Ref } from "react";

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

/** The gap after each word but the last, as the line draws it. */
const GAP = "mr-[0.28em]";

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
    <motion.span layout="position" transition={{ layout: { duration: 0.4, ease } }} className={`relative inline-block ${gap ? GAP : ""}`}>
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

/** One way to set the line: which wording, with the logo or not, and at the smaller type or not. */
type Fit = { at: number; logo: boolean; small: boolean };

/** Every way to set the line, fullest first, as the extension's line-fit.ts tries them. */
function waysFor(count: number): Fit[] {
  const last = count - 1;
  return [...Array.from({ length: count }, (_, at) => ({ at, logo: true, small: false })), { at: last, logo: false, small: false }, { at: last, logo: false, small: true }];
}

/**
 * Which way of setting the line fits its row, as the extension's
 * line-fit.ts picks: the fullest wording with the logo, then the shorter
 * ones, and on the narrowest boxes the logo gives way to the words. Past
 * that the type steps down half a pixel, so a word is never cut in two.
 * Each wording is measured as the line draws it (`Probe`), with the longer
 * lead, and again when the row changes size and when the site's font has
 * loaded, since the fallback font is narrower. Then the real row is
 * checked: if its words still run past it, the next way is taken.
 */
function useFit(what: readonly string[]) {
  const row = useRef<HTMLSpanElement>(null);
  const shown = useRef<HTMLSpanElement>(null);
  const probe = useRef<HTMLSpanElement>(null);
  const ways = waysFor(what.length);
  const [pick, setPick] = useState(0);
  const joined = what.join("\n");
  useLayoutEffect(() => {
    const box = row.current;
    const copies = probe.current;
    if (!box || !copies) return;
    const measure = () => {
      const style = getComputedStyle(box);
      const room = box.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const widths = Array.from(copies.children, (copy) => copy.getBoundingClientRect().width);
      const best = ways.findIndex((way) => widths[way.at] * (way.small ? SMALL / TYPE : 1) + (way.logo ? LOGO_ROOM : 0) <= room);
      setPick(best === -1 ? ways.length - 1 : best);
    };
    measure();
    let gone = false;
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    document.fonts.ready.then(() => gone || measure());
    document.fonts.addEventListener("loadingdone", measure);
    return () => {
      gone = true;
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", measure);
    };
    // `joined` stands for `what`, whose array is new each draw, and `ways` follows from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined]);
  useLayoutEffect(() => {
    const words = shown.current;
    if (words && words.scrollWidth > words.clientWidth + 0.5 && pick < ways.length - 1) setPick(pick + 1);
  }, [pick, joined, ways.length]);
  return { row, shown, probe, fit: ways[Math.min(pick, ways.length - 1)] };
}

/** Each wording, unseen, set as the line sets its words, so useFit measures what will show. */
function Probe({ what, ref }: { what: readonly string[]; ref: Ref<HTMLSpanElement> }) {
  return (
    <span ref={ref} aria-hidden="true" className="invisible absolute top-0 left-0 text-[10.5px]">
      {what.map((text) => (
        <span key={text} className="block w-max whitespace-nowrap">
          {wordsOf(`${leadOf(false)} ${text}`).map((w, i, all) => (
            <span key={w.key} className={`inline-block ${i < all.length - 1 ? GAP : ""}`}>
              {w.word}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

/**
 * The line as the extension draws it: one row of words, then the logo of
 * the AI the context came from. `live` says it came in while the scene
 * plays, so it loads in; a line on a still just shows. The words are in
 * the page from the first frame either way.
 */
export function StripLine({ line, live }: { line: MemoryLine; live: boolean }) {
  const { row, shown, probe, fit } = useFit(line.what);
  const words = wordsOf(`${leadOf(line.sent)} ${line.what[fit.at]}`);
  // The words the line first drew with load in as blobs; a word drawn later only fades.
  const [first] = useState(() => new Set(live ? words.map((w) => w.key) : []));
  return (
    <span ref={row} className={`relative flex items-center gap-2 px-2.5 py-1 leading-snug text-neutral-700 ${fit.small ? "text-[10px]" : "text-[10.5px]"}`}>
      <Probe ref={probe} what={line.what} />
      <span ref={shown} className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
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
