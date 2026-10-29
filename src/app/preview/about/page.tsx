import type { Metadata } from "next";
import { StorySection } from "@/site/about/story-section";
import { TeamSection } from "@/site/about/team-section";
import { ClosingCta } from "@/site/home/closing-cta";
import { Container } from "@/site/ui/container";
import { SectionHeading } from "@/site/ui/section-heading";

export const metadata: Metadata = {
  title: "About Us",
  description: "Why Coere exists, and the people building it.",
};

export default function AboutPage() {
  return (
    <>
      <section className="pt-20 pb-24 md:pt-28">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="About Us"
            title="We're building the memory layer people own"
            description="Coere started when Michelle kept explaining the same project to every AI she switched to. Each one knew a piece of her, and none of them knew the rest."
          />
        </Container>
      </section>
      <StorySection />
      <TeamSection />
      <ClosingCta title="Help us put people back together." text="We're hiring a founding team, and we'd love to hear from you." />
    </>
  );
}
