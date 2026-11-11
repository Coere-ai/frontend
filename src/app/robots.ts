import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * Kept out for every crawler: the live demos' own pages, which only make
 * sense inside the site's frames, the admin panel (and its old /statistics address), the API routes
 * and the account pages. Pages hidden from the menus say noindex
 * themselves, so crawlers must still be let in to read that.
 */
const PRIVATE = ["/preview/live/", "/admin", "/statistics", "/api/", "/sign-in", "/sign-up", "/connect", "/account", "/dashboard", "/welcome"];

/**
 * Crawlers named one by one. A crawler with a group of its own reads only
 * that group and skips "*", so each group repeats PRIVATE.
 *
 * Every one of them is welcome on the public pages, for two reasons that
 * are worth keeping apart:
 *
 * - Search and answer crawlers put Coere in results and cite it. Googlebot
 *   and Bingbot (Bing's index also answers in Microsoft Copilot),
 *   OAI-SearchBot (ChatGPT Search), PerplexityBot (Perplexity), Claude-SearchBot
 *   (Claude's search), and the fetchers that act for one person's question:
 *   ChatGPT-User, Claude-User, Perplexity-User.
 * - Training crawlers decide what future models know about Coere, which
 *   matters for a new name that models confuse with Cohere: GPTBot (OpenAI),
 *   ClaudeBot (Anthropic), Google-Extended (Gemini; it does not touch Google
 *   Search), Applebot-Extended and CCBot (Common Crawl).
 *
 * To stop model training without leaving AI search, turn the second list to
 * `disallow: "/"`; the first list keeps Coere in ChatGPT, Claude and
 * Perplexity answers.
 */
const SEARCH = ["Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Perplexity-User", "Claude-SearchBot", "Claude-User"];
const TRAINING = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot"];

export default function robots(): MetadataRoute.Robots {
  const open = (userAgent: string | string[]) => ({ userAgent, allow: "/", disallow: PRIVATE });
  return {
    rules: [open("*"), open(SEARCH), open(TRAINING)],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
