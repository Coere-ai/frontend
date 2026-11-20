import { AccordionShowcase } from "@/site/blocks/accordion-showcase";
import { CheckList } from "@/site/blocks/check-list";
import { FeatureGrid } from "@/site/blocks/feature-grid";
import { backgrounds } from "@/site/content/backgrounds";
import { ALL_FEATURES } from "@/site/content/features";
import { films } from "@/site/content/films";
import { demoHref } from "@/site/content/navigation";
import { solutionsCasesIn, solutionsGridIn } from "@/site/content/pages/solutions";
import { ClosingCta } from "@/site/home/closing-cta";
import { SECTION_TITLE, SECTION_Y, SOFT_FIELD } from "@/site/home/look";
import { getMessages } from "@/site/i18n/server";
import { Container } from "@/site/ui/container";
import { FilmFrame } from "@/site/ui/film-frame";
import { AiTiles } from "./ai-tiles";
import { asGrid, asShowcase } from "./film-cases";
import { ProductHero } from "./hero";
import { OtherProducts } from "./other-products";
import { ProductSection } from "./product-section";
import { SolutionsBackdrop } from "./solutions-backdrop";

/** Coere Solutions: how a team shares one memory, the AIs it works with, and everything it does. */
export async function SolutionsPage() {
  const { productPages, catalog, chrome } = await getMessages();
  const t = productPages.solutions;
  const demo = { href: demoHref, label: chrome.common.bookDemo };
  return (
    <>
      <ProductHero copy={t.hero} backdrop={<SolutionsBackdrop />} tone="dark" app={<FilmFrame film={films.teams} preview />} primary={demo} secondary={{ href: "#how", label: t.secondary }} />
      <ProductSection id="how" title={t.how.title} line={t.how.line}>
        <AccordionShowcase items={asShowcase(solutionsCasesIn(t, catalog.seeAllFeatures))} background={backgrounds.tangle} />
      </ProductSection>
      <section className={SECTION_Y}>
        <Container className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <div>
            <h2 className={SECTION_TITLE}>{t.ais.title}</h2>
            <p className="mt-5 text-lg leading-relaxed text-neutral-600 dark:text-white/65">{t.ais.line}</p>
            <CheckList className="mt-7" items={[...t.ais.checks]} />
          </div>
          <div className={`${SOFT_FIELD} p-8 md:p-12`}>
            <AiTiles />
          </div>
        </Container>
      </section>
      <ProductSection title={t.everything} link={{ href: ALL_FEATURES.href, linkLabel: catalog.seeAllFeatures }} tint>
        <FeatureGrid items={asGrid(solutionsGridIn(t))} />
      </ProductSection>
      <OtherProducts current="solutions" />
      <ClosingCta title={t.closing.title} text={t.closing.text} primary={demo} />
    </>
  );
}
