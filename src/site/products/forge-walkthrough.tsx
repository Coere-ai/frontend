"use client";

import { useState } from "react";
import { walkSteps } from "@/site/content/forge-walkthrough";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { SCREEN, ScreenFrame } from "@/site/ui/screen-frame";

const W = SCREEN.width;
const H = SCREEN.height;
const pct = (value: number, of: number) => `${(value / of) * 100}%`;

/** A round arrow button on the side of the screen. */
function Arrow({ direction, onClick, disabled }: { direction: "back" | "next"; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "back" ? "Previous step" : "Next step"}
      className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-neutral-950 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-opacity disabled:opacity-30"
    >
      <ArrowRightIcon size={20} className={direction === "back" ? "rotate-180" : ""} />
    </button>
  );
}

/**
 * Coere Forge, step by step on full screens of the real product, saved as
 * HTML so they stay sharp. Arrows
 * (or the arrow keys) move through the steps, and the part that matters
 * is lit while the rest of the screen dims. Meant to sit on artwork.
 */
export function ForgeWalkthrough() {
  const [index, setIndex] = useState(0);
  const step = walkSteps[index];
  const go = (by: number) => setIndex((i) => Math.min(walkSteps.length - 1, Math.max(0, i + by)));
  const { x, y, w, h } = step.focus;

  return (
    <div
      className="text-white outline-none"
      tabIndex={0}
      aria-roledescription="walkthrough"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(1);
        if (event.key === "ArrowLeft") go(-1);
      }}
    >
      <div className="flex items-center gap-4 md:gap-6">
        <span className="hidden md:block">
          <Arrow direction="back" onClick={() => go(-1)} disabled={index === 0} />
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl bg-white shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/15" style={{ aspectRatio: `${W} / ${H}` }}>
          {walkSteps.map((s, i) => (
            <div key={s.key} aria-hidden={i !== index} className={`absolute inset-0 transition-opacity duration-300 ${i === index ? "opacity-100" : "opacity-0"}`}>
              <ScreenFrame src={s.screen} title={s.alt} />
            </div>
          ))}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute rounded-xl ring-2 ring-brand-500 transition-all duration-500 ease-out"
            style={{ left: pct(x, W), top: pct(y, H), width: pct(w, W), height: pct(h, H), boxShadow: "0 0 0 9999px rgba(8,14,36,0.38)" }}
          />
        </div>
        <span className="hidden md:block">
          <Arrow direction="next" onClick={() => go(1)} disabled={index === walkSteps.length - 1} />
        </span>
      </div>

      <div className="mt-7 flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:px-[72px]">
        <div aria-live="polite">
          <p className="text-[13px] text-white/60 tabular-nums">
            Step {index + 1} of {walkSteps.length}
          </p>
          <p className="mt-1 text-2xl font-medium tracking-[-0.025em]">{step.title}</p>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-white/75">{step.text}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="md:hidden">
            <Arrow direction="back" onClick={() => go(-1)} disabled={index === 0} />
          </span>
          <div className="flex gap-2" aria-label="Steps">
            {walkSteps.map((s, i) => (
              <button key={s.key} type="button" aria-label={`Step ${i + 1}: ${s.title}`} aria-current={i === index} onClick={() => setIndex(i)} className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/40"}`} />
            ))}
          </div>
          <span className="md:hidden">
            <Arrow direction="next" onClick={() => go(1)} disabled={index === walkSteps.length - 1} />
          </span>
        </div>
      </div>
    </div>
  );
}
