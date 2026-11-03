import { executives, founders, siteConfig, type TeamMember } from "@/lib/site";
import type { Faq } from "@/site/content/faqs";
import type { Product } from "@/site/content/products";

/**
 * Structured data, so search engines and AI crawlers know who Coere is and
 * what it makes. The WebSite tells Google the site's name for results
 * ("Coere", also known as "Coere AI"); the Organization carries the same
 * names, the logo, the people and the profiles that speak for it, and says
 * plainly that Coere is not Cohere.
 */

const home = `${siteConfig.url}/`;
const organizationId = `${home}#organization`;

const person = (member: TeamMember) => ({
  "@type": "Person",
  name: member.name,
  jobTitle: member.role,
  affiliation: { "@type": "CollegeOrUniversity", name: "University of California, Berkeley" },
  worksFor: { "@id": organizationId },
});

export const siteGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${home}#website`,
      url: home,
      name: siteConfig.name,
      alternateName: [siteConfig.legalName, siteConfig.domain],
      description: siteConfig.description,
      inLanguage: "en",
      publisher: { "@id": organizationId },
    },
    {
      "@type": "Organization",
      "@id": organizationId,
      url: home,
      name: siteConfig.name,
      alternateName: [siteConfig.legalName, siteConfig.domain],
      legalName: siteConfig.legalName,
      description: siteConfig.summary,
      disambiguatingDescription: siteConfig.notCohere,
      slogan: siteConfig.tagline,
      knowsAbout: ["Portable AI memory", "AI memory layer", "Cross-AI memory", "Personal knowledge graph", "Model Context Protocol"],
      email: siteConfig.email,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/coere-logo.png`, width: 1024, height: 1024 },
      sameAs: siteConfig.profiles,
      founder: founders.map(person),
      employee: executives.map(person),
    },
  ],
};

/** What kind of software each product is, in schema.org's words. */
const KIND: Record<Product["slug"], { category: string; system: string }> = {
  connect: { category: "BrowserApplication", system: "Chrome" },
  solutions: { category: "BusinessApplication", system: "Chrome" },
  forge: { category: "DeveloperApplication", system: "Any" },
  agents: { category: "BrowserApplication", system: "Chrome" },
};

/** One product as a SoftwareApplication, made by Coere. */
export function productGraph(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    url: `${siteConfig.url}/products/${product.slug}`,
    description: product.description,
    applicationCategory: KIND[product.slug].category,
    operatingSystem: KIND[product.slug].system,
    image: `${siteConfig.url}${product.image}`,
    publisher: { "@id": organizationId },
  };
}

/** A page's visible questions and answers as FAQPage, word for word. Use it only where FaqSection shows the same list. */
export function faqGraph(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

/** Writes structured data into the page. It is our own static data, and "<" is escaped so the script can never close early. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
