"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Orbit } from "@/components/orbit";
import { agents, navLinks } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

const signed = (value: number) =>
  `${value < 0 ? "-" : "+"}${Math.abs(value).toFixed(3)}`;
const pad = (value: number) => String(Math.floor(value)).padStart(2, "0");

/** Thin corner marks framing the stage, like a viewfinder. */
function Corners() {
  const base = "absolute h-4 w-4 border-brand-600/35";
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-5 top-20 bottom-6 sm:inset-x-8"
    >
      <span className={`${base} top-0 left-0 border-t border-l`} />
      <span className={`${base} top-0 right-0 border-t border-r`} />
      <span className={`${base} bottom-0 left-0 border-b border-l`} />
      <span className={`${base} right-0 bottom-0 border-r border-b`} />
    </div>
  );
}

/**
 * The hero. A field of database columns rolls like a sea with Coere on its
 * peak and every AI around it, streams running both ways. Scrolling lifts the
 * agents off the wave into the orbit around the mark. All of it stays live:
 * drag to turn the scene, drag the mark to spin it, click a logo to flip it.
 */
export function WhatWeDo() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const xRef = useRef<HTMLSpanElement>(null);
  const yRef = useRef<HTMLSpanElement>(null);
  const ampRef = useRef<HTMLSpanElement>(null);
  const msRef = useRef<HTMLSpanElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">(
    "loading",
  );

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !canvas) return;

    let engine: { dispose(): void } | null = null;
    let cancelled = false;
    const fail = () => {
      // No WebGL, or the scene failed: drop it for the flat page.
      engine?.dispose();
      engine = null;
      if (!cancelled) setStatus("failed");
    };
    let lastHud = 0;
    const started = performance.now();

    const getProgress = () => {
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      return travel > 0 ? -rect.top / travel : 0;
    };

    import("./three/hero-scene")
      .then(async ({ HeroScene }) => {
        if (cancelled) return;
        const scene = new HeroScene({
          canvas,
          host: stage,
          agents,
          getProgress,
          onFail: fail,
          onFrame: (frame) => {
            const pill = pillRef.current;
            if (pill) {
              const y = frame.anchor.y + frame.anchor.radius + 26;
              pill.style.transform = `translate3d(${frame.anchor.x}px, ${y}px, 0) translateX(-50%)`;
            }
            const label = labelRef.current;
            if (label) {
              if (frame.hover) {
                label.textContent = frame.hover.name;
                label.style.transform = `translate3d(${frame.hover.x}px, ${frame.hover.y + 10}px, 0) translateX(-50%)`;
                label.style.opacity = "1";
              } else {
                label.style.opacity = "0";
              }
            }
            const cue = cueRef.current;
            if (cue)
              cue.style.opacity = String(Math.max(0, 1 - frame.morph * 6));

            const now = performance.now();
            if (now - lastHud < 90) return;
            lastHud = now;
            const seconds = (now - started) / 1000;
            if (clockRef.current) {
              clockRef.current.textContent = `${pad(seconds / 60)}:${pad(seconds % 60)}:${pad(((seconds % 1) * 60) | 0)}`;
            }
            if (xRef.current) xRef.current.textContent = signed(frame.yaw);
            if (yRef.current) yRef.current.textContent = signed(frame.pitch);
            if (ampRef.current)
              ampRef.current.textContent = frame.amp.toFixed(3);
            if (msRef.current) msRef.current.textContent = frame.ms.toFixed(1);
          },
        });
        engine = scene;
        await scene.ready;
        if (!cancelled) setStatus("ready");
      })
      .catch(fail);

    return () => {
      cancelled = true;
      engine?.dispose();
    };
  }, []);

  if (status === "failed") {
    // No WebGL: the flat orbit, as the site had it.
    return (
      <section id="what-we-do" className="pt-20 pb-16 sm:pt-28">
        <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
          <h1 className="mx-auto max-w-3xl text-center text-[2.75rem] leading-[1.04] font-semibold tracking-[-0.04em] text-brand-600 sm:text-6xl">
            Building the future
            <br className="hidden sm:block" /> infrastructure of AI
          </h1>
          <div className="mt-12 sm:mt-16">
            <Orbit />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="what-we-do"
      ref={sectionRef}
      // Pulled up under the nav so the scene runs edge to edge.
      className="relative -mt-16 h-[260svh] bg-mist"
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-svh w-full cursor-grab touch-pan-y overflow-hidden select-none"
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`The Coere mark at the peak of a wave of databases, with ${agents
            .map((agent) => agent.name)
            .join(", ")} around it`}
          className={`absolute inset-0 h-full w-full transition-opacity duration-[1600ms] ease-out ${
            status === "ready" ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Soft wash at the top so the headline always sits on calm ground. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[42%] bg-linear-to-b from-mist via-mist/70 to-transparent"
        />

        <Corners />

        {/* Readouts, top left and right. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-5 top-24 hidden items-center justify-between font-mono text-[10.5px] tracking-[0.14em] text-ink-900/55 tabular-nums md:flex sm:inset-x-8 lg:px-6"
        >
          <div className="flex items-center gap-3">
            <span className="text-ink-900/80">
              01 / {String(navLinks.length).padStart(2, "0")}
            </span>
            <span className="h-px w-8 bg-ink-900/25" />
            <span ref={clockRef}>00:00:00</span>
          </div>
          <div className="flex items-center gap-4">
            <span>
              <span className="text-ink-900/35">X</span>{" "}
              <span ref={xRef} className="text-ink-900/80">
                +0.000
              </span>
            </span>
            <span>
              <span className="text-ink-900/35">Y</span>{" "}
              <span ref={yRef} className="text-ink-900/80">
                +0.000
              </span>
            </span>
            <span>
              <span className="text-ink-900/35">AMP</span>{" "}
              <span ref={ampRef} className="text-ink-900/80">
                1.000
              </span>
            </span>
            <span className="h-px w-8 bg-ink-900/25" />
            <span>
              <span className="text-ink-900/35">MS</span>{" "}
              <span ref={msRef} className="text-ink-900/80">
                16.7
              </span>
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-[7.5rem] px-5 sm:top-[8.25rem]">
          <motion.h1
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease }}
            className="mx-auto max-w-4xl text-center text-[2.6rem] leading-[1.02] font-semibold tracking-[-0.045em] text-balance text-brand-600 sm:text-6xl lg:text-[4.6rem]"
          >
            Building the future
            <br className="hidden sm:block" /> infrastructure of AI
          </motion.h1>
        </div>

        {/* Follows the Coere mark around the screen. */}
        <div
          ref={pillRef}
          aria-hidden="true"
          className={`pointer-events-none absolute top-0 left-0 transition-opacity duration-700 ${
            status === "ready" ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-2.5 rounded-full border border-brand-600/15 bg-white/70 px-3 py-1 font-mono text-[10px] tracking-[0.22em] text-ink-900/60 shadow-[0_6px_24px_-12px_rgba(63,76,235,0.45)] backdrop-blur-md">
            <span aria-hidden="true">←</span>
            DRAG
            <span aria-hidden="true">→</span>
          </div>
        </div>

        {/* Names the logo under the pointer. */}
        <div
          ref={labelRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 rounded-md bg-ink-900/85 px-2 py-1 font-mono text-[10px] tracking-[0.16em] whitespace-nowrap text-white uppercase opacity-0 transition-opacity duration-200"
        />

        <div
          ref={cueRef}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-ink-900/45"
        >
          SCROLL
          <span className="relative h-9 w-px overflow-hidden bg-ink-900/12">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[coere-scroll-cue_1.8s_ease-in-out_infinite] bg-brand-600/70" />
          </span>
        </div>
      </div>
    </section>
  );
}
