import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { docPages } from "@/site/content/docs";
import { guides } from "@/site/content/guides";
import { industries } from "@/site/content/industries";
import { posts } from "@/site/content/posts";
import { PRIVACY_EFFECTIVE } from "@/site/content/privacy";
import { products } from "@/site/content/products";
import { localizePath, locales } from "@/site/i18n/locales";

/**
 * When each group of pages last changed in what it says. A date that moved
 * on every deploy would tell search engines nothing, so these move only
 * when the words do: change the date with the copy.
 */
const UPDATED = {
  site: "2026-11-03",
  docs: "2026-10-29",
  // The policy's own effective date, so the two cannot drift apart.
  privacy: PRIVACY_EFFECTIVE,
} as const;

/**
 * Every page the menus and footer link to, each at its canonical address.
 * The careers pages are hidden for now, so they are left out here and marked
 * noindex on the pages. So are the blog's placeholder posts.
 *
 * A page translated into every language is listed once per language, each
 * entry naming the others (hreflang), as the pages' own alternates do. A
 * page still in English lists its English address alone.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, lastModified: string = UPDATED.site, changeFrequency: "weekly" | "monthly" = "weekly") => ({
    url: `${siteConfig.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });
  const languages = (path: string) => ({
    languages: { ...Object.fromEntries(locales.map((l) => [l, `${siteConfig.url}${localizePath(path, l)}`])), "x-default": `${siteConfig.url}${path}` },
  });
  const translated = (path: string, priority: number, lastModified: string = UPDATED.site) =>
    locales.map((l) => ({ ...page(localizePath(path, l), priority, lastModified), alternates: languages(path) }));
  return [
    ...translated("/", 1),
    ...products.flatMap((p) => translated(`/products/${p.slug}`, 0.9)),
    ...translated("/pricing", 0.8),
    ...translated("/demo", 0.7),
    ...guides.map((g) => page(`/${g.slug}`, 0.8)),
    ...translated("/industries", 0.7),
    ...industries.flatMap((i) => translated(`/industries/${i.slug}`, 0.7)),
    page("/resources", 0.8, UPDATED.docs),
    ...docPages.filter((d) => d.slug !== "overview").map((d) => page(`/resources/${d.slug}`, 0.6, UPDATED.docs, "monthly")),
    page("/developers/waitlist", 0.7),
    ...translated("/about", 0.6).map((e) => ({ ...e, changeFrequency: "monthly" as const })),
    ...translated("/blog", 0.6, posts[0].date),
    ...posts.filter((p) => !p.placeholder).map((p) => page(`/blog/${p.slug}`, 0.5, p.date, "monthly")),
    page("/privacy", 0.3, UPDATED.privacy, "monthly"),
  ];
}
