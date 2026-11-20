import type { Metadata } from "next";
import { hiddenPage } from "@/lib/seo";
import { JobBoard } from "@/site/careers/job-board";
import { Values } from "@/site/careers/values";
import { teams, type Team } from "@/site/content/roles";
import { Container } from "@/site/ui/container";
import { SoftHero } from "@/site/ui/soft-hero";

const description = "Join Coere's founding team in San Francisco, in engineering, business and marketing, or as an intern.";

export const metadata: Metadata = {
  title: "Careers",
  description,
  // Hidden from the menus for now, so kept out of search too.
  ...hiddenPage,
};

/** The job board comes first. A ?team= from the Careers menu starts it on that team. */
export default async function CareersPage({ searchParams }: PageProps<"/careers">) {
  const asked = (await searchParams).team;
  const team = teams.find((t) => t === asked) as Team | undefined;
  return (
    <>
      <SoftHero title="Build the memory layer with us" description={description}>
        <div className="mt-12 md:mt-16">
          <JobBoard key={team ?? "all"} team={team} />
        </div>
      </SoftHero>
      <section className="py-24">
        <Container>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 md:text-3xl">How we work</h2>
          <div className="mt-8">
            <Values />
          </div>
        </Container>
      </section>
    </>
  );
}
