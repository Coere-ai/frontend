"use client";

import { useEffect, useState } from "react";

/** How long one letter takes to type, and the bounds on a whole draft, in ms. */
const LETTER_MS = 28;
const MIN_MS = 500;
const MAX_MS = 1500;

/** How long typing `text` takes, so a scene can give its typing step the time it needs. */
export function typingMs(text: string): number {
  return Math.min(MAX_MS, Math.max(MIN_MS, text.length * LETTER_MS));
}

/**
 * A draft as the person types it, a letter at a time. `live` says it was
 * typed while the scene plays; on a still it is there whole. The letters
 * still to come keep their place, unseen, so the box never jumps as it
 * fills. `delay` holds the first letter while something else moves (a new
 * chat scrolling in), and the box shows `placeholder` until it comes.
 */
export function Typed({ text, live, delay = 0, placeholder }: { text: string; live: boolean; delay?: number; placeholder?: string }) {
  const [shown, setShown] = useState(live ? 0 : text.length);
  const [ready, setReady] = useState(!live || delay === 0);
  useEffect(() => {
    if (ready) return;
    const timer = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(timer);
  }, [ready, delay]);
  useEffect(() => {
    if (!ready || shown >= text.length) return;
    const each = typingMs(text) / text.length;
    const timer = setTimeout(() => setShown((n) => n + 1), each);
    return () => clearTimeout(timer);
  }, [ready, shown, text]);
  return (
    <>
      {shown === 0 && placeholder ? <span className="absolute top-0.5 left-0 text-neutral-400">{placeholder}</span> : null}
      {text.slice(0, shown)}
      <span className="invisible">{text.slice(shown)}</span>
    </>
  );
}
