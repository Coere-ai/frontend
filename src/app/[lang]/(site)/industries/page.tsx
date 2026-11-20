import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CenterHero } from "@/site/blocks/center-hero";
import { industriesSeo } from "@/site/content/seo";
import { ClosingCta } from "@/site/home/closing-cta";
import { SECTION_Y, SOFT_FIELD } from "@/site/home/look";
import { ApplicationsGrid } from "@/site/industries/applications-grid";
import { IndustryGrid, PhotoCredits } from "@/site/industries/industry-grid";
import { Container } from "@/site/ui/container";
import { DarkPage } from "@/site/ui/page-theme";

export const metadata: Metadata = pageMetadata({ ...industriesSeo, path: "/industries" });

export default function IndustriesPage() {
  return (
    <DarkPage>
      <CenterHero plain title="Memory for every industry" line="Coere gives people, teams and apps a memory they control. Start with who it is for, then open your field." />
      <section className="pb-8">
        <Container>
          <div className={`${SOFT_FIELD} px-5 py-12 sm:px-8 md:px-12 md:py-16`}>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">Who it&apos;s for</h2>
            <div className="mt-8">
              <ApplicationsGrid />
            </div>
          </div>
        </Container>
      </section>
      <section className={SECTION_Y}>
        <Container>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">Industries</h2>
          <div className="mt-8">
            <IndustryGrid />
          </div>
          <PhotoCredits />
        </Container>
      </section>
      <ClosingCta title="Bring memory to your field." text="Tell us about your industry and what your people repeat to AI every day." />
    </DarkPage>
  );
}
