import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { docPage, docPages } from "@/site/content/docs";
import { DocView } from "@/site/docs/doc-view";

/** Only the listed docs pages exist. The introduction lives at /resources itself. */
export const dynamicParams = false;

export function generateStaticParams() {
  return docPages.filter((page) => page.slug !== "overview").map((page) => ({ page: page.slug }));
}

export async function generateMetadata({ params }: PageProps<"/preview/resources/[page]">): Promise<Metadata> {
  const page = docPage((await params).page);
  return page ? { title: `${page.title} | Docs`, description: page.summary } : {};
}

export default async function Page({ params }: PageProps<"/preview/resources/[page]">) {
  const page = docPage((await params).page);
  if (!page || page.slug === "overview") notFound();
  return <DocView page={page} />;
}
