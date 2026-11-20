import type { Metadata, Viewport } from "next";
import { siteConfig } from "./site";

/**
 * Coere's names and what it is, after each page's own phrases. Kept short
 * on purpose: Google ignores the keywords tag and Bing reads a long one as
 * stuffing. What a page ranks for comes from its title, headings and words,
 * so the phrases people search belong there (src/site/content/seo.ts).
 */
export const KEYWORDS = ["Coere", "Coere AI", "coere.ai", "portable AI memory", "AI memory layer"];

type PageSeo = {
  /** The page's own title; the layout adds "| Coere" unless `absolute` is set. */
  title: string;
  /** Under about 160 characters, so search results show all of it. */
  description: string;
  /** The page's address from the site root, as its canonical link. */
  path: string;
  /** Phrases this page answers best, before the shared ones. */
  keywords?: string[];
  /** The title as it is, with no "| Coere" after it. */
  absolute?: boolean;
};

/** What the site's share picture shows, for people who cannot see it. */
export const SHARE_ALT = "Coere: Accelerating Enterprise AI with Unified Context. The Coere mark among the AI logos on a pixel wall.";

/**
 * The share picture, drawn at build time by app/opengraph-image.tsx and
 * twitter-image.tsx. A page that sets its own share text replaces the
 * root's, picture and all, so every page names it again here.
 */
const SHARE_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, type: "image/png", alt: SHARE_ALT };

/** A page's title, description, keywords, canonical link and share text, all from one place. */
export function pageMetadata({ title, description, path, keywords = [], absolute = false }: PageSeo): Metadata {
  const full = absolute ? title : `${title} | ${siteConfig.name}`;
  return {
    title: absolute ? { absolute: title } : title,
    description,
    keywords: [...new Set([...keywords, ...KEYWORDS])],
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: siteConfig.name, url: path, title: full, description, images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title: full, description, images: [{ ...SHARE_IMAGE, url: "/twitter-image" }] },
  };
}

/** For pages kept on the site but hidden from its menus: reachable by link, never indexed. */
export const hiddenPage: Metadata = { robots: { index: false, follow: true } };

/**
 * The browser's colours for the site's pages, all in the dark page theme:
 * the near black for the address bar, and a dark canvas from the first
 * paint, before the stylesheet arrives, so no page flashes white.
 */
export const darkViewport: Viewport = { themeColor: "#0b0a12", colorScheme: "dark" };
