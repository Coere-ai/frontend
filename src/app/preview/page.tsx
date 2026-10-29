import { ClosingCta } from "@/site/home/closing-cta";
import { ConnectSection } from "@/site/home/connect-section";
import { DemoSection } from "@/site/home/demo-section";
import { ForgeSection } from "@/site/home/forge-section";
import { Hero } from "@/site/home/hero";
import { SolutionsSection } from "@/site/home/solutions-section";

/**
 * The home page, kept short: the line, the full demo, then one part per
 * product, each with its own layout and a way to its page.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <DemoSection />
      <ConnectSection />
      <SolutionsSection />
      <ForgeSection />
      <ClosingCta />
    </>
  );
}
