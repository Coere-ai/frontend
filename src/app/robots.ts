import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * Everything may be crawled but the live demos' own pages, which only make
 * sense inside the site's frames, the private /statistics dashboard, and the
 * API, which has nothing to read. Pages hidden from the menus say noindex
 * themselves, so crawlers must still be let in to read that.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/preview/live/", "/statistics", "/api/"] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
