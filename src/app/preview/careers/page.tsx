import type { Metadata } from "next";
import { JobBoard } from "@/site/careers/job-board";
import { Values } from "@/site/careers/values";
import { teams, type Team } from "@/site/content/roles";
import { Container } from "@/site/ui/container";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join Coere's founding team in San Francisco, in engineering, business and marketing, or as an intern.",
};

/** The job board comes first. A ?team= from the Careers menu starts it on that team. */
export default async function CareersPage({ searchParams }: PageProps<"/preview/careers">) {
  const asked = (await searchParams).team;
  const team = teams.find((t) => t === asked) as Team | undefined;
  return (
    <>
      <section className="pt-16 pb-24 md:pt-24">
        <Container>
          <p className="text-sm font-medium text-neutral-500">Careers</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-[3.25rem] md:leading-[1.05]">
            Build the memory layer with us
          </h1>
          <div className="mt-12">
            <JobBoard key={team ?? "all"} team={team} />
          </div>
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
    </>
  );
}
