"use client";

import { useRef, type ReactNode } from "react";
import { LaserFlow } from "@/site/bits/LaserFlow";

/**
 * The app in a hero, with a beam of Coere blue falling onto its top edge.
 * The beam's canvas sits behind the frame and reaches up past it, so the
 * beam lands in the middle of the frame at every width. It draws over the
 * frame's edges (the beam leaves the frame itself alone) and fades out at
 * its own edges. On a phone it only reaches into the gap above the frame,
 * so it never runs through the words. The hero clips whatever reaches past
 * its top.
 */
export function LaserShowcase({ children, framed = true, tone = "light" }: { children: ReactNode; framed?: boolean; tone?: "light" | "dark" }) {
  const surface = useRef<HTMLDivElement>(null);
  const frame = framed
    ? tone === "dark"
      ? "overflow-hidden rounded-2xl bg-white shadow-[0_40px_120px_-30px_rgba(82,103,247,0.55)] ring-1 ring-white/15"
      : "overflow-hidden rounded-2xl bg-white shadow-[0_40px_100px_-40px_rgba(20,17,15,0.45),0_0_0_1px_rgba(20,17,15,0.06)]"
    : "rounded-2xl";
  return (
    <div className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute -inset-x-[34%] -bottom-[30%] -top-20 z-20 [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent),linear-gradient(to_bottom,transparent,black_18%,black_70%,transparent)] [mask-composite:intersect] lg:-top-[min(70vh,640px)]">
        <LaserFlow surfaceRef={surface} beamPosition={0.5} color="#5267f7" theme={tone} intensity={tone === "dark" ? 1.6 : 1.4} fog={0.15} dust={1.1} mouseInteraction={false} />
      </div>
      <div ref={surface} className={`relative z-10 ${frame}`}>
        {children}
      </div>
    </div>
  );
}
