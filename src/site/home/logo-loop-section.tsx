"use client";

import Image from "next/image";
import { agents } from "@/lib/site";
import LogoLoop, { type LogoItem } from "@/site/bits/LogoLoop";
import { Container } from "@/site/ui/container";

/** Each AI Coere works with, as its logo and name. On a dark page the black logos turn white, as on About. */
const logos: LogoItem[] = agents.map((agent) => ({
  ariaLabel: agent.name,
  node: (
    <span className="flex items-center gap-3 px-2">
      <Image src={agent.logo} alt="" width={30} height={30} unoptimized className={`h-[30px] w-[30px] ${agent.mono ? "dark:invert" : ""}`} />
      <span className="text-[22px] font-semibold tracking-[-0.03em] whitespace-nowrap text-neutral-900 dark:text-white">{agent.name}</span>
    </span>
  ),
}));

/**
 * Under the hero: every AI Coere carries memory between, moving past in a
 * line (React Bits LogoLoop) that fades at both edges and stops while the
 * pointer is on it. With reduced motion it holds still.
 */
export function LogoLoopSection() {
  return (
    <section id="ais" aria-labelledby="ais-title" className="scroll-mt-24 pt-6 pb-20 md:pb-28">
      <Container>
        <h2 id="ais-title" className="text-center text-[26px] font-semibold tracking-[-0.03em] text-neutral-950 text-balance md:text-[32px] dark:text-white">
          Transfer memory across every AI
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[16px] text-neutral-500 text-balance dark:text-white/60">What you told one AI, the next one already knows.</p>
      </Container>
      <div className="mx-auto mt-10 max-w-[1440px]">
        <LogoLoop logos={logos} speed={42} gap={64} logoHeight={34} pauseOnHover fadeOut fadeOutWidth={0.16} draggable={false} ariaLabel="The AIs Coere works with" />
      </div>
    </section>
  );
}
