"use client";

import { useEffect, useRef, useState } from "react";
import type { NavTabId } from "@/site/content/navigation";

/** Wait before the first panel opens, so a cursor passing over the tabs doesn't flash one open. */
const OPEN_DELAY_MS = 90;
/** Wait before closing, so moving from a tab down into its panel never drops it. */
const CLOSE_DELAY_MS = 160;

/**
 * Which navbar menu is open, driven by hover and focus. Once a menu is open,
 * moving to another tab switches at once, the way a menu bar should feel.
 */
export function useMenu() {
  const [open, setOpen] = useState<NavTabId | null>(null);
  const timer = useRef<number | null>(null);

  function cancel() {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  }

  function show(id: NavTabId, immediate = false) {
    cancel();
    if (open !== null || immediate) {
      setOpen(id);
      return;
    }
    timer.current = window.setTimeout(() => setOpen(id), OPEN_DELAY_MS);
  }

  function hide(delay = CLOSE_DELAY_MS) {
    cancel();
    timer.current = window.setTimeout(() => setOpen(null), delay);
  }

  function close() {
    cancel();
    setOpen(null);
  }

  // Escape closes whatever is open.
  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // A timer left running after unmount would set state on nothing.
  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  return { open, show, hide, close, cancel };
}
