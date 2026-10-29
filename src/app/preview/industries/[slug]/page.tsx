import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { industries } from "@/site/content/industries";
import { industryPage } from "@/site/content/industry-stories";
import { IndustryPage } from "@/site/industries/industry-page";

/** Only the listed industries have pages; any other slug is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

function find(slug: string) {
  const industry = industries.find((i) => i.slug === slug);
  const content = industryPage(slug);
  return industry && content ? { industry, content } : null;
}

export async function generateMetadata({ params }: PageProps<"/preview/industries/[slug]">): Promise<Metadata> {
  const found = find((await params).slug);
  return found ? { title: found.industry.name, description: found.content.line } : {};
}

export default async function Page({ params }: PageProps<"/preview/industries/[slug]">) {
  const found = find((await params).slug);
  if (!found) notFound();
  return <IndustryPage industry={found.industry} content={found.content} />;
}
