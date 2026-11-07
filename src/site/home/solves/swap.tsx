import type { ReactNode } from "react";

/**
 * How the switch hands one side's words to the other, in ms: the old ones
 * fade out first, then the new ones fade in, so two wordings never sit on
 * each other. The scenes' cross fade takes the same time in all
 * (scene-row.tsx).
 */
export const SWAP_OUT_MS = 150;
export const SWAP_IN_MS = 250;

/**
 * Two wordings in one place, the side's own showing: both sit in the same
 * cell, at its top, so the place keeps the taller one's height and nothing
 * under it moves when the switch flips. The hidden one is invisible, so it
 * is not read out or reached by tab. `block` is for wordings that hold
 * headings or paragraphs.
 */
export function Swap({ coere, today, withCoere, block = false, className = "" }: { coere: boolean; today: ReactNode; withCoere: ReactNode; block?: boolean; className?: string }) {
  const Tag = block ? "div" : "span";
  // The side going out fades and then turns invisible; the side coming in waits for it, then shows and fades in.
  const side = (shown: boolean) => `[grid-area:1/1] transition-[opacity,visibility] motion-reduce:transition-none ${shown ? "opacity-100" : "invisible opacity-0"}`;
  const timing = (shown: boolean) => ({ transitionDuration: `${shown ? SWAP_IN_MS : SWAP_OUT_MS}ms`, transitionDelay: `${shown ? SWAP_OUT_MS : 0}ms` });
  return (
    <Tag className={`grid content-start ${className}`}>
      <Tag className={side(!coere)} style={timing(!coere)}>
        {today}
      </Tag>
      <Tag className={side(coere)} style={timing(coere)}>
        {withCoere}
      </Tag>
    </Tag>
  );
}
