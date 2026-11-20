import type { Metadata, Viewport } from "next";
import { KEYWORDS } from "@/lib/seo";
import { founders, siteConfig } from "@/lib/site";

/**
 * Site-wide metadata, shared by the two root layouts (the site under
 * app/[lang], and the admin panel and dashboard under app/(app)). The share
 * images come from the opengraph-image and twitter-image files in app/, and
 * the icons from favicon.ico, icon.svg, icon1.png and apple-icon.png. Each
 * page sets its own title, description, keywords, canonical link and
 * language alternates through pageMetadata (lib/seo).
 */
export const rootMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: KEYWORDS,
  applicationName: siteConfig.name,
  category: "technology",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  authors: founders.map((f) => ({ name: f.name })),
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  // Search Console and Bing Webmaster Tools tokens, when set in the deploy.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
};

export const rootViewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};
