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
    <section aria-label="Why Coere" className="border-t border-neutral-100 py-24">
      <Container>
        <ol className="mx-auto max-w-5xl">
          {storySteps.map((step, index) => (
            <li key={step.title}>
              <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-14">
                <div>
                  <p className="text-[13px] font-medium text-neutral-500">Step {index + 1}</p>
                  <h2 className="mt-2 text-3xl font-medium tracking-[-0.035em] text-neutral-950 md:text-[2.5rem] md:leading-[1.1]">{step.title}</h2>
                  <p className="mt-4 text-[17px] leading-relaxed text-neutral-500 text-pretty">{step.text}</p>
                </div>
                <div className="rounded-[28px] bg-neutral-50 p-6 md:p-10">{visuals[index]}</div>
              </div>
              {index < storySteps.length - 1 ? (
                <div className="grid py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-14" aria-hidden="true">
                  <ChevronDownIcon size={28} className="mx-auto text-neutral-400 md:col-start-2" />
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
