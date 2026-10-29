import { AccordionShowcase } from "@/site/blocks/accordion-showcase";
import { CheckList } from "@/site/blocks/check-list";
import { FeatureGrid } from "@/site/blocks/feature-grid";
import { backgrounds } from "@/site/content/backgrounds";
import { films } from "@/site/content/films";
import { solutionsCases, solutionsGrid, solutionsHero } from "@/site/content/pages/solutions";
import { ClosingCta } from "@/site/home/closing-cta";
import { Container } from "@/site/ui/container";
import { FilmFrame } from "@/site/ui/film-frame";
import { AiTiles } from "./ai-tiles";
import { asGrid, asShowcase } from "./film-cases";
import { ProductHero } from "./hero";
import { OtherProducts } from "./other-products";
import { ProductSection } from "./product-section";

/** Coere Solutions: how a team shares one memory, the AIs it works with, and everything it does. */
export function SolutionsPage() {
  return (
    <>
      <ProductHero copy={solutionsHero} background={backgrounds.glass} app={<FilmFrame film={films.teams} />} secondary={{ href: "#how", label: "How it works" }} />
      <ProductSection id="how" title="How your team shares one memory" line="Built from the chats your team already has, sorted into the company and each client.">
        <AccordionShowcase items={asShowcase(solutionsCases)} background={backgrounds.waves} />
      </ProductSection>
      <section className="py-28 md:py-32">
        <Container className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <div>
            <h2 className="text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-5xl md:leading-[1.05]">Works with the AIs your team already uses</h2>
            <p className="mt-5 text-lg leading-relaxed text-neutral-600">Nobody switches tools. Coere saves the chats from each AI your team picks and keeps the memory in step with them.</p>
            <CheckList className="mt-7" items={["Pick the AIs at setup, and Save", "Extract all saves every chat from each one", "New chats come in by themselves"]} />
          </div>
          <div className="rounded-[28px] bg-neutral-50 p-8 md:p-12">
            <AiTiles />
          </div>
        </Container>
      </section>
      <ProductSection title="Everything in Coere Solutions" tint>
        <FeatureGrid items={asGrid(solutionsGrid)} />
      </ProductSection>
      <OtherProducts current="solutions" />
      <ClosingCta title="One memory for the whole company." />
    </>
  );
}
