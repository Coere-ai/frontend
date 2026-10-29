import { featureBySlug } from "@/site/content/features";
import { backgrounds } from "@/site/content/backgrounds";
import { films } from "@/site/content/films";
import type { Product } from "@/site/content/products";
import { ClosingCta } from "@/site/home/closing-cta";
import { FeatureRow } from "@/site/home/feature-row";
import { Container } from "@/site/ui/container";
import { FilmShowcase } from "@/site/ui/film-showcase";
import { SectionHeading } from "@/site/ui/section-heading";
import { OtherProducts } from "./other-products";
import { ProductHero } from "./product-hero";
import { ProductHighlights } from "./product-highlights";

/** Everything on a product page, top to bottom. */
export function ProductPage({ product }: { product: Product }) {
  const features = product.features.map(featureBySlug).filter((f) => f !== undefined);
  return (
    <>
      <ProductHero product={product} />
      <section id="film" className="scroll-mt-24">
        <Container>
          <FilmShowcase film={films[product.film]} backdrop={backgrounds.waves} />
        </Container>
      </section>
      <ProductHighlights product={product} />
      <section className="border-t border-neutral-100 py-28">
        <Container>
          <SectionHeading eyebrow="Features" title={`What ${product.name} does`} />
          <div className="mt-20 space-y-28 md:space-y-36">
            {features.map((feature, index) => (
              <FeatureRow key={feature.slug} feature={feature} flip={index % 2 === 1} />
            ))}
          </div>
        </Container>
      </section>
      <OtherProducts current={product.slug} />
      <ClosingCta title={product.tagline} />
    </>
  );
}
