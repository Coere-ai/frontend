import Link from "next/link";
import { CheckList } from "@/site/blocks/check-list";
import { Stage } from "@/site/blocks/stage";
import { films } from "@/site/content/films";
import { CircleArrowLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";
import { FilmFrame } from "@/site/ui/film-frame";

/**
 * Coere Solutions on the home page, plain on the white page, with the
 * words on the left and the Teams film on the right. Its button
 * starts the free week.
 */
export function SolutionsSection() {
  return (
    <section id="solutions" className="scroll-mt-24 pb-28 md:pb-36">
      <Container>
        <Stage>
          <div className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <p className="text-[15px] font-medium text-neutral-500">Coere Solutions</p>
              <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-5xl md:leading-[1.05]">One memory for the whole company</h2>
              <p className="mt-5 text-lg leading-relaxed text-neutral-600">Everything your team tells AI about the company and its clients, kept in one place. Every chat starts from what the team already knows.</p>
              <CheckList className="mt-7" items={["Company: the team, its tools and how it works", "Clients: each with its contacts, promises and decisions", "The right client: a draft about one never gets another's memory"]} />
              <p className="mt-9 text-[15px] font-medium text-neutral-500">1 week on us.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <CircleArrowLink href="/try-teams">
                  Try it free
                </CircleArrowLink>
                <Link href="/products/solutions" className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-medium text-neutral-950 ring-1 ring-neutral-200 transition-colors hover:ring-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950">
                  Explore Coere Solutions
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl ring-1 ring-neutral-200">
              <FilmFrame film={films.teams} preview />
            </div>
          </div>
        </Stage>
      </Container>
    </section>
  );
}
