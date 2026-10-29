import Link from "next/link";
import { contextSamples } from "@/site/content/code/context-api";
import { docPages } from "@/site/content/docs";
import { hoverUnderline } from "@/site/ui/hover-underline";
import { PanelLabel, PanelLink, PanelMore } from "./panel-parts";

const shown = ["overview", "authentication", "endpoints", "sdks", "mcp", "examples"];
const python = contextSamples.find((sample) => sample.label === "Python");

/** Resources menu: the docs pages, and a card with the first call that opens the quickstart. */
export function ResourcesPanel() {
  const pages = docPages.filter((page) => shown.includes(page.slug));
  return (
    <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-12">
      <div>
        <div className="flex items-baseline justify-between">
          <PanelLabel>Developer docs</PanelLabel>
          <PanelMore href="/resources">All docs</PanelMore>
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1">
          {pages.map((page) => (
            <li key={page.slug}>
              <PanelLink href={page.slug === "overview" ? "/resources" : `/resources/${page.slug}`} title={page.title} summary={page.summary} />
            </li>
          ))}
        </ul>
      </div>

      <Link href="/resources#quickstart" className="group flex flex-col justify-between rounded-2xl bg-[#0b1020] p-6 text-white">
        <pre className="overflow-hidden font-mono text-[12px] leading-relaxed text-white/80">
          <code>{python?.code}</code>
        </pre>
        <div className="mt-6">
          <p className="text-[13px] text-white/60">Quickstart</p>
          <p className={`mt-1 text-lg font-medium tracking-[-0.02em] decoration-white ${hoverUnderline}`}>From a server to your first context</p>
        </div>
      </Link>
    </div>
  );
}
