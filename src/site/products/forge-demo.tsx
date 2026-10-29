"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { CodeWindow } from "@/site/code/code-window";
import { TerminalWindow } from "@/site/code/terminal-window";
import { contextSamples } from "@/site/content/code/context-api";
import { contextCommand, contextOutput, forgeShots, forgeSteps } from "@/site/content/forge-demo";
import { Underlined } from "@/site/ui/underlined";
import { ContextRun } from "./context-run";

/** How long each step shows before the next, until someone picks one. */
const STEP_MS = 8000;

/** The first lines of the TypeScript sample: the ask from code. */
const connectTs = contextSamples[0].code.split("\n").slice(0, 5).join("\n");

function Shot({ shot, className }: { shot: (typeof forgeShots)[keyof typeof forgeShots]; className?: string }) {
  return <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} unoptimized className={`rounded-xl bg-white shadow-[0_20px_50px_-25px_rgba(0,0,0,0.6)] ${className ?? ""}`} />;
}

/** What each step shows. Screens are the real dashboard; code and output are the real example. */
const visuals: Record<string, ReactNode> = {
  key: (
    <div className="grid h-full grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-center gap-5">
      <Shot shot={forgeShots.key} className="max-h-full w-auto justify-self-center" />
      <Shot shot={forgeShots.apps} className="w-full" />
    </div>
  ),
  allow: (
    <div className="flex h-full flex-col justify-center gap-5">
      <CodeWindow file="planner.ts" code={connectTs} language="ts" />
      <Shot shot={forgeShots.allow} className="w-full" />
    </div>
  ),
  context: (
<ContextRun />
  ),
  sent: (
    <div className="flex h-full items-start justify-center overflow-hidden">
      <Shot shot={forgeShots.sent} className="w-[88%]" />
    </div>
  ),
};

/**
 * Coere Forge from the developer's side: make a key or ask from code, ask
 * for context, and see what was sent. It steps on by itself until a step
 * is picked. Meant to sit on artwork, so its words are white.
 */
export function ForgeDemo() {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const step = forgeSteps[index];

  useEffect(() => {
    if (held) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % forgeSteps.length), STEP_MS);
    return () => clearTimeout(timer);
  }, [index, held]);

  return (
    <div className="text-white">
      <div role="tablist" aria-label="Forge demo" className="flex flex-wrap gap-x-6 gap-y-2">
        {forgeSteps.map((s, i) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => {
              setIndex(i);
              setHeld(true);
            }}
            className={`group py-1 text-[14px] ${i === index ? "text-white" : "text-white/60 hover:text-white"}`}
          >
            <span className="mr-2 text-white/50 tabular-nums">{i + 1}</span>
            <Underlined light on={i === index}>{s.label}</Underlined>
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-6">
        <div className="hidden aspect-[16/10] rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur-sm md:block">{visuals[step.key]}</div>
        <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 md:hidden">{step.key === "context" ? <TerminalWindow command={contextCommand} output={contextOutput} /> : visuals[step.key]}</div>
        <p className="mt-5 text-xl font-medium tracking-[-0.02em]">{step.title}</p>
        <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-white/75">{step.text}</p>
      </div>
    </div>
  );
}
