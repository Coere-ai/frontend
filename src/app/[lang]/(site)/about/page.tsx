import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { aboutSeo } from "@/site/content/seo";
import { AboutClosing } from "@/site/about/about-closing";
import { AboutHero } from "@/site/about/about-hero";
import { StoryDiagram } from "@/site/about/story-diagram";
import { TeamSection } from "@/site/about/team-section";
import { getLocale, getMessages } from "@/site/i18n/server";
import { UNDER_NAV } from "@/site/nav/nav-space";
import { DarkPage } from "@/site/ui/page-theme";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, { about }] = await Promise.all([getLocale(), getMessages()]);
  return pageMetadata({ ...aboutSeo, ...about.seo, path: "/about", locale, translated: true });
}

/**
 * The About page, dark from the top down to the footer: flat near black,
 * with ASCII Tiles behind the hero only. The whole page is in the dark
 * theme, so the glass navbar and the footer stay dark with it.
 */
export default async function AboutPage() {
  const { about } = await getMessages();
  return (
    <DarkPage className={UNDER_NAV}>
      <AboutHero title={about.title} line={about.line} story={about.story} />
      <StoryDiagram words={about.diagram} />
      <TeamSection />
      <AboutClosing title={about.closing.title} text={about.closing.text} />
    </DarkPage>
  );
}
