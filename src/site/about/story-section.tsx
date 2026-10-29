"use client";

import { useScroll } from "motion/react";
import { useRef } from "react";
import { Container } from "@/site/ui/container";
import { storySteps } from "./story-data";
import { StoryStage } from "./story-stage";
import { StoryStep } from "./story-step";

/**
 * The story told by scrolling. The section is four screens tall and its
 * content stays pinned, so scrolling scrubs the animation forward and back
 * instead of moving the page. Text sits beside the stage on wide screens
 * and above it on narrow ones.
 */
export function StorySection() {
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });

  return (
    <section ref={section} aria-label="Why Coere" className="relative h-[400vh] border-t border-neutral-100">
      <div className="sticky top-[73px] h-[calc(100svh-73px)] overflow-hidden">
        <Container className="grid h-full grid-rows-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-6 md:grid-cols-2 md:grid-rows-1 md:gap-12">
          <div className="relative h-full min-h-[220px]">
            {storySteps.map((step, index) => (
              <StoryStep key={step.title} index={index} total={storySteps.length} title={step.title} text={step.text} progress={scrollYProgress} />
            ))}
          </div>
          <StoryStage progress={scrollYProgress} />
        </Container>
      </div>
    </section>
  );
}
