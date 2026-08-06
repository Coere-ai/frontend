import { Container, Reveal, SectionHeading } from "@/components/ui";

/**
 * Spend figures come from CloudZero's State of AI Costs 2025 (enterprise average
 * of $85,521/month, up 36% year over year), PNC card data reported May 2026
 * (average AI subscriber spends about $31/month), and Anthropic's published
 * Claude Code range of $150 to $250 per developer per month. The Coere numbers
 * are estimates derived from the token and time comparison further up the page.
 */
const CARDS = [
  {
    audience: "For you",
    stats: [
      {
        label: "You spend today",
        value: "$372",
        unit: "per year",
        note: "The average AI subscriber pays around $31 a month.",
      },
      {
        label: "Coere gives back",
        value: "34 hours",
        unit: "per year",
        note: "Ten model switches a week, none of them retyped.",
        highlight: true,
      },
    ],
    line: "One subscription goes further when you stop paying to send the same context again.",
  },
  {
    audience: "For tech teams",
    stats: [
      {
        label: "A company spends today",
        value: "$85,521",
        unit: "per month",
        note: "Average enterprise spend on AI apps in 2025, up 36% in a year.",
      },
      {
        label: "Coere could save",
        value: "$205,000",
        unit: "per year",
        note: "If a fifth of that spend is context the team already sent.",
        highlight: true,
      },
    ],
    line: "Coding agents alone run $150 to $250 per developer each month. Repeated context is the cheapest line item to cut.",
  },
];

export function Costs() {
  return (
    <section id="costs" className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          title="Why teams and people use Coere"
          description="AI spend keeps climbing, and a large share of it is context being sent again and again."
        />

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-2">
          {CARDS.map((card, index) => (
            <Reveal key={card.audience} delay={index * 0.08}>
              <article className="flex h-full flex-col rounded-2xl border border-ink-900/8 bg-white p-7">
                <h3 className="text-[13px] font-medium text-ink-900/55">
                  {card.audience}
                </h3>

                <dl className="mt-6 grid gap-7 sm:grid-cols-2">
                  {card.stats.map((stat) => (
                    <div key={stat.value}>
                      <dt
                        className={`text-[11.5px] font-medium ${
                          stat.highlight ? "text-brand-600" : "text-ink-900/45"
                        }`}
                      >
                        {stat.label}
                      </dt>
                      <dd>
                        <p className="mt-1.5 flex items-baseline gap-1.5">
                          <span
                            className={`text-[1.75rem] font-semibold tracking-[-0.03em] tabular-nums ${
                              stat.highlight ? "text-brand-600" : "text-ink-900"
                            }`}
                          >
                            {stat.value}
                          </span>
                          <span className="text-[12px] text-ink-900/45">
                            {stat.unit}
                          </span>
                        </p>
                        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-900/55">
                          {stat.note}
                        </p>
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-auto pt-7 text-[13.5px] leading-relaxed text-ink-900/65">
                  {card.line}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
