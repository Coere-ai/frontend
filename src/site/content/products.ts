import { catalog as en } from "@/site/i18n/messages/en/catalog";
import type { Messages } from "@/site/i18n/messages/types";

type Catalog = Messages["catalog"];

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

/** The products in their order, with their names and pictures; the words come from the messages. */
const base: Pick<Product, "slug" | "name" | "image">[] = [
  { slug: "connect", name: "Coere Connect", image: `${IMAGES}/connect.webp` },
  { slug: "solutions", name: "Coere Solutions", image: `${IMAGES}/solutions.webp` },
  { slug: "forge", name: "Coere Forge", image: `${IMAGES}/forge.webp` },
  { slug: "agents", name: "Coere Agents", image: `${IMAGES}/agents.webp` },
];

/** The products in a language, from that language's catalog. Product names never change. */
export function productsIn(words: Catalog): Product[] {
  return base.map((product) => ({ ...product, ...words.products[product.slug] }));
}

/** The products in English, for the pages and data that are English only. */
export const products: Product[] = productsIn(en);

export function productBySlug(slug: string, list: Product[] = products): Product | undefined {
  return list.find((p) => p.slug === slug);
}
