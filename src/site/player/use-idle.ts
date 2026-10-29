"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hides the controls after the pointer rests for a moment while the film
 * plays, the way a good player gets out of the way. Any movement, key or tap
 * calls poke() and brings them back. Paused films always show controls.
 */
export function useIdle(enabled: boolean, delay = 2600) {
  const [idle, setIdle] = useState(false);
  const timer = useRef<number | null>(null);

  function poke() {
    setIdle(false);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setIdle(true), delay);
  }

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  return { idle: enabled && idle, poke };
}
