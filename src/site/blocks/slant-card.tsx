"use client";

import { useEffect, useId, useState } from "react";
import type { Background } from "@/site/content/backgrounds";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { LiveDemo } from "@/site/ui/live-demo";
import { roundedPolygon } from "@/site/ui/slant-shape";
import { SizedPhoto } from "@/site/ui/sized-photo";

/** One reason, and the part of a live demo (a film and its chapters) that shows it. */
export type Slide = { label: string; text: string; byline?: string; live: { film: string; from?: string; to?: string } };

/** The drawing box. The card keeps this shape on wide screens so the cut stays the same angle. */
const W = 1360;
const H = 520;
const CUT = 150;
const SPLIT = 620;
const GAP = 22;
const CARD = roundedPolygon([[0, 0], [SPLIT, 0], [SPLIT + CUT, H], [0, H]], 22);
/** The art panel in its own 0 to 1 box, for a clip path that scales with it. */
const PANEL_W = W - SPLIT - GAP;
const PANEL = roundedPolygon([[0, 0], [PANEL_W, 0], [PANEL_W, H], [CUT, H]], 22)
  .replace(/-?\d+(\.\d+)?/g, (n, _d, at: number, all: string) => {
    // Coordinates alternate x, y; scale each into the 0 to 1 box.
    const before = all.slice(0, at).match(/-?\d+(\.\d+)?/g)?.length ?? 0;
    return String(Number(n) / (before % 2 === 0 ? PANEL_W : H));
  });

/** How long a slide shows before the next, until someone uses the arrows: long enough for its demo to play through. */
const SLIDE_MS = 26000;

/**
 * A white card and a panel of the product split by one slanted cut. Each
 * slide pairs a reason with the live demo that shows it, playing on artwork
 * behind the cut. Arrows step through them; they also step on by
 * themselves until someone does. On narrow screens the two stack.
 */
export function SlantCard({ heading, slides, background }: { heading: string; slides: Slide[]; background: Background }) {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const clip = useId().replace(/:/g, "");
  const slide = slides[index];
  const step = (by: number) => {
    setHeld(true);
    setIndex((i) => (i + by + slides.length) % slides.length);
  };

  useEffect(() => {
    if (held) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [index, held, slides.length]);

  const words = (
    <div aria-live="polite">
      <p className="text-[15px] font-medium text-brand-500">{slide.label}</p>
      <p className="mt-5 text-[24px] leading-snug tracking-[-0.02em] text-neutral-950 text-pretty xl:text-[28px]">{slide.text}</p>
      {slide.byline ? <p className="mt-6 text-[15px] text-neutral-600">{slide.byline}</p> : null}
      <div className="mt-8 flex gap-2" aria-hidden="true">
        {slides.map((s, i) => (
          <span key={s.label} className={`h-1 rounded-full transition-all duration-500 ${i === index ? "w-8 bg-neutral-950" : "w-3 bg-neutral-300"}`} />
        ))}
      </div>
    </div>
  );

  /** The product on artwork: the slide's live demo, whole and centered in the part of the panel the cut leaves. */
  const panel = (
    <div className="relative h-full w-full overflow-hidden">
      <SizedPhoto src={background.src} alt="" fill sizes="50vw" className="object-cover" />
      <div className="absolute top-1/2 left-[16%] w-[78%] -translate-y-1/2 overflow-hidden rounded-xl shadow-[0_40px_90px_-25px_rgba(0,0,0,0.75)] ring-1 ring-white/20">
        <LiveDemo key={slide.label} film={slide.live.film} from={slide.live.from} to={slide.live.to} label={`${slide.label}, shown live on the app`} />
      </div>
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
            <clipPath id={clip} clipPathUnits="objectBoundingBox">
              <path d={PANEL} />
            </clipPath>
          </defs>
          <path d={CARD} className="fill-white stroke-neutral-900" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="absolute top-0 left-0 h-full p-[3.2%] pr-[4%]" style={{ width: `${(SPLIT / W) * 100}%` }}>
          {words}
        </div>
        <div className="absolute top-0 h-full" style={{ left: `${((SPLIT + GAP) / W) * 100}%`, width: `${(PANEL_W / W) * 100}%`, clipPath: `url(#${clip})` }}>
          {panel}
        </div>
      </div>

      <div className="mt-8 space-y-3 lg:hidden">
        <div className="rounded-3xl border border-neutral-900 p-7">{words}</div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">{panel}</div>
      </div>
    </div>
  );
}
