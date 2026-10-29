import { executives, founders, type TeamMember } from "@/lib/site";
import { Container } from "@/site/ui/container";
import { Reveal } from "@/site/ui/reveal";
import { SectionHeading } from "@/site/ui/section-heading";
import { TeamCard } from "./team-card";

function Group({ title, members }: { title: string; members: readonly TeamMember[] }) {
  return (
    <div className="mt-14">
      <p className="text-sm font-medium text-neutral-500">{title}</p>
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        {members.map((member, index) => (
          <Reveal key={member.name} delay={index * 0.06}>
            <TeamCard member={member} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/** The people behind Coere, from the same data the current site uses. */
export function TeamSection() {
  return (
    <section id="team" className="scroll-mt-24 border-t border-neutral-100 py-28">
      <Container>
        <SectionHeading eyebrow="Our team" title="The people building Coere" description="Coere comes from the Latin cohaerere, to connect." />
        <Group title="Founders" members={founders} />
        <Group title="Executive team" members={executives} />
      </Container>
    </section>
  );
}
