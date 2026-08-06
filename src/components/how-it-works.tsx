import { Container, Reveal, SectionHeading } from "@/components/ui";

const STEPS = [
  {
    title: "Click Coere",
    body: "It sits at the edge of any AI chat you already have open.",
  },
  {
    title: "Pick what travels",
    body: "Choose past conversations, or type your goal and let Coere choose.",
  },
  {
    title: "It lands and runs",
    body: "A small capsule plus your instruction, sent for you.",
  },
];

const SAVINGS = [
  {
    title: "Fewer tokens",
    body: "A capsule is a fraction of a pasted transcript. Every switch costs less, in every model.",
  },
  {
    title: "Less time",
    body: "No scrolling back through old chats to rebuild what you already worked out.",
  },
  {
    title: "Nothing lost",
    body: "Decisions and constraints travel with you, not just your last message.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="why"
      className="border-y border-ink-900/6 bg-ink-900/[0.015] py-20 sm:py-24"
    >
      <Container>
        <SectionHeading
          title="Stop typing, start doing"
          description="Coere is a unified memory layer for AI. Instead of re-explaining your project to a fresh chat, you send a compact capsule of what actually matters."
        />

        <div className="mx-auto mt-14 grid max-w-5xl gap-10 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.07}>
              <article className="text-center">
                <span className="text-[13px] font-medium text-brand-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.02em] text-ink-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-900/60">
                  {step.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-5xl border-t border-ink-900/8 pt-12">
          <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
            {SAVINGS.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.07}>
                <div className="text-center">
                  <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-900/60">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
