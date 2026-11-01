import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { docPage, docPages } from "@/site/content/docs";
import { DocView } from "@/site/docs/doc-view";

/** Only the listed docs pages exist. The introduction lives at /resources itself. */
export const dynamicParams = false;

export function generateStaticParams() {
  return docPages.filter((page) => page.slug !== "overview").map((page) => ({ page: page.slug }));
}

export async function generateMetadata({ params }: PageProps<"/resources/[page]">): Promise<Metadata> {
  const page = docPage((await params).page);
  return page
    ? pageMetadata({
        title: `${page.title}: Coere memory API docs`,
        description: `${page.summary} From the Coere developer docs for the memory API, MCP server and SDKs.`,
        path: `/resources/${page.slug}`,
        keywords: [`Coere ${page.title}`, "memory API", "MCP server", "AI memory SDK"],
      })
    : {};
}

export default async function Page({ params }: PageProps<"/resources/[page]">) {
  const page = docPage((await params).page);
  if (!page || page.slug === "overview") notFound();
  return <DocView page={page} />;
}
