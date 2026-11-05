"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { LiveDemo } from "@/site/ui/live-demo";

/** One reason, and the part of a live demo (a film and its chapters) that shows it. */
export type Slide = { label: string; text: string; byline?: string; live: { film: string; from?: string; to?: string } };

/** How long a slide shows before the next, until someone uses the arrows: long enough for its demo to play through. */
const SLIDE_MS = 26000;

/**
 * Reasons, one at a time: the words on the left and the live demo that
 * shows them on the right, both on the white page with no card or artwork
 * around them. Arrows step through them; they also step on by themselves
 * until someone does. On narrow screens the two stack.
 */
export function SlantCard({ heading, slides }: { heading: string; slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
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
      {/* Every slide's words are in the page; the others wait hidden until their turn. */}
      {slides.map((s, i) => (
        <div key={s.label} hidden={i !== index}>
          <p className="text-[15px] font-medium text-brand-500">{s.label}</p>
          <p className="mt-5 text-[24px] leading-snug tracking-[-0.02em] text-neutral-950 text-pretty xl:text-[28px]">{s.text}</p>
          {s.byline ? <p className="mt-6 text-[15px] text-neutral-600">{s.byline}</p> : null}
        </div>
      ))}
      <div className="mt-8 flex gap-2" aria-hidden="true">
        {slides.map((s, i) => (
          <span key={s.label} className={`h-1 rounded-full transition-all duration-500 ${i === index ? "w-8 bg-neutral-950" : "w-3 bg-neutral-300"}`} />
        ))}
      </div>
    </div>
  );

  /** The slide's live demo, whole, in a thin frame. */
  const panel = (
    <div className="overflow-hidden rounded-xl ring-1 ring-neutral-200">
      <LiveDemo key={slide.label} film={slide.live.film} from={slide.live.from} to={slide.live.to} label={`${slide.label}, shown live on the app`} />
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

      <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        {words}
        {panel}
      </div>
    </div>
  );
}
