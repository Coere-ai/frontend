import { TeamCard } from "@/components/team-card";
import { Container, Reveal, SectionHeading } from "@/components/ui";
import { executives, founders, type TeamMember } from "@/lib/site";

function TeamGroup({
  title,
  description,
  members,
}: {
  title: string;
  description: string;
  members: readonly TeamMember[];
}) {
  return (
    <div className="mx-auto mt-14 max-w-5xl">
      <Reveal className="text-center">
        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-ink-900">
          {title}
        </h3>
        <p className="mt-2 text-[15px] text-ink-900/55">{description}</p>
      </Reveal>

      {/* A lone card takes one column's width, so it sits centered under the pair above. */}
      <div className="mt-8 flex flex-wrap justify-center gap-5 md:gap-6">
        {members.map((member, index) => (
          <Reveal
            key={member.name}
            delay={index * 0.08}
            className="w-full md:w-[calc(50%-0.75rem)]"
          >
            <TeamCard member={member} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export function WhoWeAre() {
  return (
    <section id="who-we-are" className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          title="Who we are"
          description="Coere comes from the Latin cohaerere, to connect."
        />

        <TeamGroup
          title="Founders"
          description="Building the product and the codebase together."
          members={founders}
        />

        <TeamGroup
          title="Executive team"
          description="Leading go-to-market and adoption."
          members={executives}
        />
      </Container>
    </section>
  );
}
