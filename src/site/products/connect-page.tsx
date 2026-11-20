import { FeatureGrid } from "@/site/blocks/feature-grid";
import { SlantCard } from "@/site/blocks/slant-card";
import { UseCaseTabs } from "@/site/blocks/use-case-tabs";
import { backgrounds } from "@/site/content/backgrounds";
import { ALL_FEATURES } from "@/site/content/features";
import { films } from "@/site/content/films";
import { connectCasesIn, connectGridIn, connectSlidesIn } from "@/site/content/pages/connect";
import { ClosingCta } from "@/site/home/closing-cta";
import { SECTION_Y } from "@/site/home/look";
import { getMessages } from "@/site/i18n/server";
import { Container } from "@/site/ui/container";
import { FilmFrame } from "@/site/ui/film-frame";
import { CompareSection } from "./compare-section";
import { ConnectBackdrop } from "./backdrops";
import { asGrid, asUseCases } from "./film-cases";
import { ProductHero } from "./hero";
import { OtherProducts } from "./other-products";
import { ProductSection } from "./product-section";

/** Coere Connect: what people use it for, what it saves against pasting context by hand, everything it does, then why they choose it. */
export async function ConnectPage() {
  const { productPages, catalog } = await getMessages();
  const t = productPages.connect;
  return (
    <>
      <ProductHero copy={t.hero} backdrop={<ConnectBackdrop />} tone="dark" app={<FilmFrame film={films.v2} preview />} secondary={{ href: "#use-cases", label: t.secondary }} />
      <ProductSection id="use-cases" title={t.useCases.title} line={t.useCases.line} link={{ href: "/portable-ai-memory", linkLabel: t.useCases.link }} tint>
        <UseCaseTabs cases={asUseCases(connectCasesIn(t, catalog.seeAllFeatures))} />
      </ProductSection>
      <CompareSection words={t.compare} />
      <ProductSection title={t.everything} link={{ href: ALL_FEATURES.href, linkLabel: catalog.seeAllFeatures }}>
        <FeatureGrid items={asGrid(connectGridIn(t))} />
      </ProductSection>
      <section className={SECTION_Y}>
        <Container>
          <SlantCard heading={t.why} slides={connectSlidesIn(t)} background={backgrounds.ribbons} />
        </Container>
      </section>
      <OtherProducts current="connect" />
      <ClosingCta title={t.closing} />
    </>
  );
}
