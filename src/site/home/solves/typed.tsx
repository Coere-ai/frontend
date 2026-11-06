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
 * fills.
 */
export function Typed({ text, live }: { text: string; live: boolean }) {
  const [shown, setShown] = useState(live ? 0 : text.length);
  useEffect(() => {
    if (shown >= text.length) return;
    const each = typingMs(text) / text.length;
    const timer = setTimeout(() => setShown((n) => n + 1), each);
    return () => clearTimeout(timer);
  }, [shown, text]);
  return (
    <>
      {text.slice(0, shown)}
      <span className="invisible">{text.slice(shown)}</span>
    </>
  );
}
