import { features } from "@/site/content/features";
import { products } from "@/site/content/products";
import { Container } from "@/site/ui/container";
import { SectionHeading } from "@/site/ui/section-heading";
import { FeatureRow } from "./feature-row";

/** The product a feature belongs to first, for the row's "In Coere ..." link. */
function homeProduct(slug: string) {
  return products.find((product) => product.features.includes(slug));
}

/** Every feature with its film, alternating left and right down the page. */
export function FeatureRows() {
  return (
    <section id="features" className="scroll-mt-24 border-t border-neutral-100 py-28">
      <Container>
        <SectionHeading
          eyebrow="Features"
          title="Everything your memory can do"
          description="Each film is recorded from the real extension. They play as you scroll."
        />
        <div className="mt-20 space-y-28 md:space-y-36">
          {features.map((feature, index) => (
            <FeatureRow key={feature.slug} feature={feature} product={homeProduct(feature.slug)} flip={index % 2 === 1} />
          ))}
        </div>
      </Container>
    </section>
  );
}
