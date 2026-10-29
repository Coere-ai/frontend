"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import type { Background } from "@/site/content/backgrounds";
import { ArrowLink } from "@/site/ui/arrow-link";
import { CheckList } from "./check-list";
import { Stage } from "./stage";

export type ShowcaseItem = {
  key: string;
  title: string;
  summary: string;
  checks: string[];
  href?: string;
  linkLabel?: string;
  /** What the panel shows while this item is open: usually a film. */
  visual: ReactNode;
};

/**
 * A demo panel beside a list that opens one item at a time. Opening an item
 * swaps the panel to its demo. The open item is marked by a blue rule above
 * it; the others sit under thin grey ones.
 */
export function AccordionShowcase({ items, background, flip = false }: { items: ShowcaseItem[]; background: Background; flip?: boolean }) {
  const [open, setOpen] = useState(items[0].key);
  const active = items.find((item) => item.key === open) ?? items[0];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-20">
      <Stage background={background} className={`aspect-[4/3] ${flip ? "lg:order-2" : ""}`}>
        <AnimatePresence initial={false}>
          <motion.div
            key={active.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 flex items-center justify-center p-[6%]"
          >
            <div className="w-full overflow-hidden rounded-2xl shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)] ring-1 ring-white/10">{active.visual}</div>
          </motion.div>
        </AnimatePresence>
      </Stage>

      <ul>
        {items.map((item) => {
          const isOpen = item.key === active.key;
          return (
            <li key={item.key} className="relative border-t border-neutral-300">
              {isOpen ? <span aria-hidden="true" className="absolute inset-x-0 -top-px h-0.5 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-700" /> : null}
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(item.key)}
                className="w-full py-5 text-left text-2xl font-medium tracking-[-0.025em] text-neutral-950"
              >
                {item.title}
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden" inert={!isOpen}>
                  <p className="text-[16px] leading-relaxed text-neutral-600">{item.summary}</p>
                  <CheckList items={item.checks} className="mt-6" />
                  {item.href ? <ArrowLink href={item.href} className="mt-7 text-neutral-950">{item.linkLabel ?? "Learn more"}</ArrowLink> : null}
                  <div className="h-8" />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
