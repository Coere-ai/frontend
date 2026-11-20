"use client";

import { logoMarkSvg } from "@/components/logo";
import MetallicPaint from "@/site/bits/MetallicPaint";

/** The mark as an image the paint can read its shape from. */
const MARK = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoMarkSvg("#14110f"))}`;

/**
 * The About page's first screen, on near black: the Coere mark in liquid
 * chrome, large, in a deep blue light, with "About us" and the company line
 * under it in white. The paint uses React Bits' own chrome settings.
 */
export function AboutHero({ line, story }: { line: string; story: string }) {
  return (
    <section className="relative isolate overflow-hidden pt-[112px] pb-20 md:pt-[128px] md:pb-28">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(48%_42%_at_50%_30%,rgba(82,103,247,0.34)_0%,rgba(63,76,235,0.14)_45%,rgba(11,10,18,0)_78%),radial-gradient(90%_60%_at_50%_0%,rgba(63,76,235,0.18)_0%,rgba(11,10,18,0)_70%)]" />
      <div className="mx-auto w-full max-w-[1440px] px-6 text-center md:px-10">
        {/* The paint keeps React Bits' scale, so the mark fills the middle 60% of a large box; the margins take back the empty edges. */}
        <div aria-hidden="true" className="mx-auto -mt-6 -mb-14 aspect-square w-[min(96vw,440px)] md:-mt-12 md:-mb-24 md:w-[600px]">
          <MetallicPaint imageSrc={MARK} />
        </div>
        <h1 className="relative mt-2 text-5xl font-semibold tracking-[-0.05em] text-white md:mt-4 md:text-[5.5rem] md:leading-[0.98]">About us</h1>
        <p className="mx-auto mt-6 max-w-2xl text-2xl font-medium tracking-[-0.025em] text-white/90 text-balance md:text-[1.75rem] md:leading-snug">{line}</p>
        <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-white/65 text-pretty">{story}</p>
      </div>
    </section>
  );
}
