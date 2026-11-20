import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { aboutSeo } from "@/site/content/seo";
import { AboutHero } from "@/site/about/about-hero";
import { StoryDiagram } from "@/site/about/story-diagram";
import { TeamSection } from "@/site/about/team-section";
import { ClosingCta } from "@/site/home/closing-cta";

export const metadata: Metadata = pageMetadata({ ...aboutSeo, path: "/about" });

export default function AboutPage() {
  return (
    <>
      <AboutHero
        line="We're building the memory layer people own"
        story="Coere started when Michelle kept explaining the same project to every AI she switched to. Each one knew a piece of her, and none of them knew the rest."
      />
      <StoryDiagram />
      <TeamSection />
      <ClosingCta title="Help us put people back together." text="We're hiring a founding team, and we'd love to hear from you." />
    </>
  );
}
