"use client";

import { useRef, type ReactNode } from "react";
import { LaserFlow } from "@/site/bits/LaserFlow";

/** Keeps only the rim's padding ring: the whole box minus its content box. */
const RIM_MASK = {
  mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
} as const;

/**
 * The app in a hero, with a beam of Coere blue falling onto its top edge.
 * The beam's canvas sits behind the frame and reaches up past it, so the
 * beam lands in the middle of the frame at every width. Its light is kept
 * to about the frame's width: a wide spread and a strong spill send it
 * along the top edge and down round both top corners, a low flare keeps
 * the wisps close, and the canvas stops a little past the frame's sides.
 * A rim of light on the frame's top edge, bending down round its corners,
 * finishes the wash. On a phone the beam only reaches into the gap above
 * the frame, so it never runs through the words. The hero clips whatever
 * reaches past its top.
 */
export function LaserShowcase({ children, framed = true, tone = "light" }: { children: ReactNode; framed?: boolean; tone?: "light" | "dark" }) {
  const surface = useRef<HTMLDivElement>(null);
  const dark = tone === "dark";
  const frame = framed
    ? dark
      ? "overflow-hidden rounded-2xl bg-white shadow-[0_40px_120px_-30px_rgba(82,103,247,0.55)] ring-1 ring-white/15"
      : "overflow-hidden rounded-2xl bg-white shadow-[0_40px_100px_-40px_rgba(20,17,15,0.45),0_0_0_1px_rgba(20,17,15,0.06)]"
    : "rounded-2xl";
  return (
    <div className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute -inset-x-[9%] -bottom-[24%] -top-20 z-20 [mask-image:linear-gradient(to_right,transparent,black_9%,black_91%,transparent),linear-gradient(to_bottom,transparent,black_18%,black_72%,transparent)] [mask-composite:intersect] lg:-top-[min(70vh,640px)]">
        <LaserFlow surfaceRef={surface} beamPosition={0.5} color="#5267f7" theme={tone} intensity={dark ? 1.6 : 1.4} flare={1.0} spread={2.0} spill={1.5} fog={0.15} dust={1.1} mouseInteraction={false} />
      </div>
      <div ref={surface} className={`relative z-10 ${frame}`}>
        {children}
      </div>
      {/* The rim light: a thin line of the beam's colour along the top edge that fades down each side past the corners. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px z-30 rounded-[17px] p-[1.5px] bg-[radial-gradient(75%_42%_at_50%_0%,#ffffff_0%,rgba(173,184,255,0.95)_28%,rgba(82,103,247,0.6)_60%,rgba(82,103,247,0)_100%)]"
        style={RIM_MASK}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-[4%] -top-3 z-0 h-24 rounded-[40px] bg-[radial-gradient(60%_70%_at_50%_30%,rgba(120,136,255,0.55),rgba(82,103,247,0)_75%)] blur-xl" />
    </div>
  );
}
