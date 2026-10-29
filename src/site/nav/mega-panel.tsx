"use client";

import { AnimatePresence, motion } from "motion/react";
import type { MouseEvent } from "react";
import type { NavTabId } from "@/site/content/navigation";
import { Container } from "@/site/ui/container";
import { MeasuredHeight } from "./measured-height";
import { PanelFor } from "./panels";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * The white box that slides down from the navbar. It wipes open from the top
 * edge, glides to each menu's height, and crossfades between menus. Following
 * any link inside closes it.
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
          initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0.6 }}
          animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
          exit={{ clipPath: "inset(0 0 100% 0)", opacity: 0.6 }}
          transition={{ duration: 0.32, ease }}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onClick={closeOnLink}
          className="absolute inset-x-0 top-full hidden border-b border-neutral-200 bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.18)] lg:block"
        >
          <MeasuredHeight>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={open}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease }}
              >
                <Container className="py-10">
                  <PanelFor id={open} />
                </Container>
              </motion.div>
            </AnimatePresence>
          </MeasuredHeight>
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
          className="fixed inset-x-0 top-[73px] bottom-0 -z-10 hidden bg-neutral-950/10 backdrop-blur-[2px] lg:block"
        />
      ) : null}
    </AnimatePresence>
  );
}
