import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { FaqSection } from "@/site/blocks/faq";
import { homeFaqsIn } from "@/site/content/faqs";
import { homeSeo } from "@/site/content/seo";
import { BlogSection } from "@/site/home/blog-section";
import { ClosingCta } from "@/site/home/closing-cta";
import { Hero } from "@/site/home/hero";
import { LogoLoopSection } from "@/site/home/logo-loop-section";
import { ProductsSection } from "@/site/home/products-section";
import { PricingSection } from "@/site/pricing/pricing-section";
import { SolvesSection } from "@/site/home/solves-section";
import { I18nProvider } from "@/site/i18n/client";
import { getLocale, getMessages } from "@/site/i18n/server";
import { faqGraph, JsonLd, siteGraph } from "@/site/seo/json-ld";
import { DarkPage } from "@/site/ui/page-theme";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, { seo }] = await Promise.all([getLocale(), getMessages()]);
  return pageMetadata({ ...homeSeo, ...seo.home, path: "/", locale, translated: true });
}

/**
 * The home page: the hero with its three pictures, every AI Coere works
 * with, the three products side by side (the demo has its own page at
 * /demo), what Coere solves, the plans,
 * the questions people ask first, the newest posts and the last word.
 * The hero is dark, so the whole page is, down to the footer.
 */
export default async function HomePage() {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);
  const faqs = homeFaqsIn(messages.faqs.home, locale);
  return (
    <I18nProvider messages={{ home: messages.home, blog: messages.blog }}>
      <JsonLd data={siteGraph} />
      <JsonLd data={faqGraph(faqs)} />
      <DarkPage>
        <Hero />
        <LogoLoopSection />
        <ProductsSection />
        <SolvesSection />
        <PricingSection />
        <FaqSection faqs={faqs} title={messages.home.faqTitle} look="soft" />
        <BlogSection />
        <ClosingCta />
      </DarkPage>
    </I18nProvider>
  );
}
