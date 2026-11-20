"use client";

import GlassSurface from "@/site/bits/GlassSurface";

/**
 * Learn more: goes to the three products side by side further down the
 * home page. It wears the navbar's own glass, tinted as it is over a dark
 * hero, at the size and corners of Start for free.
 */
export function LearnMore() {
  return (
    <a
      href="#products"
      className="group relative isolate inline-flex h-[52px] items-center justify-center rounded-[14px] px-6 text-[16px] font-medium whitespace-nowrap text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <GlassSurface
          width="100%"
          height="100%"
          borderRadius={14}
          backgroundOpacity={0.62}
          saturation={1.5}
          brightness={52}
          opacity={0.9}
          blur={10}
          displace={0.5}
          distortionScale={-80}
          redOffset={0}
          greenOffset={2}
          blueOffset={4}
          className="bg-[rgba(14,14,28,0.5)]! shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),inset_0_1px_0_rgba(255,255,255,0.18),0_12px_32px_-14px_rgba(0,0,0,0.6)]! transition-[background-color] duration-300 group-hover:bg-[rgba(30,30,52,0.55)]!"
        />
      </span>
      Learn more
    </a>
  );
}
