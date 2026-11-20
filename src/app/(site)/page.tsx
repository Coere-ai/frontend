import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { FaqSection } from "@/site/blocks/faq";
import { homeFaqs } from "@/site/content/faqs";
import { homeSeo } from "@/site/content/seo";
import { BlogSection } from "@/site/home/blog-section";
import { ClosingCta } from "@/site/home/closing-cta";
import { ConnectSection } from "@/site/home/connect-section";
import { DemoSection } from "@/site/home/demo-section";
import { ForgeSection } from "@/site/home/forge-section";
import { Hero } from "@/site/home/hero";
import { LogoLoopSection } from "@/site/home/logo-loop-section";
import { PricingSection } from "@/site/pricing/pricing-section";
import { SolutionsSection } from "@/site/home/solutions-section";
import { SolvesSection } from "@/site/home/solves-section";
import { faqGraph, JsonLd, siteGraph } from "@/site/seo/json-ld";

export const metadata: Metadata = pageMetadata({ ...homeSeo, path: "/" });

/**
 * The home page: the hero with its three pictures, every AI Coere works
 * with, the full demo, what Coere solves, one part per product, each with
 * its own layout and a way to its page, the plans,
 * the questions people ask first, the newest posts and the last word.
 */
export default function HomePage() {
  return (
    <>
      <JsonLd data={siteGraph} />
      <JsonLd data={faqGraph(homeFaqs)} />
      <Hero />
      <LogoLoopSection />
      <DemoSection />
      <SolvesSection />
      <ConnectSection />
      <SolutionsSection />
      <ForgeSection />
      <PricingSection />
      <FaqSection faqs={homeFaqs} title="What people ask about Coere" look="soft" />
      <BlogSection />
      <ClosingCta />
    </>
  );
}
