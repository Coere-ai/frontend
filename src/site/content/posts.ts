import type { Messages } from "@/site/i18n/messages/types";

import { readingMinutes, type Post, type PostInput } from "./post-parts";

export { blockText, CATEGORIES, formatPostDate, postAuthor, readingMinutes, type Block, type Category, type Post } from "./post-parts";

/**
 * Blog posts, read on the server only. The menus get the three newest
 * posts' slug, title and cover from the site layout (navPosts), so no post
 * body ships in a client chunk. posts.test.ts fails if any client module
 * comes to import this file, directly or through another; the file is not
 * marked server-only, since the sitemap's own test reads it under Node. A post that is not out yet stays out of
 * this repository until it is: a filter in a module the build imports is
 * not a guard, and this repository is public. The posts here are
 * placeholder posts written to fill the blog while the real ones are
 * drafted, marked `placeholder` so search engines skip them.
 *
 * A body is a list of blocks. A plain string is a paragraph, and inside it
 * [words](/path) makes a link, **words** bold and `words` code.
 */
const input: PostInput[] = [
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

/** Newest first. The first is the blog's featured post, and the blog menu shows the first three. */
export const posts: Post[] = input.map((post) => ({ ...post, image: `/blog/${post.slug}/cover.svg`, readMinutes: readingMinutes(post.body) }));

/** What the menus show of a post: its address, its title and its cover. */
export type NavPost = Pick<Post, "slug" | "title" | "image">;

/** The three newest posts for the navbar's blog menu and the small screen menu, with nothing else of them. */
export function navPosts(): NavPost[] {
  return posts.slice(0, 3).map(({ slug, title, image }) => ({ slug, title, image }));
}

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

/** Up to `count` other posts to read next: the same category first, then the newest. */
export function readNext(post: Post, count = 3): Post[] {
  const others = posts.filter((p) => p.slug !== post.slug);
  const same = others.filter((p) => p.category === post.category);
  return [...same, ...others.filter((p) => p.category !== post.category)].slice(0, count);
}
