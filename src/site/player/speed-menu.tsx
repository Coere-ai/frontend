"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "@/site/ui/icons/interface-icons";
import { SettingsIcon } from "@/site/ui/icons/player-icons";
import { ControlButton } from "./control-button";

export const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

/** The speed menu: a small list above its button. A click outside or Escape closes it. */
export function SpeedMenu({ speed, onSpeed }: { speed: number; onSpeed: (speed: number) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <ControlButton label="Playback speed" pressed={open} onClick={() => setOpen((o) => !o)}>
        <SettingsIcon size={20} className={`transition-transform duration-300 ${open ? "rotate-45" : ""}`} />
      </ControlButton>
      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            aria-label="Playback speed"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 bottom-full mb-3 w-44 origin-bottom-right rounded-2xl bg-neutral-950/90 p-1.5 text-white shadow-xl backdrop-blur-md"
          >
            <p className="px-3 pt-1.5 pb-1 text-[12px] text-white/60">Speed</p>
            {SPEEDS.map((value) => (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={speed === value}
                onClick={() => {
                  onSpeed(value);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[14px] hover:bg-white/10"
              >
                {value === 1 ? "Normal" : `${value}x`}
                {speed === value ? <CheckIcon size={16} /> : null}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
