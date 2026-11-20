"use client";

import { AnimatePresence, motion } from "motion/react";
import type { MouseEvent } from "react";
import type { NavTabId } from "@/site/content/navigation";
import { MeasuredHeight } from "./measured-height";
import { PanelFor } from "./panels";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * The white card that drops under the glass bar, the bar's width with the
 * same soft corners. It wipes open from the top, glides to each menu's
 * height, and crossfades between menus. Its top padding is a clear bridge
 * from the tabs, so the pointer never falls into a gap. Following any link
 * inside closes it.
 */
export function MegaPanel({
  open,
  onEnter,
  onLeave,
  onNavigate,
}: {
  open: NavTabId | null;
  onEnter: () => void;
  onLeave: () => void;
  onNavigate: () => void;
}) {
  function closeOnLink(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("a")) onNavigate();
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id="site-menu"
          key="panel"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.24, ease }}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onClick={closeOnLink}
          className="absolute inset-x-0 top-full hidden pt-2 lg:block"
        >
          <div className="overflow-hidden rounded-[20px] border border-neutral-200/80 bg-white shadow-[0_30px_80px_-30px_rgba(20,17,15,0.3)]">
            <MeasuredHeight>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={open}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease }}
                  className="px-8 py-9 xl:px-10"
                >
                  <PanelFor id={open} />
                </motion.div>
              </AnimatePresence>
            </MeasuredHeight>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** A light veil over the page while a menu is open; clicking it closes the menu. */
export function MenuBackdrop({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 -z-10 hidden bg-neutral-950/10 backdrop-blur-[2px] lg:block"
        />
      ) : null}
    </AnimatePresence>
  );
}
