import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { industries, industriesIn } from "@/site/content/industries";
import { industryPage } from "@/site/content/industry-stories";
import { industryAudience } from "@/site/content/seo";
import { getLocale, getMessages } from "@/site/i18n/server";
import { IndustryPage } from "@/site/industries/industry-page";

/** Only the listed industries have pages; any other slug is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/industries/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const industry = industries.find((i) => i.slug === slug);
  const content = industryPage(slug);
  if (!industry || !content) return {};
  const [locale, { industryPages }] = await Promise.all([getLocale(), getMessages()]);
  const words = industryPages.fields[industry.slug as keyof typeof industryPages.fields];
  const audience = industryAudience[industry.slug] ?? industry.name.toLowerCase();
  return pageMetadata({
    title: words.seoTitle,
    description: words.seoDescription,
    path: `/industries/${industry.slug}`,
    keywords: [`AI for ${audience}`, `AI memory for ${audience}`, `ChatGPT for ${audience}`, ...content.highlights],
    locale,
    translated: true,
  });
}

export default async function Page({ params }: PageProps<"/[lang]/industries/[slug]">) {
  const { slug } = await params;
  const { catalog } = await getMessages();
  const industry = industriesIn(catalog).find((i) => i.slug === slug);
  const content = industryPage(slug);
  if (!industry || !content) notFound();
  return <IndustryPage industry={industry} content={content} />;
}
