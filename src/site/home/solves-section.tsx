import { solves } from "@/site/content/solves";
import { ArrowLink } from "@/site/ui/arrow-link";
import { Container } from "@/site/ui/container";
import { SectionIntro } from "./section-intro";
import { SceneRow } from "./solves/scene-row";
import { SolvesTurns } from "./solves/turns";

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
 * scenes with Coere, and the way to the developer waitlist. Coere Connect
 * follows with its own way in, so this part does not repeat it. The two
 * rows share one turn, so only one scene moves at a time.
 */
export function SolvesSection() {
  return (
    <section id="solves" className="scroll-mt-24 border-t border-neutral-100 py-28 md:py-36">
      <Container>
        <SolvesTurns>
          <SectionIntro eyebrow={solves.eyebrow} title={solves.title} line={solves.line} />
          <div className="mt-16 md:mt-20">
            <SceneRow scenes={solves.today} coere={false} />
          </div>
          <DeveloperLine text={solves.developers} />

          <div className="mt-28 md:mt-36">
            <SectionIntro eyebrow={solves.answer.eyebrow} title={solves.answer.title} line={solves.answer.line} />
          </div>
          <div className="mt-16 md:mt-20">
            <SceneRow scenes={solves.withCoere} coere />
          </div>
          <DeveloperLine text={solves.developersAnswer} />
          <div className="mt-8 flex justify-center">
            <ArrowLink href="/developers/waitlist">Join the developer waitlist</ArrowLink>
          </div>
        </SolvesTurns>
      </Container>
    </section>
  );
}
