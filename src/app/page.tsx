import { Products } from "@/components/products";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { WhatWeDo } from "@/components/what-we-do";
import { WhoWeAre } from "@/components/who-we-are";
import type { Metadata } from "next";
import { executives, founders, siteConfig, type TeamMember } from "@/lib/site";

export const metadata: Metadata = {
  // The home page names itself as canonical; other routes don't inherit it.
  alternates: { canonical: "/" },
};

const home = `${siteConfig.url}/`;
const organizationId = `${home}#organization`;

const berkeley = {
  "@type": "CollegeOrUniversity",
  name: "University of California, Berkeley",
};

const person = (member: TeamMember) => ({
  "@type": "Person",
  name: member.name,
  jobTitle: member.role,
  affiliation: berkeley,
  worksFor: { "@id": organizationId },
});

/**
 * Structured data so search engines and AI crawlers know who Coere is. The
 * WebSite tells Google the site's name for results ("Coere", also known as
 * "Coere AI"); the Organization carries the same names, the logo and the
 * profiles that speak for it.
 */
const structuredData = {
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
      alternateName: siteConfig.legalName,
      legalName: siteConfig.legalName,
      description: siteConfig.description,
      slogan: siteConfig.tagline,
      email: siteConfig.email,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/coere-logo.png`,
        width: 1024,
        height: 1024,
      },
      sameAs: siteConfig.profiles,
      founder: founders.map(person),
      employee: executives.map(person),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static, developer-authored JSON-LD. No user input reaches this, and
        // "<" is escaped anyway so the script can never be closed early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <SiteNav />
      <main className="flex-1">
        <WhatWeDo />
        <Products />
        <WhoWeAre />
      </main>
      <SiteFooter />
    </>
  );
}
