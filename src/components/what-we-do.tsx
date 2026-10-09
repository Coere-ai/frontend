"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Orbit } from "@/components/orbit";
import { agents } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * The hero. A field of smooth cubes rolls in one long swell with Coere glowing
 * above the crest and every AI on the surface around it. Scrolling lifts the
 * agents off the wave into the orbit around the mark. It all stays live: drag
 * to turn the scene, drag the mark to spin it, click a logo to flip it.
 */
export function WhatWeDo() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
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
          onFrame: ({ morph }) => {
            const cue = cueRef.current;
            if (cue) cue.style.opacity = String(Math.max(0, 1 - morph * 6));
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
          aria-label={`The Coere mark above a wave, with ${agents
            .map((agent) => agent.name)
            .join(", ")} around it`}
          className={`absolute inset-0 h-full w-full transition-opacity duration-[1600ms] ease-out ${
            status === "ready" ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Soft wash at the top so the headline always sits on calm ground. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[30%] bg-linear-to-b from-mist via-mist/70 to-transparent sm:h-[38%]"
        />
        {/* And at the bottom, so the scroll cue is not read against the cubes. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%] bg-linear-to-t from-mist/90 to-transparent"
        />

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
