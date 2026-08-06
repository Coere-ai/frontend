import { AgentLogo } from "@/components/agent-logo";
import { BrowserWindow, type BrowserTab } from "@/components/browser-window";
import { LogoMark } from "@/components/logo";
import { Container, Reveal, SectionHeading } from "@/components/ui";
import { capsuleSources, costs } from "@/lib/site";
import { formatDuration, formatTokens } from "@/lib/format";

const CHATGPT: BrowserTab = {
  name: "ChatGPT",
  logo: "/openai.svg",
  url: "chatgpt.com/c/coere-build",
  surface: "bg-white",
};

const CLAUDE: BrowserTab = {
  name: "Claude",
  logo: "/claude-color.svg",
  url: "claude.ai/new",
  surface: "bg-[#faf9f5]",
};

const TABS = [CHATGPT, CLAUDE] as const;

const PASTED = `Here is everything again. The project is Coere, a Chrome extension for unified AI memory. Front end is Next.js on Vercel, auth and storage are Supabase with RLS enabled, retrieval uses in-browser embeddings so nothing leaves the machine. We already ruled out a server side index, and the picker is a sidebar rather than a modal. The destination model does the compression as part of the request. Attached are the notes and the schema. Constraints: store as little as possible, the whole handoff has to finish in under five seconds, and every agent keeps its own interface…`;

const ATTACHMENTS = [
  { name: "project-notes.pdf", kind: "PDF" },
  { name: "schema-dump.txt", kind: "TXT" },
];

const CAPSULE = [
  "Chrome extension, Next.js and Supabase with RLS",
  "Embeddings run in the browser, nothing stored",
  "Sidebar picker, destination model compresses",
  "Next: the auto-run handler",
];

export function Comparison() {
  return (
    <section id="how-it-works" className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          title="You switch models, your context stays behind"
          description="Same work, same two tabs. One way you paste your project in again. The other way Coere hands the next model a capsule."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-10">
          <Reveal>
            <Side
              label="Without Coere"
              tokens={costs.manualTokens}
              seconds={costs.manualSeconds}
            >
              <BrowserWindow tabs={TABS} activeIndex={1}>
                <div className="flex min-h-[19rem] flex-col lg:h-[19rem]">
                  <div className="flex flex-1 flex-col justify-end overflow-hidden">
                    <div className="flex flex-wrap gap-2 pb-2.5">
                      {ATTACHMENTS.map((file) => (
                        <span
                          key={file.name}
                          className="flex items-center gap-2 rounded-lg border border-ink-900/10 bg-white px-2.5 py-1.5"
                        >
                          <span className="rounded bg-ink-900/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-ink-900/50">
                            {file.kind}
                          </span>
                          <span className="text-[11px] text-ink-900/60">
                            {file.name}
                          </span>
                        </span>
                      ))}
                    </div>

                    {/* the wall of pasted context, fading out to imply more */}
                    <div className="[mask-image:linear-gradient(to_bottom,transparent,black_22%)]">
                      <p className="rounded-2xl rounded-br-md bg-ink-900/[0.05] px-3.5 py-3 text-[11px] leading-relaxed text-ink-900/55">
                        {PASTED}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3">
                    <Composer placeholder="Reply to Claude" />
                  </div>
                </div>
              </BrowserWindow>
            </Side>
          </Reveal>

          <Reveal delay={0.08}>
            <Side
              label="With Coere"
              tokens={costs.coereTokens}
              seconds={costs.coereSeconds}
              highlight
            >
              <BrowserWindow tabs={TABS} activeIndex={1}>
                <div className="flex min-h-[19rem] flex-col lg:h-[19rem]">
                  <div className="flex flex-1 flex-col justify-end gap-3 overflow-hidden">
                    <div className="flex justify-end">
                      <div className="max-w-[92%] rounded-2xl rounded-br-md border border-brand-200 bg-brand-50/70 px-3.5 py-3">
                        <span className="flex items-center gap-2 text-[10.5px] text-brand-700">
                          <LogoMark className="h-3 w-3 text-brand-500" />
                          Capsule from 4 chats
                        </span>

                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {capsuleSources.map((source) => (
                            <li
                              key={source.name}
                              className="flex items-center gap-1.5 rounded-md bg-white/80 px-1.5 py-1"
                            >
                              <AgentLogo
                                src={source.logo}
                                name={source.name}
                                size={12}
                              />
                              <span className="text-[9.5px] text-ink-900/55">
                                {source.name}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <ul className="mt-2.5 space-y-1">
                          {CAPSULE.map((line) => (
                            <li
                              key={line}
                              className="text-[11.5px] leading-relaxed text-ink-900/70"
                            >
                              {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {["94%", "82%", "58%"].map((width) => (
                        <span
                          key={width}
                          className="block h-1.5 rounded-full bg-ink-900/[0.07]"
                          style={{ width }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-3">
                    <Composer placeholder="Ask anything" />
                  </div>
                </div>
              </BrowserWindow>
            </Side>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function Side({
  label,
  tokens,
  seconds,
  highlight,
  children,
}: {
  label: string;
  tokens: number;
  seconds: number;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 pb-4">
        <h3
          className={`text-sm font-medium ${
            highlight ? "text-brand-700" : "text-ink-900/70"
          }`}
        >
          {label}
        </h3>
        <div className="flex gap-8">
          <Stat
            label="Tokens used"
            value={formatTokens(tokens)}
            highlight={highlight}
          />
          <Stat
            label="Time used"
            value={formatDuration(seconds)}
            highlight={highlight}
          />
        </div>
      </div>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-right">
      <p className="text-[10.5px] text-ink-900/45">{label}</p>
      <p
        className={`mt-0.5 text-xl font-semibold tracking-[-0.02em] tabular-nums ${
          highlight ? "text-brand-600" : "text-ink-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Composer({ placeholder }: { placeholder: string }) {
  return (
    <div className="rounded-xl border border-ink-900/10 bg-white px-3.5 py-2.5">
      <p className="min-h-[2.5rem] text-[12px] leading-relaxed text-ink-900/25">
        {placeholder}
      </p>
    </div>
  );
}
