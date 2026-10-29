import { Reveal } from "@/site/ui/reveal";

const values = [
  { title: "Own the problem", text: "Everyone here picks up a hard problem and carries it all the way to people using it." },
  { title: "Ship every week", text: "Small, finished pieces beat big plans. We show our work every week." },
  { title: "Respect people's data", text: "We build memory that belongs to the person. That shapes every decision we make." },
];

/** How the team works, in three short points under thin rules. */
export function Values() {
  return (
    <div className="grid gap-10 md:grid-cols-3 md:gap-12">
      {values.map((value, index) => (
        <Reveal key={value.title} delay={index * 0.06} className="border-t border-neutral-950 pt-6">
          <h3 className="text-xl font-medium tracking-[-0.02em] text-neutral-950">{value.title}</h3>
          <p className="mt-3 text-[16px] leading-relaxed text-neutral-500">{value.text}</p>
        </Reveal>
      ))}
    </div>
  );
}
