import { solves } from "@/site/content/solves";
import { ArrowLink } from "@/site/ui/arrow-link";
import { CircleArrowLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";
import { SceneRow } from "./solves/scene-row";

/** A centered name, title and line, the way each part of the home page opens. */
function Intro({ eyebrow, title, line }: { eyebrow: string; title: string; line: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-[15px] font-medium text-brand-500">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-[3.5rem] md:leading-[1.04]">{title}</h2>
      <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600 text-balance">{line}</p>
    </div>
  );
}

/** One quiet centered line for the developers' side, its first words darker. */
function DeveloperLine({ text }: { text: { lead: string; rest: string } }) {
  return (
    <p className="mx-auto mt-16 max-w-2xl text-center text-[17px] leading-relaxed text-neutral-500 text-balance md:mt-20">
      <span className="text-neutral-950">{text.lead}</span> {text.rest}
    </p>
  );
}

/**
 * What Coere solves, right under the film: the three ways AI loses what
 * it knows about a person, each a small drawing that plays when it comes
 * into view, and the developers' side in a line. Then the same three
 * scenes with Coere, and the way to Coere Connect and the developer
 * waitlist.
 */
export function SolvesSection() {
  return (
    <section id="solves" className="scroll-mt-24 border-t border-neutral-100 py-28 md:py-36">
      <Container>
        <Intro eyebrow={solves.eyebrow} title={solves.title} line={solves.line} />
        <div className="mt-16 md:mt-20">
          <SceneRow scenes={solves.today} coere={false} />
        </div>
        <DeveloperLine text={solves.developers} />

        <div className="mt-28 md:mt-36">
          <Intro eyebrow={solves.answer.eyebrow} title={solves.answer.title} line={solves.answer.line} />
        </div>
        <div className="mt-16 md:mt-20">
          <SceneRow scenes={solves.withCoere} coere />
        </div>
        <DeveloperLine text={solves.developersAnswer} />
        <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-7">
          <CircleArrowLink href="/products/connect">Explore Coere Connect</CircleArrowLink>
          <ArrowLink href="/developers/waitlist">Join the developer waitlist</ArrowLink>
        </div>
      </Container>
    </section>
  );
}
