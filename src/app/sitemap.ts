import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { docPages } from "@/site/content/docs";
import { industries } from "@/site/content/industries";
import { products } from "@/site/content/products";

/**
 * Every page the menus link to. The blog and careers pages are hidden for
 * now, so they are left out here and marked noindex on the pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Each deploy is when the pages last changed.
  const lastModified = new Date();
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" = "weekly") => ({
    url: `${siteConfig.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1),
    ...products.map((p) => page(`/products/${p.slug}`, 0.9)),
    page("/industries", 0.7),
    ...industries.map((i) => page(`/industries/${i.slug}`, 0.7)),
    page("/resources", 0.8),
    ...docPages.filter((d) => d.slug !== "overview").map((d) => page(`/resources/${d.slug}`, 0.6, "monthly")),
    page("/about", 0.6, "monthly"),
  ];
}
