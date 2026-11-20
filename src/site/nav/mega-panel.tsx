"use client";

import { AnimatePresence, motion } from "motion/react";
import type { MouseEvent } from "react";
import type { NavTabId } from "@/site/content/navigation";
import { MeasuredHeight } from "./measured-height";
import { PanelFor } from "./panels";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * The dark glass card that drops under the glass bar, the bar's width with
 * the same soft corners. It wipes open from the top, glides to each menu's
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
          {/* --u-color turns the hover lines white; the header sits outside the dark page theme. */}
          <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[#12111b]/95 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl [--u-color:#fff]">
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

/** A dim dark veil over the page while a menu is open; clicking it closes the menu. */
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
          className="fixed inset-0 -z-10 hidden bg-[#0b0a12]/50 backdrop-blur-[2px] lg:block"
        />
      ) : null}
    </AnimatePresence>
  );
}
