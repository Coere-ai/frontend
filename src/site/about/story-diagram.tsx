import type { ReactNode } from "react";
import { Container } from "@/site/ui/container";
import { ChevronDownIcon } from "@/site/ui/icons/interface-icons";
import { storySteps } from "./story-data";
import { AppPieces, OneMemory, ScatteredApps, YourChoice } from "./story-visuals";

const visuals: ReactNode[] = [<ScatteredApps key="apps" />, <AppPieces key="pieces" />, <OneMemory key="memory" />, <YourChoice key="choice" />];

/**
 * Why Coere exists, read top to bottom: four steps, each with its words on
 * the left and a picture on the right, and an arrow down to the next. It
 * stays still; nothing moves as the page scrolls. It sits on the dark page,
 * so each picture sits on a plain glass panel with a fine light border.
 */
export function StoryDiagram() {
  return (
    <section aria-label="Why Coere" className="py-20 md:py-28">
      <Container>
        <ol className="mx-auto max-w-5xl">
          {storySteps.map((step, index) => (
            <li key={step.title}>
              <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-14">
                <div>
                  <p className="text-[13px] font-semibold tracking-[0.02em] text-brand-300">Step {index + 1}</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white text-balance md:text-[2.75rem] md:leading-[1.06]">{step.title}</h2>
                  <p className="mt-4 text-[17px] leading-relaxed text-white/65 text-pretty">{step.text}</p>
                </div>
                <div className="rounded-[32px] bg-white/[0.03] p-6 ring-1 ring-white/10 md:p-10">{visuals[index]}</div>
              </div>
              {index < storySteps.length - 1 ? (
                <div className="grid py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-14" aria-hidden="true">
                  <ChevronDownIcon size={28} className="mx-auto text-white/25 md:col-start-2" />
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
