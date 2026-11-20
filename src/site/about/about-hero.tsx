"use client";

import { logoMarkSvg } from "@/components/logo";
import MetallicPaint from "@/site/bits/MetallicPaint";

/** The mark as an image the paint can read its shape from. */
const MARK = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoMarkSvg("#14110f"))}`;

/**
 * The About page's first screen: the Coere mark in liquid chrome, large, over
 * a soft wash of Coere blue, with "About us" and the company line under it.
 */
export function AboutHero({ line, story }: { line: string; story: string }) {
  return (
    <section className="relative isolate overflow-hidden pt-10 pb-20 md:pt-14 md:pb-28">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_50%_30%,#e6eaff_0%,rgba(238,241,255,0.55)_45%,rgba(255,255,255,0)_75%)]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-white" />
      <div className="mx-auto w-full max-w-[1440px] px-6 text-center md:px-10">
        <div aria-hidden="true" className="mx-auto aspect-square w-[min(72vw,380px)] md:w-[440px]">
          <MetallicPaint imageSrc={MARK} scale={0.78} color="#e6eaff" density={0.9} softness={0.4} dispersion={0} distortion={0.05} speed={0.6} mouseTilt={0.6} />
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-neutral-950 md:mt-6 md:text-[5.5rem] md:leading-[0.98]">About us</h1>
        <p className="mx-auto mt-6 max-w-2xl text-2xl font-medium tracking-[-0.025em] text-neutral-800 text-balance md:text-[1.75rem] md:leading-snug">{line}</p>
        <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-neutral-600 text-pretty">{story}</p>
      </div>
    </section>
  );
}
