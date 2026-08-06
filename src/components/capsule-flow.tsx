import { AgentLogo } from "@/components/agent-logo";
import { LogoMark } from "@/components/logo";
import { Container, Reveal } from "@/components/ui";
import { capsuleSources, costs } from "@/lib/site";
import { formatDuration, formatTokens } from "@/lib/format";

const CAPSULE = [
  "Goal: ship the Chrome extension MVP",
  "Stack: Next.js, Supabase with RLS",
  "Limits: local retrieval, store nothing",
  "Next: the auto-run handler",
];

const SAVINGS = [
  {
    label: "Total tokens without Coere",
    value: formatTokens(costs.manualTokens),
    highlight: false,
  },
  {
    label: "Tokens used with Coere",
    value: formatTokens(costs.coereTokens),
    highlight: true,
  },
  {
    label: "Tokens saved",
    value: formatTokens(costs.manualTokens - costs.coereTokens),
    highlight: true,
  },
  {
    label: "Time saved",
    value: formatDuration(costs.manualSeconds - costs.coereSeconds),
    highlight: true,
  },
];

export function CapsuleFlow() {
  return (
    <section className="pb-20 sm:pb-24">
      <Container>
        <Reveal>
          <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-6">
              <div className="flex flex-col">
                <h3 className="pb-4 text-[13px] font-medium text-ink-900/55">
                  Four chats you already had
                </h3>
                <ul className="flex-1 space-y-2">
                  {capsuleSources.map((source) => (
                    <li
                      key={source.name}
                      className="flex items-center gap-3 rounded-xl border border-ink-900/8 bg-white px-3 py-2.5"
                    >
                      <AgentLogo
                        src={source.logo}
                        name={source.name}
                        size={18}
                        className="shrink-0"
                      />
                      <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink-900/70">
                        {source.title}
                      </span>
                      <span className="shrink-0 text-[11px] text-ink-900">
                        {source.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                aria-hidden
                className="flex items-center justify-center lg:self-center lg:px-2"
              >
                <LogoMark className="h-12 w-12 shrink-0 text-brand-500" />
              </div>

              <div className="flex flex-col">
                <h3 className="pb-4 text-[13px] font-medium text-brand-700">
                  One capsule for the new chat
                </h3>
                <div className="flex-1 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                  <span className="flex items-center gap-2 text-[11px] text-brand-700">
                    <LogoMark className="h-3 w-3 text-brand-500" />
                    Capsule from 4 chats
                  </span>
                  <ul className="mt-3 space-y-1.5">
                    {CAPSULE.map((line) => (
                      <li
                        key={line}
                        className="text-[12.5px] leading-relaxed text-ink-900/70"
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 border-t border-ink-900/8 pt-6 sm:grid-cols-4">
              {SAVINGS.map((item) => (
                <div key={item.label}>
                  <p className="text-[11px] text-ink-900/45">{item.label}</p>
                  <p
                    className={`mt-1 text-2xl font-semibold tracking-[-0.02em] tabular-nums ${
                      item.highlight ? "text-brand-600" : "text-ink-900"
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
