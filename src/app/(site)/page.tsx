import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { FaqSection } from "@/site/blocks/faq";
import { homeFaqs } from "@/site/content/faqs";
import { homeSeo } from "@/site/content/seo";
import { ClosingCta } from "@/site/home/closing-cta";
import { CompareTable } from "@/site/home/compare-table";
import { ConnectSection } from "@/site/home/connect-section";
import { DemoSection } from "@/site/home/demo-section";
import { ForgeSection } from "@/site/home/forge-section";
import { Hero } from "@/site/home/hero";
import { SolutionsSection } from "@/site/home/solutions-section";
import { SolvesSection } from "@/site/home/solves-section";
import { faqGraph, JsonLd, siteGraph } from "@/site/seo/json-ld";

export const metadata: Metadata = pageMetadata({ ...homeSeo, path: "/" });

/**
 * The home page, kept short: the line, the full demo, what Coere solves, one part per product,
 * each with its own layout and a way to its page, then how Coere compares
 * and the questions people ask first.
 */
export default function HomePage() {
  return (
    <>
      <JsonLd data={siteGraph} />
      <JsonLd data={faqGraph(homeFaqs)} />
      <Hero />
      <DemoSection />
      <SolvesSection />
      <ConnectSection />
      <SolutionsSection />
      <ForgeSection />
      <CompareTable />
      <FaqSection faqs={homeFaqs} title="What people ask about Coere" />
      <ClosingCta />
    </>
  );
}
