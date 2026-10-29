import { ClosingCta } from "@/site/home/closing-cta";
import { DemoSection } from "@/site/home/demo-section";
import { FeatureRows } from "@/site/home/feature-rows";
import { Hero } from "@/site/home/hero";
import { ProductsSection } from "@/site/home/products-section";

/** The new home page: the line, the full demo, every feature, the products, and a way to talk. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <DemoSection />
      <FeatureRows />
      <ProductsSection />
      <ClosingCta />
    </>
  );
}
