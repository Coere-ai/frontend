import { industryCompliance, inPlaceToday } from "@/site/content/compliance";
import { industryPage } from "@/site/content/industry-stories";
import { industryAudience } from "@/site/content/seo";
import { catalog } from "./catalog";

/**
 * The industries index and the eight industry pages. The English stories
 * and standards stay where they were written (content/industry-stories and
 * content/compliance, which its test guards); this gathers them in the
 * messages' shape, so each other language mirrors it field by field.
 */
type Slug = keyof typeof catalog.industries;

function field(slug: Slug) {
  const name = catalog.industries[slug].name.toLowerCase();
  const page = industryPage(slug)!;
  const compliance = industryCompliance[slug];
  const audience = industryAudience[slug] ?? name;
  const full = `${page.line} One AI memory for ${audience}, across ChatGPT, Claude and Gemini.`;
  return {
    seoTitle: `Coere for ${name}: AI memory for ${audience}`,
    // The AIs it works across, when the field's own line leaves room for them in a result.
    seoDescription: full.length <= 160 ? full : `${page.line} One AI memory for ${audience}.`,
    title: `Coere for ${name}`,
    how: `What ${name} teams do with Coere`,
    closing: `Bring memory to ${name}.`,
    complianceTitle: `Compliance for ${name}`,
    complianceLine: `What Coere will meet before it handles ${compliance.holder} data.`,
    complianceNote: `Coere is pre launch. It is not yet audited against these standards, and it will meet them before it works with ${name} teams.`,
    highlights: page.highlights,
    line: page.line,
    stories: page.stories.map(({ title, text, checks }) => ({ title, text, checks })),
    standards: compliance.standards.map(({ where, why }) => (where ? { where, why } : { why })),
  };
}

export const industryPages = {
  index: {
    seo: {
      title: "AI memory for every industry",
      description: "How a memory you own works in law, finance, technology, commerce, consumer brands, manufacturing, energy and education, with each client's memory kept apart.",
    },
    title: "Memory for every industry",
    line: "Coere gives people, teams and apps a memory they control. Start with who it is for, then open your field.",
    whoFor: "Who it's for",
    industries: "Industries",
    willMeet: "Coere will meet {standards}.",
    credits: "Photos on Unsplash by {names}.",
    closing: { title: "Bring memory to your field.", text: "Tell us about your industry and what your people repeat to AI every day." },
  },
  withProduct: "With {product}",
  seeHow: "See how",
  shownOnApp: "{title}, shown on the app",
  howLine: "Each Coere product, through an example from the field.",
  closingText: "Tell us what your people repeat to AI every day.",
  more: "More industries",
  inPlace: "In place today",
  readPolicy: "Read the privacy policy",
  facts: inPlaceToday,
  fields: {
    finance: field("finance"),
    technology: field("technology"),
    commerce: field("commerce"),
    consumer: field("consumer"),
    manufacturing: field("manufacturing"),
    energy: field("energy"),
    education: field("education"),
    legal: field("legal"),
  },
};
