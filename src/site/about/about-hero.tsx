"use client";

import { logoMarkSvg } from "@/components/logo";
import { AsciiTiles, COERE_TILES_PALETTE } from "@/site/art/ascii-tiles";
import MetallicPaint from "@/site/bits/MetallicPaint";

/** The mark as an image the paint can read its shape from. */
const MARK = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoMarkSvg("#14110f"))}`;

/** The tiles on the page's own near black, so the hero runs on into the page with no seam. */
const TILES = { ...COERE_TILES_PALETTE, background: "#0b0a12" };

/** Lets the tiles run out at the foot of the hero, into the page's flat near black. */
const FOOT_FADE = "linear-gradient(to bottom, #000 62%, transparent 96%)";

/** Thins the tiles behind the mark and the words, so they stay in front and readable. */
const CENTER_CALM = "radial-gradient(ellipse 40% 50% at 50% 60%, rgba(0,0,0,0.06), rgba(0,0,0,0.3) 55%, #000 100%)";

/**
 * The About page's first screen: the Coere mark in liquid chrome, large,
 * over a floor of ASCII Tiles in Coere blue, white and violet, with
 * "About us" and the company line under it in white. The tiles thin out
 * behind the mark and the words so they stay in front and readable, and
 * fade into the page's flat near black at the foot. The paint uses React
 * Bits' own chrome settings.
 */
export function AboutHero({ line, story }: { line: string; story: string }) {
  return (
    <section className="relative isolate overflow-hidden pt-[112px] pb-20 md:pt-[128px] md:pb-28">
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ maskImage: FOOT_FADE, WebkitMaskImage: FOOT_FADE }}>
        <div className="absolute inset-0" style={{ maskImage: CENTER_CALM, WebkitMaskImage: CENTER_CALM }}>
          <AsciiTiles palette={TILES} brightness={0.7} speed={0.7} />
        </div>
      </div>
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
