import Link from "next/link";
import { backgrounds } from "@/site/content/backgrounds";
import { docPages } from "@/site/content/docs";
import { CodeWindow } from "@/site/code/code-window";
import { Underlined } from "@/site/ui/underlined";
import { SizedPhoto } from "@/site/ui/sized-photo";
import { PanelLabel, PanelLink } from "./panel-parts";

const shown = ["overview", "authentication", "endpoints", "sdks", "mcp"];

/** The quickstart's first call, as overview.md's First calls shows it. */
const firstCall = `from coere import coere

ctx = coere.context.for_draft(
    "dinner with my climbing friends friday",
    chat="chat-1",
)
print(ctx.block, end="")`;

/**
 * Resources menu: five docs pages and All docs in an even grid, and the
 * quickstart as an article card: a cover with the code on artwork, then
 * its title and what it covers.
 */
export function ResourcesPanel() {
  const pages = docPages.filter((page) => shown.includes(page.slug));
  return (
    <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-12">
      <div>
        <PanelLabel>Developer docs</PanelLabel>
        <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1">
          {pages.map((page) => (
            <li key={page.slug}>
              <PanelLink href={page.slug === "overview" ? "/resources" : `/resources/${page.slug}`} title={page.title} summary={page.summary} />
            </li>
          ))}
          <li>
            <PanelLink href="/resources" title="All docs" summary="Conventions, schemas, limits, errors and examples too." />
          </li>
        </ul>
      </div>

      <Link href="/resources#quickstart" className="group grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-center gap-6 rounded-2xl bg-neutral-50 p-4">
        <div className="relative isolate overflow-hidden rounded-xl p-4">
          <SizedPhoto src={backgrounds.waves.src} alt="" fill sizes="400px" className="-z-10 object-cover" />
          <CodeWindow file="context.py" code={firstCall} language="python" />
        </div>
        <div>
          <p className="text-[13px] font-medium text-neutral-500">Quickstart</p>
          <p className="mt-1 text-xl leading-snug font-medium tracking-[-0.02em] text-neutral-950"><Underlined big>From a server to your first context</Underlined></p>
          <p className="mt-2 text-[14px] leading-snug text-neutral-500">Run coere-server, make a token, and ask for the context of a draft in Python, TypeScript or curl.</p>
        </div>
      </Link>
    </div>
  );
}
