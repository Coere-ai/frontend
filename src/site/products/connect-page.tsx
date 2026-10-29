import { FeatureGrid } from "@/site/blocks/feature-grid";
import { SlantCard } from "@/site/blocks/slant-card";
import { UseCaseTabs } from "@/site/blocks/use-case-tabs";
import { backgrounds } from "@/site/content/backgrounds";
import { films } from "@/site/content/films";
import { connectCases, connectGrid, connectHero, connectSlides } from "@/site/content/pages/connect";
import { ClosingCta } from "@/site/home/closing-cta";
import { Container } from "@/site/ui/container";
import { FilmFrame } from "@/site/ui/film-frame";
import { asGrid, asUseCases } from "./film-cases";
import { ProductHero } from "./hero";
import { OtherProducts } from "./other-products";
import { ProductSection } from "./product-section";

/** Coere Connect: why people use it, what they use it for, then everything it does. */
export function ConnectPage() {
  return (
    <>
      <ProductHero copy={connectHero} background={backgrounds.tangle} app={<FilmFrame film={films.v2} />} secondary={{ href: "#use-cases", label: "See what it does" }} />
      <section className="py-28 md:py-32">
        <Container>
          <SlantCard heading="Why people choose Coere Connect" slides={connectSlides} background={backgrounds.flow} />
        </Container>
      </section>
      <ProductSection id="use-cases" title="Put your memory to work" line="Bring every chat in, build one memory from them, and let Cori act on it." tint>
        <UseCaseTabs cases={asUseCases(connectCases)} />
      </ProductSection>
      <ProductSection title="Everything in Coere Connect">
        <FeatureGrid items={asGrid(connectGrid)} />
      </ProductSection>
      <OtherProducts current="connect" />
      <ClosingCta title="Your memory, across every AI." />
    </>
  );
}
