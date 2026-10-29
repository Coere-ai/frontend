import type { Metadata } from "next";
import { RoleList } from "@/site/careers/role-list";
import { Values } from "@/site/careers/values";
import { Container } from "@/site/ui/container";
import { SectionHeading } from "@/site/ui/section-heading";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join Coere's founding team in engineering, business and marketing, or as an intern.",
};

export default function CareersPage() {
  return (
    <>
      <section className="pt-20 pb-20 md:pt-28">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Careers"
            title="Build the memory layer with us"
            description="We're a small founding team in Berkeley. Every role here shapes the product and the company."
          />
        </Container>
      </section>
      <section className="border-t border-neutral-100 bg-neutral-50 py-24">
        <Container>
          <p className="text-sm font-medium text-neutral-500">How we work</p>
          <div className="mt-8">
            <Values />
          </div>
        </Container>
      </section>
      <section id="roles" className="scroll-mt-24 py-24">
        <Container>
          <SectionHeading eyebrow="Open roles" title="Find your role" />
          <div className="mt-14">
            <RoleList />
          </div>
        </Container>
      </section>
    </>
  );
}
