import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { industries } from "@/site/content/industries";
import { industryPage } from "@/site/content/industry-stories";
import { industryAudience } from "@/site/content/seo";
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

export async function generateMetadata({ params }: PageProps<"/industries/[slug]">): Promise<Metadata> {
  const found = find((await params).slug);
  if (!found) return {};
  const { industry, content } = found;
  const audience = industryAudience[industry.slug] ?? industry.name.toLowerCase();
  return pageMetadata({
    title: `Coere for ${industry.name.toLowerCase()}: AI memory for ${audience}`,
    description: `${content.line} One AI memory for ${audience}, across ChatGPT, Claude and Gemini.`,
    path: `/industries/${industry.slug}`,
    keywords: [`AI for ${audience}`, `AI memory for ${audience}`, `ChatGPT for ${audience}`, ...content.highlights],
  });
}

export default async function Page({ params }: PageProps<"/industries/[slug]">) {
  const found = find((await params).slug);
  if (!found) notFound();
  return <IndustryPage industry={found.industry} content={found.content} />;
}
