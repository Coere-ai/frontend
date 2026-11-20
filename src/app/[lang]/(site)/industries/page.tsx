import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CenterHero } from "@/site/blocks/center-hero";
import { industriesSeo } from "@/site/content/seo";
import { ClosingCta } from "@/site/home/closing-cta";
import { SECTION_Y, SOFT_FIELD } from "@/site/home/look";
import { getLocale, getMessages } from "@/site/i18n/server";
import { ApplicationsGrid } from "@/site/industries/applications-grid";
import { IndustryGrid, PhotoCredits } from "@/site/industries/industry-grid";
import { Container } from "@/site/ui/container";
import { DarkPage } from "@/site/ui/page-theme";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, { industryPages }] = await Promise.all([getLocale(), getMessages()]);
  return pageMetadata({ ...industriesSeo, ...industryPages.index.seo, path: "/industries", locale, translated: true });
}

export default async function IndustriesPage() {
  const t = (await getMessages()).industryPages.index;
  return (
    <DarkPage>
      <CenterHero plain title={t.title} line={t.line} />
      <section className="pb-8">
        <Container>
          <div className={`${SOFT_FIELD} px-5 py-12 sm:px-8 md:px-12 md:py-16`}>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">{t.whoFor}</h2>
            <div className="mt-8">
              <ApplicationsGrid />
            </div>
          </div>
        </Container>
      </section>
      <section className={SECTION_Y}>
        <Container>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">{t.industries}</h2>
          <div className="mt-8">
            <IndustryGrid />
          </div>
          <PhotoCredits />
        </Container>
      </section>
      <ClosingCta title={t.closing.title} text={t.closing.text} />
    </DarkPage>
  );
}
