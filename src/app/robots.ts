import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/** Everything may be crawled; there is only the one page. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
