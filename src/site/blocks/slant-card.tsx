"use client";

import { useId, useState } from "react";
import type { Background } from "@/site/content/backgrounds";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { roundedPolygon } from "@/site/ui/slant-shape";
import { sizedSrc } from "@/site/ui/sized-src";

export type Slide = { label: string; text: string; byline?: string };

/** The drawing box. The card keeps this shape on wide screens so the cut stays the same angle. */
const W = 1360;
const H = 400;
const CUT = 160;
const CARD = roundedPolygon([[0, 0], [830, 0], [830 + CUT, H], [0, H]], 22);
const ART = roundedPolygon([[852, 0], [W, 0], [W, H], [852 + CUT, H]], 22);

/**
 * A white card and a piece of artwork split by one slanted cut, with arrows
 * to step through a few slides. On narrow screens the two stack as plain
 * rounded boxes, since the cut needs width to read.
 */
export function SlantCard({ heading, slides, background }: { heading: string; slides: Slide[]; background: Background }) {
  const [index, setIndex] = useState(0);
  const clip = useId();
  const slide = slides[index];
  const step = (by: number) => setIndex((i) => (i + by + slides.length) % slides.length);

  const words = (
    <div aria-live="polite">
      <p className="text-[15px] font-medium text-brand-500">{slide.label}</p>
      <p className="mt-5 text-[24px] leading-snug tracking-[-0.02em] text-neutral-950 text-pretty xl:text-[30px]">{slide.text}</p>
      {slide.byline ? <p className="mt-6 text-[15px] text-neutral-600">{slide.byline}</p> : null}
      <p className="mt-8 text-[13px] text-neutral-500 tabular-nums">
        {index + 1} of {slides.length}
      </p>
    </div>
  );

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <h2 className="max-w-xl text-3xl font-medium tracking-[-0.035em] text-neutral-950 text-balance md:text-[2.5rem] md:leading-[1.1]">{heading}</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => step(-1)} aria-label="Previous" className="grid h-11 w-11 place-items-center rounded-full text-neutral-950">
            <ArrowRightIcon size={20} className="rotate-180" />
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next" className="grid h-11 w-11 place-items-center rounded-full text-neutral-950">
            <ArrowRightIcon size={20} />
          </button>
        </div>
      </div>

      <div className="relative mt-10 hidden lg:block" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <clipPath id={clip}>
              <path d={ART} />
            </clipPath>
          </defs>
          <path d={CARD} className="fill-white stroke-neutral-900" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <image href={sizedSrc(background.src, 1920)} x="852" y="0" width={W - 852} height={H} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clip})`} />
        </svg>
        <div className="absolute top-0 left-0 h-full w-[58%] p-[3.2%] pr-[6%]">{words}</div>
      </div>

      <div className="mt-8 space-y-3 lg:hidden">
        <div className="rounded-3xl border border-neutral-900 p-7">{words}</div>
        <div className="aspect-[16/9] rounded-3xl bg-cover bg-center" style={{ backgroundImage: `url(${sizedSrc(background.src, 960)})` }} />
      </div>
    </div>
  );
}
