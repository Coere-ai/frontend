import type { Metadata } from "next";
import { ClosingCta } from "@/site/home/closing-cta";
import { FaqSection } from "@/site/resources/faq-section";
import { FilmLibrary } from "@/site/resources/film-library";
import { PrivacySection } from "@/site/resources/privacy-section";
import { Container } from "@/site/ui/container";
import { SectionHeading } from "@/site/ui/section-heading";

export const metadata: Metadata = {
  title: "Resources",
  description: "Films of every feature, where your data lives, and short answers about Coere.",
};

export default function ResourcesPage() {
  return (
    <>
      <section className="pt-20 pb-16 md:pt-28">
        <Container>
          <SectionHeading as="h1" eyebrow="Resources" title="See how Coere works" description="Every film is recorded from the real extension with made up chats." />
        </Container>
      </section>
      <section id="films" className="scroll-mt-24 pb-24">
        <Container>
          <FilmLibrary />
        </Container>
      </section>
      <section id="privacy" className="scroll-mt-24 border-t border-neutral-100 bg-neutral-50 py-24">
        <Container>
          <SectionHeading eyebrow="Privacy" title="Your memory stays yours" />
          <div className="mt-14">
            <PrivacySection />
          </div>
        </Container>
      </section>
      <section id="faq" className="scroll-mt-24 py-24">
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <SectionHeading eyebrow="Questions" title="Short answers" />
          <FaqSection />
        </Container>
      </section>
      <ClosingCta />
    </>
  );
}
