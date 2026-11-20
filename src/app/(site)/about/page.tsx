import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { aboutSeo } from "@/site/content/seo";
import { AboutClosing } from "@/site/about/about-closing";
import { AboutHero } from "@/site/about/about-hero";
import { StoryDiagram } from "@/site/about/story-diagram";
import { TeamSection } from "@/site/about/team-section";
import { UNDER_NAV } from "@/site/nav/nav-space";

export const metadata: Metadata = pageMetadata({ ...aboutSeo, path: "/about" });

/**
 * The About page, dark from the top down to the footer: flat near black,
 * with ASCII Tiles behind the hero only. The whole page is marked dark,
 * so the glass navbar stays dark over every part of it.
 */
export default function AboutPage() {
  return (
    <div data-nav-tone="dark" className={`bg-[#0b0a12] text-white ${UNDER_NAV}`}>
      <AboutHero
        line="We're building the memory layer people own"
        story="Coere started when Michelle kept explaining the same project to every AI she switched to. Each one knew a piece of her, and none of them knew the rest."
      />
      <StoryDiagram />
      <TeamSection />
      <AboutClosing title="Help us put people back together." text="We're hiring a founding team, and we'd love to hear from you." />
    </div>
  );
}
