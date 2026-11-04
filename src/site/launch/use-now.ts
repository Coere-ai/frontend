"use client";

import { useSyncExternalStore } from "react";

/**
 * The current second, ticking on the second's boundary, or null while the
 * page is drawn on the server and hydrated. So the static HTML never holds a
 * time that is already wrong, and every timer on the page turns together.
 */

function subscribe(onTick: () => void): () => void {
  let timer: ReturnType<typeof setTimeout>;
  const next = () => {
    timer = setTimeout(() => {
      onTick();
      next();
    }, 1000 - (Date.now() % 1000) + 8);
  };
  next();
  return () => clearTimeout(timer);
}

const currentSecond = () => Math.floor(Date.now() / 1000) * 1000;
const onServer = () => null;

export function useNow(): number | null {
  return useSyncExternalStore(subscribe, currentSecond, onServer);
}
