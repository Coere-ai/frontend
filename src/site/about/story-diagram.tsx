import type { ReactNode } from "react";
import { Container } from "@/site/ui/container";
import { ChevronDownIcon } from "@/site/ui/icons/interface-icons";
import { storySteps } from "./story-data";
import { AppPieces, OneMemory, ScatteredApps, YourChoice } from "./story-visuals";

const visuals: ReactNode[] = [<ScatteredApps key="apps" />, <AppPieces key="pieces" />, <OneMemory key="memory" />, <YourChoice key="choice" />];

/**
 * Why Coere exists, read top to bottom: four steps, each with its words on
 * the left and a picture on the right, and an arrow down to the next. It
 * stays still; nothing moves as the page scrolls.
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
                  <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-[13px] font-semibold text-brand-700">Step {index + 1}</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 text-balance md:text-[2.75rem] md:leading-[1.06]">{step.title}</h2>
                  <p className="mt-4 text-[17px] leading-relaxed text-neutral-600 text-pretty">{step.text}</p>
                </div>
                <div className="rounded-[32px] bg-[linear-gradient(160deg,#f7f8ff_0%,#eef1ff_100%)] p-6 ring-1 ring-brand-100/70 md:p-10">{visuals[index]}</div>
              </div>
              {index < storySteps.length - 1 ? (
                <div className="grid py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-14" aria-hidden="true">
                  <ChevronDownIcon size={28} className="mx-auto text-brand-300 md:col-start-2" />
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
