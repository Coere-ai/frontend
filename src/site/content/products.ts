/** One of Coere's three products, with everything its menu card and page show. */
export type Product = {
  slug: "connect" | "solutions" | "forge" | "agents";
  name: string;
  /** Who it is for, in a few words. */
  kind: string;
  tagline: string;
  description: string;
  image: string;
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
  },
  {
    slug: "solutions",
    name: "Coere Solutions",
    kind: "Memory for teams",
    tagline: "One memory for the whole company.",
    description:
      "A shared memory for a company, its people and its clients. Every chat starts from what the team already knows.",
    image: `${IMAGES}/solutions.webp`,
  },
  {
    slug: "forge",
    name: "Coere Forge",
    kind: "Memory for developers",
    tagline: "Memory infrastructure for your apps.",
    description:
      "The API, MCP server and SDKs that let your apps and agents use Coere as their memory layer, with the person's permission.",
    image: `${IMAGES}/forge.webp`,
  },
  {
    slug: "agents",
    name: "Coere Agents",
    kind: "Agents for every field",
    tagline: "An agent for every field, built on your memory.",
    description:
      "Cori, the helper in Coere, in a version for each field. Each one works from your memory and splits big tasks across workers.",
    image: `${IMAGES}/agents.webp`,
  },
];

export function productBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
