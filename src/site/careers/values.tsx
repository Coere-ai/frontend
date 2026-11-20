import { Reveal } from "@/site/ui/reveal";

const values = [
  { title: "Own the problem", text: "Everyone here picks up a hard problem and carries it all the way to people using it." },
  { title: "Ship every week", text: "Small, finished pieces beat big plans. We show our work every week." },
  { title: "Respect people's data", text: "We build memory that belongs to the person. That shapes every decision we make." },
];

/** How the team works, in three short points on soft cards. */
export function Values() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {values.map((value, index) => (
        <Reveal key={value.title} delay={index * 0.06} className="rounded-[28px] bg-white p-7 shadow-[0_1px_2px_rgba(20,17,15,0.04),0_24px_48px_-36px_rgba(40,50,133,0.3)] ring-1 ring-neutral-200/70 dark:bg-white/[0.045] dark:shadow-none dark:ring-white/10">
          <h3 className="text-xl font-semibold tracking-[-0.025em] text-neutral-950 dark:text-white">{value.title}</h3>
          <p className="mt-3 text-[16px] leading-relaxed text-neutral-600 dark:text-white/70">{value.text}</p>
        </Reveal>
      ))}
    </div>
  );
}
