import type { FilmKey } from "./films";

/** One of Coere's three products, with everything its menu card and page show. */
export type Product = {
  slug: "connect" | "solutions" | "forge";
  name: string;
  /** Who it is for, in a few words. */
  kind: string;
  tagline: string;
  description: string;
  image: string;
  film: FilmKey;
  highlights: { title: string; text: string }[];
  /** Slugs from features.ts shown on the product page. */
  features: string[];
};

const IMAGES = "/preview/images";

export const products: Product[] = [
  {
    slug: "connect",
    name: "Coere Connect",
    kind: "Memory for people",
    tagline: "Your memory, across every AI.",
    description:
      "A memory layer that belongs to you. It saves your chats from every AI you use and brings the right context into each new one.",
    image: `${IMAGES}/connect.webp`,
    film: "v2",
    highlights: [
      {
        title: "Every AI, one memory",
        text: "ChatGPT, Claude, Gemini and six more AIs feed the same memory, so a new chat anywhere starts from what you already said.",
      },
      {
        title: "Context as you type",
        text: "A line above the chat box says what Coere will add. Remove anything before you send.",
      },
      {
        title: "Yours to keep",
        text: "Your chats live in your browser. Nothing goes to an AI to build memory until you say so.",
      },
    ],
    features: ["memory", "extraction", "smart-context", "voice", "cori", "writer"],
  },
  {
    slug: "solutions",
    name: "Coere Solutions",
    kind: "Memory for teams",
    tagline: "One memory for the whole company.",
    description:
      "A shared memory for a company, its people and its clients. Every chat starts from what the team already knows.",
    image: `${IMAGES}/solutions.webp`,
    film: "teams",
    highlights: [
      {
        title: "Company and clients",
        text: "What your chats say about the team goes under Company, and each client gets a folder with its contacts, promises and decisions.",
      },
      {
        title: "The right client, every time",
        text: "A draft about a client gets that client's memory, and never another client's.",
      },
      {
        title: "Share what you choose",
        text: "Export the company graph or one client to a file a teammate can import.",
      },
    ],
    features: ["memory", "smart-context", "actions", "workers"],
  },
  {
    slug: "forge",
    name: "Coere Forge",
    kind: "Memory for developers",
    tagline: "Memory infrastructure for your apps.",
    description:
      "The API, MCP server and SDKs that let your apps and agents use Coere as their memory layer, with the person's permission.",
    image: `${IMAGES}/forge.webp`,
    film: "v3",
    highlights: [
      {
        title: "Context for any draft",
        text: "Send what your user typed and get back the memories Coere would add to it, the same ones a chat would get.",
      },
      {
        title: "Permission first",
        text: "Your app asks, the person presses Allow, and the token only reads what it was given.",
      },
      {
        title: "TypeScript, Python and MCP",
        text: "A few lines of either SDK, or the MCP server, and your agent remembers its users from day one.",
      },
    ],
    features: ["smart-context", "workers", "benchmarks"],
  },
];

export function productBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
