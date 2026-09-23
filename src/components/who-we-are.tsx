import { TeamProfile } from "@/components/team-profile";
import { Container, Reveal, SectionHeading } from "@/components/ui";
import { executives, founders, type TeamMember } from "@/lib/site";

/** A titled panel of people, one row each, split by hairlines. */
function TeamGroup({
  title,
  members,
}: {
  title: string;
  members: readonly TeamMember[];
}) {
  return (
    <div className="mx-auto mt-12 max-w-4xl">
      <Reveal className="mb-4 px-1">
        <h3 className="text-lg font-semibold tracking-[-0.02em] text-ink-900">
          {title}
        </h3>
      </Reveal>

      <div className="divide-y divide-ink-900/6 overflow-hidden rounded-3xl border border-ink-900/8 bg-white">
        {members.map((member, index) => (
          <Reveal key={member.name} delay={index * 0.08}>
            <TeamProfile member={member} />
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

        <TeamGroup title="Founders" members={founders} />
        <TeamGroup title="Executive team" members={executives} />
      </Container>
    </section>
  );
}
