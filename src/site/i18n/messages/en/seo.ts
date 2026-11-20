import { homeSeo, pricingSeo } from "@/site/content/seo";

/**
 * What each translated page says in search results and link previews: a
 * title of about 60 characters at most and a description of about 155.
 * The keywords stay in English in src/site/content/seo.ts.
 */
export const seo = {
  home: {
    title: homeSeo.title,
    description: homeSeo.description,
  },
  pricing: {
    title: pricingSeo.title,
    description: pricingSeo.description,
  },
  blog: {
    title: "Blog",
    description: "The latest news, launches, and insights from Coere.",
  },
} as const;
