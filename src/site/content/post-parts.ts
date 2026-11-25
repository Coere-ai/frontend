import type { CoverKind } from "@/site/blog/covers";
import { founders } from "@/lib/site";
import type { Locale } from "@/site/i18n/locales";

/**
 * The shape of a blog post and the small helpers that read one. Kept apart
 * from posts.ts, which holds the posts and is server only, so a client
 * component (the post meta line, the blog's filters) can use these without
 * the post list coming into the browser with them.
 */
export type Block =
  | string
  | { h2: string }
  | { list: string[]; ordered?: boolean }
  | { quote: string; cite?: string }
  | { code: string };

/** What a post is about, for the blog's filters. */
export const CATEGORIES = ["Company", "Product", "Developers"] as const;
export type Category = (typeof CATEGORIES)[number];

export type PostInput = {
  slug: string;
  title: string;
  /** The one line under the title on the post page, and the card's summary. */
  excerpt: string;
  /** ISO date, shown as "October 28, 2026". */
  date: string;
  category: Category;
  /** The cover art drawn for this post (src/site/blog/covers); the plain mark if unset. */
  cover?: CoverKind;
  /** A founder's name, as on the About page. Anyone else, or no one, reads as the Coere team. */
  author?: string;
  body: Block[];
  /** A button under the post, for a post that asks the reader to do something. */
  cta?: { href: string; label: string };
  /** Written to fill the blog until a real post replaces it, so kept out of search. */
  placeholder?: boolean;
};

export type Post = PostInput & {
  /** The cover's address, drawn at build time by the cover route. */
  image: string;
  readMinutes: number;
};

/** A block's words without the inline marks, for counting and for search snippets. */
export function blockText(block: Block): string {
  const raw = typeof block === "string" ? block : "h2" in block ? block.h2 : "list" in block ? block.list.join(" ") : "quote" in block ? block.quote : block.code;
  return raw.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*|`/g, "");
}

/** Minutes to read at about 220 words a minute, never less than one. */
export function readingMinutes(body: Block[]): number {
  const words = body.map(blockText).join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** Who wrote a post: a founder it names, else the Coere team. */
export function postAuthor(post: Post): { name: string; role?: string } {
  const founder = founders.find((f) => f.name === post.author);
  return founder ? { name: founder.name, role: founder.role } : { name: "The Coere team" };
}

/** The date style each language writes: "October 28, 2026", "28 de octubre de 2026", "2026年10月28日". */
const DATE_LOCALES: Record<Locale, string> = { en: "en-US", es: "es-ES", fr: "fr-FR", nl: "nl-NL", ja: "ja-JP" };

/** "2026-10-28" as "October 28, 2026" in English, fixed to UTC so server and browser agree. */
export function formatPostDate(iso: string, locale: Locale = "en"): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(DATE_LOCALES[locale], {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
