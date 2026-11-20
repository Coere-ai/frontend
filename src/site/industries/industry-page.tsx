import { AccordionShowcase } from "@/site/blocks/accordion-showcase";
import { SoftBackdrop } from "@/site/blocks/soft-backdrop";
import { SplitHero } from "@/site/blocks/split-hero";
import { industries, type Industry } from "@/site/content/industries";
import type { DemoKey } from "@/site/content/industry-stories/types";
import type { IndustryPage as Content } from "@/site/content/industry-stories";
import { contactHref, contactLabel } from "@/site/content/navigation";
import { productBySlug } from "@/site/content/products";
import { ClosingCta } from "@/site/home/closing-cta";
import { ProductSection } from "@/site/products/product-section";
import { LiveDemo } from "@/site/ui/live-demo";
import { MoreIndustries } from "./more-industries";

/** The industry film's chapters, in order: each demo loops from its own to the next. */
const ORDER: DemoKey[] = ["context", "graph", "confidential", "app"];

/**
 * One industry: its opening, with the app under LaserFlow's beam, then
 * each Coere product told through an example from that field, played live
 * on Coere's real code with the field's own people and work, then a few
 * other fields. The field's photo carries the showcase below.
 */
export function IndustryPage({ industry, content }: { industry: Industry; content: Content }) {
  const demo = (key: DemoKey, label: string) => <LiveDemo film={`industry-${industry.slug}`} from={key} to={ORDER[ORDER.indexOf(key) + 1]} label={label} />;
  const items = content.stories.map((story) => {
    const product = productBySlug(story.product);
    return {
      key: story.demo,
      title: story.title,
      summary: story.text,
      checks: story.checks,
      href: `/products/${story.product}`,
      linkLabel: `With ${product?.name ?? "Coere"}`,
      visual: demo(story.demo, `${story.title}, shown on the app`),
    };
  });

  return (
    <>
      <SplitHero
        backdrop={<SoftBackdrop />}
        laser
        eyebrow="Industries"
        title={`Coere for ${industry.name.toLowerCase()}`}
        line={content.line}
        checks={content.highlights}
        primary={{ href: contactHref, label: contactLabel }}
        secondary={{ href: "#how", label: "See how" }}
        app={demo("context", `Coere for ${industry.name.toLowerCase()}, shown on the app`)}
      />
      <ProductSection id="how" title={`What ${industry.name.toLowerCase()} teams do with Coere`} line="Each Coere product, through an example from the field.">
        <AccordionShowcase items={items} background={{ src: industry.photo.src, by: industry.photo.by }} />
      </ProductSection>
      <MoreIndustries current={industry.slug} all={industries} />
      <ClosingCta title={`Bring memory to ${industry.name.toLowerCase()}.`} text="Tell us what your people repeat to AI every day." />
    </>
  );
}
