import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CenterHero } from "@/site/blocks/center-hero";
import { pricingSeo } from "@/site/content/seo";
import { ClosingCta } from "@/site/home/closing-cta";
import { getLocale, getMessages } from "@/site/i18n/server";
import { PricingSection } from "@/site/pricing/pricing-section";
import { DarkPage } from "@/site/ui/page-theme";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, { seo }] = await Promise.all([getLocale(), getMessages()]);
  return pageMetadata({ ...pricingSeo, ...seo.pricing, path: "/pricing", locale, translated: true });
}

/** Pricing: the three plans, free for one person, then a word with the founders, dark from top to footer. */
export default async function PricingPage() {
  const { pricing } = await getMessages();
  return (
    <DarkPage>
      <CenterHero title={pricing.title} line={pricing.line} />
      <PricingSection bare />
      <ClosingCta title={pricing.closing.title} text={pricing.closing.text} />
    </DarkPage>
  );
}
