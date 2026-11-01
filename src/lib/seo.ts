import type { Metadata } from "next";
import { siteConfig } from "./site";

/**
 * What people search to find Coere: its names, what it is, the AIs it works
 * across, and what each product does. Every page carries these in its
 * keywords, ahead of its own.
 */
export const KEYWORDS = [
  "Coere",
  "Coere AI",
  "coere.ai",
  "AI memory",
  "memory layer for AI",
  "AI memory layer",
  "own your AI memory",
  "portable AI memory",
  "memory across every AI",
  "cross AI memory",
  "persistent memory for AI",
  "long term memory for LLMs",
  "ChatGPT memory",
  "Claude memory",
  "Gemini memory",
  "AI context",
  "context engineering",
  "smart context",
  "knowledge graph",
  "personal knowledge graph",
  "AI chat history",
  "save ChatGPT chats",
  "AI memory Chrome extension",
  "team AI memory",
  "company knowledge base",
  "memory API",
  "MCP server",
  "Model Context Protocol",
  "AI agents",
  "Coere Connect",
  "Coere Solutions",
  "Coere Forge",
  "Coere Agents",
  "Cori",
];

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
