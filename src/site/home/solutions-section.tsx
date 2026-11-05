import Link from "next/link";
import { CheckList } from "@/site/blocks/check-list";
import { Stage } from "@/site/blocks/stage";
import { backgrounds } from "@/site/content/backgrounds";
import { films } from "@/site/content/films";
import { CircleArrowLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";
import { FilmFrame } from "@/site/ui/film-frame";

/**
 * Coere Solutions on the home page: one wide panel of artwork with the
 * words in white on the left and the Teams film on the right. Its button
 * starts the free week.
 */
export function SolutionsSection() {
  return (
    <section id="solutions" className="scroll-mt-24 pb-28 md:pb-36">
      <Container>
        <Stage background={backgrounds.prism}>
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/40 to-transparent" />
          <div className="relative grid items-center gap-12 p-8 md:p-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 lg:p-16">
            <div className="text-white">
              <p className="text-[15px] font-medium text-white/75">Coere Solutions</p>
              <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-balance md:text-5xl md:leading-[1.05]">One memory for the whole company</h2>
              <p className="mt-5 text-lg leading-relaxed text-white/85">Everything your team tells AI about the company and its clients, kept in one place. Every chat starts from what the team already knows.</p>
              <CheckList tone="light" className="mt-7" items={["Company: the team, its tools and how it works", "Clients: each with its contacts, promises and decisions", "The right client: a draft about one never gets another's memory"]} />
              <p className="mt-9 text-[15px] font-medium text-white/75">1 week on us.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <CircleArrowLink href="/try-teams" tone="light">
                  Try it free
                </CircleArrowLink>
                <Link href="/products/solutions" className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-medium text-white ring-1 ring-white/40 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Explore Coere Solutions
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/15">
              <FilmFrame film={films.teams} preview />
            </div>
          </div>
        </Stage>
      </Container>
    </section>
  );
}
