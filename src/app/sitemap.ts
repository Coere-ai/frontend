import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      // The canonical home page.
      url: `${siteConfig.url}/`,
      // Each deploy is when the page last changed.
      lastModified: new Date(),
    },
  ];
}
