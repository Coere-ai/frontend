import Image from "next/image";
import { Container, Reveal, SectionHeading } from "@/components/ui";
import { founders } from "@/lib/site";

export function WhoWeAre() {
  return (
    <section id="who-we-are" className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          title="Who we are"
          description="Coere comes from the Latin cohaerere, to connect."
        />

        <div className="mx-auto mt-14 grid max-w-2xl gap-10 sm:grid-cols-2">
          {founders.map((founder, index) => (
            <Reveal key={founder.name} delay={index * 0.08}>
              <article className="flex flex-col items-center text-center">
                <span className="relative h-20 w-20 overflow-hidden rounded-full">
                  <Image
                    src={founder.photo}
                    alt={founder.name}
                    fill
                    // Larger than the box so the zoomed crop stays sharp.
                    sizes="200px"
                    className={`object-cover ${founder.photoClassName}`}
                  />
                </span>
                <h3 className="mt-4 text-[16px] font-semibold tracking-[-0.02em] text-ink-900">
                  {founder.name}
                </h3>
                <p className="mt-1 text-[13px] text-brand-600">
                  {founder.role}
                </p>
                <p className="mt-0.5 text-[12.5px] text-ink-900/45">
                  {founder.affiliation}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
