import { AccordionShowcase } from "@/site/blocks/accordion-showcase";
import { PhotoHero } from "@/site/blocks/photo-hero";
import { films } from "@/site/content/films";
import { industries, type Industry } from "@/site/content/industries";
import type { IndustryPage as Content } from "@/site/content/industry-stories";
import { contactHref } from "@/site/content/navigation";
import { productBySlug } from "@/site/content/products";
import { ClosingCta } from "@/site/home/closing-cta";
import { ProductSection } from "@/site/products/product-section";
import { FilmFrame } from "@/site/ui/film-frame";
import { MoreIndustries } from "./more-industries";

/**
 * One industry: its photo with the app set on it, then each Coere product
 * told through an example from that field, then a few other fields.
 */
export function IndustryPage({ industry, content }: { industry: Industry; content: Content }) {
  const lead = content.stories[0];
  const items = content.stories.map((story) => {
    const product = productBySlug(story.product);
    return {
      key: `${story.product}-${story.film}`,
      title: story.title,
      summary: story.text,
      checks: story.checks,
      href: `/products/${story.product}`,
      linkLabel: `With ${product?.name ?? "Coere"}`,
      visual: <FilmFrame film={films[story.film]} preview />,
    };
  });

  return (
    <>
      <PhotoHero
        photo={industry.photo.src}
        alt={industry.photo.alt}
        eyebrow="Industries"
        title={`Coere for ${industry.name.toLowerCase()}`}
        line={content.line}
        checks={content.stories.map((story) => story.title)}
        primary={{ href: contactHref, label: "Talk to Us" }}
        secondary={{ href: "#how", label: "See how" }}
        app={<FilmFrame film={films[lead.film]} />}
      />
      <ProductSection id="how" title={`What ${industry.name.toLowerCase()} teams do with Coere`} line="Each Coere product, through an example from the field.">
        <AccordionShowcase items={items} background={{ src: industry.photo.src, by: industry.photo.by }} />
      </ProductSection>
      <MoreIndustries current={industry.slug} all={industries} />
      <ClosingCta title={`Bring memory to ${industry.name.toLowerCase()}.`} text="Tell us what your people repeat to AI every day." />
    </>
  );
}
