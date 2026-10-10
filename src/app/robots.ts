import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * Everything may be crawled. The unlisted /demo page keeps itself out of the
 * index with its own noindex, which crawlers can only see if they may fetch it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
