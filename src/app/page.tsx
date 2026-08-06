import { ClosingCta } from "@/components/closing-cta";
import { FoundersSection } from "@/components/founders-section";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { CapsuleFlow } from "@/components/capsule-flow";
import { Comparison } from "@/components/comparison";
import { Costs } from "@/components/costs";
import { founders, siteConfig } from "@/lib/site";

/** Structured data so search + AI crawlers understand what Coere is. */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
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
    },
    {
      "@type": "SoftwareApplication",
      name: siteConfig.extensionName,
      applicationCategory: "BrowserApplication",
      operatingSystem: "Chrome",
      description: siteConfig.description,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
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
        <Hero />
        <Comparison />
        <CapsuleFlow />
        <HowItWorks />
        <Costs />
        <FoundersSection />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
