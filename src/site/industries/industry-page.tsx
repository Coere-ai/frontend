import { AccordionShowcase } from "@/site/blocks/accordion-showcase";
import { SplitHero } from "@/site/blocks/split-hero";
import { complianceFor } from "@/site/content/compliance";
import { industriesIn, type Industry } from "@/site/content/industries";
import type { DemoKey } from "@/site/content/industry-stories/types";
import type { IndustryPage as Content } from "@/site/content/industry-stories";
import { contactHref } from "@/site/content/navigation";
import { productBySlug } from "@/site/content/products";
import { ClosingCta } from "@/site/home/closing-cta";
import { getMessages } from "@/site/i18n/server";
import { format } from "@/site/i18n/types";
import { ProductSection } from "@/site/products/product-section";
import { LiveDemo } from "@/site/ui/live-demo";
import { DarkPage } from "@/site/ui/page-theme";
import { ComplianceSection } from "./compliance-section";
import { IndustryBackdrop } from "./industry-backdrop";
import { MoreIndustries } from "./more-industries";

/** The industry film's chapters, in order: each demo loops from its own to the next. */
const ORDER: DemoKey[] = ["context", "graph", "confidential", "app"];

/**
 * One industry: its opening on the field's photo with the app beside the
 * words, then each Coere product told through an example from that field,
 * played live on Coere's real code with the field's own people and work,
 * then the standards Coere will meet before it handles the field's data,
 * then a few other fields. The photo carries the showcase below too.
 * The photo hero reads dark, so the whole page is dark. Every word comes
 * from the page's language; the films stay as Coere's app shows them.
 */
export async function IndustryPage({ industry, content }: { industry: Industry; content: Content }) {
  const { industryPages: t, catalog, chrome } = await getMessages();
  const words = t.fields[industry.slug as keyof typeof t.fields];
  const demo = (key: DemoKey, label: string) => <LiveDemo film={`industry-${industry.slug}`} from={key} to={ORDER[ORDER.indexOf(key) + 1]} label={label} />;
  const compliance = complianceFor(industry.slug);
  const items = content.stories.map((story, i) => {
    const product = productBySlug(story.product);
    const copy = words.stories[i];
    return {
      key: story.demo,
      title: copy.title,
      summary: copy.text,
      checks: [...copy.checks],
      href: `/products/${story.product}`,
      linkLabel: format(t.withProduct, { product: product?.name ?? "Coere" }),
      visual: demo(story.demo, format(t.shownOnApp, { title: copy.title })),
    };
  });
  return (
    <DarkPage>
      <SplitHero
        backdrop={<IndustryBackdrop photo={industry.photo.src} focus={industry.photo.focus} />}
        tone="dark"
        title={words.title}
        line={words.line}
        checks={[...words.highlights]}
        primary={{ href: contactHref, label: chrome.common.waitlist }}
        secondary={{ href: "#how", label: t.seeHow }}
        app={demo("context", format(t.shownOnApp, { title: words.title }))}
      />
      <ProductSection id="how" title={words.how} line={t.howLine}>
        <AccordionShowcase items={items} background={{ src: industry.photo.src, by: industry.photo.by }} />
      </ProductSection>
      {compliance ? <ComplianceSection compliance={compliance} words={words} section={t} /> : null}
      <MoreIndustries current={industry.slug} all={industriesIn(catalog)} title={t.more} />
      <ClosingCta title={words.closing} text={t.closingText} />
    </DarkPage>
  );
}
