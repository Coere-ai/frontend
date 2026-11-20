import { founders, siteConfig } from "@/lib/site";
import { Container } from "@/site/ui/container";
import { Reveal } from "@/site/ui/reveal";
import { TeamCard } from "./team-card";
import { TeamLanyards } from "./team-lanyards";

/** The people behind Coere, on the dark page: their lanyards, then each founder's record in two columns. */
export function TeamSection() {
  return (
    <section id="team" className="relative isolate scroll-mt-24 overflow-hidden pt-24 pb-28 md:pt-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold text-brand-300">Our team</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-white text-balance md:text-[3.5rem] md:leading-[1.04]">
            The people building Coere
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/65 text-pretty">{siteConfig.notCohere}</p>
        </div>
        <div className="mx-auto mt-4 max-w-6xl">
          <TeamLanyards members={founders} />
          <p className="mt-4 hidden text-center text-[14px] text-white/50 sm:block">Drag a card to swing it, or click it to turn it over.</p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-2">
          {founders.map((member, index) => (
            <Reveal key={member.name} delay={index * 0.06} className="h-full">
              <TeamCard member={member} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
