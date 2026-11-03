import type { Metadata } from "next";
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

/**
 * The share picture (app/opengraph-image.png and twitter-image.png). A page
 * that sets its own share text replaces the root's, picture and all, so
 * every page names it again here.
 */
const SHARE_IMAGE = { url: "/opengraph-image.png", width: 1200, height: 630, alt: "Coere: the memory layer you own, across every AI" };

/** A page's title, description, keywords, canonical link and share text, all from one place. */
export function pageMetadata({ title, description, path, keywords = [], absolute = false }: PageSeo): Metadata {
  const full = absolute ? title : `${title} | ${siteConfig.name}`;
  return {
    title: absolute ? { absolute: title } : title,
    description,
    keywords: [...new Set([...keywords, ...KEYWORDS])],
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: siteConfig.name, url: path, title: full, description, images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title: full, description, images: [{ ...SHARE_IMAGE, url: "/twitter-image.png" }] },
  };
}

/** For pages kept on the site but hidden from its menus: reachable by link, never indexed. */
export const hiddenPage: Metadata = { robots: { index: false, follow: true } };
