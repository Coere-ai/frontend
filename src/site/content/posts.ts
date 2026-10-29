/**
 * Blog posts. These are placeholder posts written to fill the blog while the
 * real ones are drafted. Each body is a list of paragraphs.
 */
export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date, shown as "October 28, 2026". */
  date: string;
  image: string;
  readMinutes: number;
  body: string[];
};

const IMAGES = "/preview/images";

/** Newest first. The blog menu shows the first three. */
export const posts: Post[] = [
  {
    slug: "introducing-coere-connect",
    title: "Introducing Coere Connect, one memory across every AI",
    excerpt: "Your chats with every AI, saved in one place and brought into each new chat.",
    date: "2026-10-28",
    image: `${IMAGES}/connect.webp`,
    readMinutes: 4,
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
    image: `${IMAGES}/solutions.webp`,
    readMinutes: 3,
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
    image: `${IMAGES}/forge.webp`,
    readMinutes: 3,
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
    image: `${IMAGES}/catalyst.webp`,
    readMinutes: 5,
    body: [
      "AI is splitting each of us into pieces. Every app keeps its own copy of you, and you can see none of them.",
      "This year we are building the other way around: one memory that you own, that every AI and every app can read with your permission.",
      "Connect is that memory for people. Solutions is that memory for teams. Forge lets anyone build on it.",
    ],
  },
];

export function postBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

/** "2026-10-28" as "October 28, 2026", fixed to UTC so server and browser agree. */
export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
