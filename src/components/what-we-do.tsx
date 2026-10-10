"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Orbit } from "@/components/orbit";
import { agents } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * The hero. A field of smooth cubes rolls in one long swell with Coere glowing
 * above the crest and every AI on the surface around it. It is one screen
 * tall and scrolls away like any section. It stays live: drag anywhere to spin
 * the mark, click a logo to flip it.
 */
export function WhatWeDo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">(
    "loading",
  );

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    let engine: { dispose(): void } | null = null;
    let cancelled = false;
    const fail = () => {
      // No WebGL, or the scene failed: drop it for the flat page.
      engine?.dispose();
      engine = null;
      if (!cancelled) setStatus("failed");
    };

    import("./three/hero-scene")
      .then(async ({ HeroScene }) => {
        if (cancelled) return;
        const scene = new HeroScene({
          canvas,
          host: stage,
          agents,
          headline: headlineRef.current ?? undefined,
          onFail: fail,
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
      // Pulled up under the nav so the scene runs edge to edge. The scene
      // pales to white at its foot, as this does before it arrives.
      className="relative -mt-16 h-svh bg-linear-to-b from-mist from-55% to-white"
    >
      <div
        ref={stageRef}
        className="relative h-full w-full cursor-grab touch-pan-y overflow-hidden select-none"
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

        <div
          ref={headlineRef}
          className="pointer-events-none absolute inset-x-0 top-[7.5rem] px-5 sm:top-[8.25rem]"
        >
          <motion.h1
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease }}
            className="mx-auto max-w-4xl text-center text-[clamp(2rem,10.4vw,2.6rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance text-brand-600 sm:text-6xl lg:text-[4.6rem]"
          >
            Building the future
            <br className="hidden sm:block" /> infrastructure of AI
          </motion.h1>
        </div>
      </div>
    </section>
  );
}
