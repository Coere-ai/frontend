import type { Metadata } from "next";
import { ClosingCta } from "@/site/home/closing-cta";
import { ApplicationsGrid } from "@/site/industries/applications-grid";
import { IndustryGrid, PhotoCredits } from "@/site/industries/industry-grid";
import { Container } from "@/site/ui/container";
import { SectionHeading } from "@/site/ui/section-heading";

export const metadata: Metadata = {
  title: "Industries",
  description: "How a memory you own works for people, teams and apps in every industry.",
};

export default function IndustriesPage() {
  return (
    <>
      <section className="pt-20 pb-20 md:pt-28">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Industries"
            title="Memory for every industry"
            description="Coere gives people, teams and apps a memory they control. Start with who it is for, then open your field."
          />
        </Container>
      </section>
      <section className="border-t border-neutral-100 bg-neutral-50 py-24">
        <Container>
          <p className="text-sm font-medium text-neutral-500">Who it&apos;s for</p>
          <div className="mt-6">
            <ApplicationsGrid />
          </div>
        </Container>
      </section>
      <section className="py-24">
        <Container>
          <p className="text-sm font-medium text-neutral-500">Industries</p>
          <div className="mt-6">
            <IndustryGrid />
          </div>
          <PhotoCredits />
        </Container>
      </section>
      <ClosingCta title="Bring memory to your field." text="Tell us about your industry and what your people repeat to AI every day." />
    </>
  );
}
