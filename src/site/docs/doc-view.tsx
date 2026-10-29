import Link from "next/link";
import { docPages, type DocPage } from "@/site/content/docs";
import { Container } from "@/site/ui/container";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { DocsSidebar } from "./docs-sidebar";
import { renderDoc } from "./render";
import "@/site/code/code.css";
import "./docs.css";
import { Underlined } from "@/site/ui/underlined";

const hrefOf = (slug: string) => (slug === "overview" ? "/resources" : `/resources/${slug}`);

/**
 * A docs page: the pages on the left, the page in the middle, and its
 * headings on the right on wide screens. The Markdown is ours, built from
 * the coere-v2 source, so it is drawn as HTML as is.
 */
export function DocView({ page }: { page: DocPage }) {
  const { html, toc } = renderDoc(page.slug);
  const index = docPages.findIndex((p) => p.slug === page.slug);
  const next = docPages[index + 1];
  return (
    <Container className="grid gap-12 pt-14 pb-28 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)_220px] xl:gap-16">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <DocsSidebar />
      </aside>
      <article className="min-w-0 max-w-3xl">
        <p className="text-[13px] font-medium text-brand-500">Coere API</p>
        <h1 className="mt-2 text-4xl font-medium tracking-[-0.04em] text-neutral-950 md:text-5xl">{page.title}</h1>
        <p className="mt-4 text-lg text-neutral-600">{page.summary}</p>
        <div className="docs-prose mt-10" dangerouslySetInnerHTML={{ __html: html }} />
        {next ? (
          <Link href={hrefOf(next.slug)} className="group mt-16 flex items-center justify-between rounded-2xl border border-neutral-200 p-6">
            <span>
              <span className="block text-[13px] text-neutral-500">Next</span>
              <span className="mt-1 block text-lg font-medium text-neutral-950">
                <Underlined big>{next.title}</Underlined>
              </span>
            </span>
            <ArrowRightIcon size={20} className="text-neutral-950" />
          </Link>
        ) : null}
      </article>
      {toc.length > 1 ? (
        <aside className="hidden xl:sticky xl:top-28 xl:block xl:max-h-[calc(100svh-8rem)] xl:self-start xl:overflow-y-auto">
          <p className="text-[13px] font-medium text-neutral-500">On this page</p>
          <ul className="mt-4 space-y-2">
            {toc.map((entry) => (
              <li key={entry.id} className={entry.depth === 3 ? "pl-3" : ""}>
                <a href={`#${entry.id}`} className="block text-[13px] leading-snug text-neutral-600 hover:text-neutral-950">
                  {entry.text}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </Container>
  );
}
