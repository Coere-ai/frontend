import type { CoverKind } from "@/site/blog/covers";
import { founders } from "@/lib/site";
import type { Locale } from "@/site/i18n/locales";
import type { Messages } from "@/site/i18n/messages/types";

/**
 * Blog posts. The funding post is the owner's news, hidden for now. The others are
 * placeholder posts written to fill the blog while the real ones are
 * drafted, marked `placeholder` so search engines skip them.
 *
 * A body is a list of blocks. A plain string is a paragraph, and inside it
 * [words](/path) makes a link, **words** bold and `words` code.
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

type PostInput = {
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
  /** Kept in the source but off the site: not listed, not linked, and its page is not built. */
  hidden?: boolean;
};

export type Post = PostInput & {
  /** The cover's address, drawn at build time by the cover route. */
  image: string;
  readMinutes: number;
};

const input: PostInput[] = [
  {
    slug: "coere-is-venture-backed",
    // Hidden for now, at the owner's request; set to false to publish it.
    hidden: true,
    title: "Coere is now venture backed",
    excerpt: "We raised venture funding at a $2 million valuation. Here is what the money is for, and what stays the same.",
    date: "2026-11-20",
    category: "Company",
    cover: "venture",
    body: [
      "Today we have news to share. Coere is now venture backed, at a $2 million valuation.",
      "It is an early step, and an important one for a small team. Investors looked at what we are building and decided to back it. We are grateful for that trust, and we plan to earn it.",
      { h2: "Why we started Coere" },
      "Most people now use more than one AI. You might plan a trip in ChatGPT, write code in Claude and research in Gemini. Each one keeps its own piece of you, and none of them share it. Open a new AI and you explain yourself from the beginning.",
      "We think that memory should belong to the person, not to the app. So we built Coere, a portable AI memory layer you own. It saves your chats from the AIs you use, builds one memory from them that you can see and edit, and brings the right context into each new chat.",
      { h2: "What the money is for" },
      "The funding goes to work that is already on our roadmap. The plan stays the same. We can now build it faster.",
      {
        ordered: true,
        list: [
          "**Coere Connect on the Chrome Web Store**, so anyone can add [Coere Connect](/products/connect) to Chrome in a click.",
          "**Coere for Teams**, with a free week to try it with your team. It brings [Coere Solutions](/products/solutions) to the whole company.",
          "**A hosted Coere API at coere.ai**, so developers can build on [Coere Forge](/products/forge) without running their own server.",
        ],
      },
      { h2: "We are hiring" },
      "The funding also lets us grow the team. We are hiring a founding team in San Francisco, in engineering, business and marketing. If you want to help build memory that people own, [email the founders](mailto:coereagent@gmail.com).",
      { h2: "What does not change" },
      "Funding changes how fast we build. It does not change who your memory belongs to.",
      "Your memory stays yours. You can see everything Coere remembers, edit it or forget it, and you decide which AIs and apps may read it.",
      "If you have not tried Coere yet, now is a good time. Coere Connect is coming soon. Say you are interested and we will email you the day it is out.",
    ],
    cta: { href: "/install", label: "Get Coere Connect" },
  },
  {
    slug: "introducing-coere-connect",
    title: "Introducing Coere Connect, one memory across every AI",
    excerpt: "Your chats with every AI, saved in one place and brought into each new chat.",
    date: "2026-10-28",
    category: "Product",
    cover: "connect",
    placeholder: true,
    body: [
      "Most people now use more than one AI. Each one keeps its own memory of you, and none of them talk to each other. Start a chat on a new AI and you begin again from nothing.",
      "Coere Connect fixes that. It saves your chats from ChatGPT, Claude, Gemini and six more AIs into one library on your computer, and builds a memory from them that you can see and edit.",
      "When you type in a new chat, a line above the box says what Coere will add and which AIs it learned it from. Press Enter and the AI starts from the work you already did.",
      "Nothing goes to an AI to build memory until you say so, and you can forget any memory at any time. Your memory belongs to you.",
    ],
  },
  {
    slug: "coere-solutions",
    title: "Coere Solutions: one memory for your whole team",
    excerpt: "Company knowledge and every client, remembered across the team.",
    date: "2026-10-21",
    category: "Product",
    cover: "solutions",
    placeholder: true,
    body: [
      "Teams lose a surprising amount of what they know in chats nobody else can see. A promise to a client, a decision from last month, the reason a project changed course.",
      "Coere Solutions files what your team's chats say under Company, and gives each client a folder with its contacts, promises, meetings and decisions.",
      "When someone drafts a message about a client, that client's memory goes with it. Another client's never does.",
    ],
  },
  {
    slug: "coere-forge",
    title: "Forge: give your app a memory on day one",
    excerpt: "The API, MCP server and SDKs for building on Coere.",
    date: "2026-10-14",
    category: "Developers",
    cover: "forge",
    placeholder: true,
    body: [
      "Every new app asks its users the same questions. Who are you, what are you working on, how do you like things done. Forge lets an app ask Coere instead.",
      "An app asks for access, the person presses Allow, and the app can read the memory its token allows. Send what the user typed and get back the context Coere would add to it.",
      "Forge ships with a TypeScript client, a Python SDK and an MCP server, so an agent can remember its users in a few lines.",
    ],
  },
  {
    slug: "catalyst-26",
    title: "Catalyst 26: what we're building this year",
    excerpt: "Where Coere is headed, and why memory should belong to people.",
    date: "2026-10-07",
    category: "Company",
    cover: "year",
    placeholder: true,
    body: [
      "AI is splitting each of us into pieces. Every app keeps its own copy of you, and you can see none of them.",
      "This year we are building the other way around: one memory that you own, that every AI and every app can read with your permission.",
      "Connect is that memory for people. Solutions is that memory for teams. Forge lets anyone build on it.",
    ],
  },
];

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

/** Newest first. The first is the blog's featured post, and the blog menu shows the first three. */
export const posts: Post[] = input.filter((post) => !post.hidden).map((post) => ({ ...post, image: `/blog/${post.slug}/cover.svg`, readMinutes: readingMinutes(post.body) }));

/**
 * The posts with their titles and summaries in a language, for the lists
 * that show them. A post's body stays in English for now.
 */
export function postsIn(words: Messages["blog"]): Post[] {
  return posts.map((post) => ({ ...post, ...(words.posts[post.slug as keyof Messages["blog"]["posts"]] ?? {}) }));
}

export function postBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

/** Who wrote a post: a founder it names, else the Coere team. */
export function postAuthor(post: Post): { name: string; role?: string } {
  const founder = founders.find((f) => f.name === post.author);
  return founder ? { name: founder.name, role: founder.role } : { name: "The Coere team" };
}

/** Up to `count` other posts to read next: the same category first, then the newest. */
export function readNext(post: Post, count = 3): Post[] {
  const others = posts.filter((p) => p.slug !== post.slug);
  const same = others.filter((p) => p.category === post.category);
  return [...same, ...others.filter((p) => p.category !== post.category)].slice(0, count);
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
