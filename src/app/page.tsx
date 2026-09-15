import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { WhatWeDo } from "@/components/what-we-do";
import { WhoWeAre } from "@/components/who-we-are";
import { founders, siteConfig } from "@/lib/site";

/** Structured data so search + AI crawlers understand who Coere is. */
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.legalName,
  url: siteConfig.url,
  email: siteConfig.email,
  description: siteConfig.description,
  founder: founders.map((founder) => ({
    "@type": "Person",
    name: founder.name,
    jobTitle: founder.role,
    affiliation: {
      "@type": "CollegeOrUniversity",
      name: "University of California, Berkeley",
    },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static, developer-authored JSON-LD. No user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SiteNav />
      <main className="flex-1">
        <WhatWeDo />
        <WhoWeAre />
      </main>
      <SiteFooter />
    </>
  );
}
