import type { ReactNode } from "react";

/**
 * Two wordings in one place, the side's own showing: both sit in the same
 * cell, so the place keeps the taller one's height and nothing under it
 * moves when the switch flips. The hidden one is invisible, so it is not
 * read out or reached by tab. `block` is for wordings that hold headings
 * or paragraphs.
 */
export function Swap({ coere, today, withCoere, block = false, className = "" }: { coere: boolean; today: ReactNode; withCoere: ReactNode; block?: boolean; className?: string }) {
  const Tag = block ? "div" : "span";
  const side = (shown: boolean) => `[grid-area:1/1] transition-[opacity,visibility] duration-500 motion-reduce:transition-none ${shown ? "opacity-100" : "invisible opacity-0"}`;
  return (
    <Tag className={`grid ${className}`}>
      <Tag className={side(!coere)}>{today}</Tag>
      <Tag className={side(coere)}>{withCoere}</Tag>
    </Tag>
  );
}
