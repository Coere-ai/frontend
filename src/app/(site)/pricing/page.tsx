import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CenterHero } from "@/site/blocks/center-hero";
import { pricingSeo } from "@/site/content/seo";
import { ClosingCta } from "@/site/home/closing-cta";
import { PricingSection } from "@/site/pricing/pricing-section";

export const metadata: Metadata = pageMetadata({ ...pricingSeo, path: "/pricing" });

/** Pricing: the three plans, free for one person, then a word with the founders. */
export default function PricingPage() {
  return (
    <>
      <CenterHero eyebrow="Pricing" title="A plan for you, your team or your app" line="Coere is free for one person. Teams and developers talk to us." />
      <PricingSection bare />
      <ClosingCta title="Not sure which plan fits?" text="Talk to the founders about Coere for you, your team or your app." />
    </>
  );
}
