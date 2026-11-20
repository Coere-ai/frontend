import type { Focus } from "@/site/art/pixel-picture/frame";
import type { IndustryIconName } from "@/site/ui/icons/industry-icons";
import { catalog as en } from "@/site/i18n/messages/en/catalog";
import type { Messages } from "@/site/i18n/messages/types";
import type { Product } from "./products";

type Catalog = Messages["catalog"];

/**
 * Industries Coere serves. The copy is placeholder for now: each line says
 * plainly what memory does there, and will be replaced with real stories.
 */
export type Industry = {
  slug: string;
  name: string;
  icon: IndustryIconName;
  summary: string;
  uses: string[];
  /**
   * A photo from Unsplash, free to use under the Unsplash License, saved at
   * 960, 1920 and 3840 wide. The pages draw it as a pixel picture; `focus`
   * is the point to keep in frame, 0 to 1 each way, where a tall or narrow
   * frame crops the photo, and how far to zoom in on it.
   */
  photo: { src: string; alt: string; by: string; focus?: Focus };
};

/** Industry photos are private like the rest of the new site. */
const photo = (slug: string, alt: string, by: string, focus?: Focus) => ({ src: `/preview/images/industries/${slug}.webp`, alt, by, focus });

/** Who Coere is for, each tied to the product that serves them. */
export type Application = {
  slug: string;
  name: string;
  summary: string;
  product: Product["slug"];
};

type AppSlug = keyof Catalog["applications"];
type IndustrySlug = keyof Catalog["industries"];

const appBase: { slug: AppSlug; product: Product["slug"] }[] = [
  { slug: "consumer", product: "connect" },
  { slug: "developer", product: "forge" },
  { slug: "business", product: "solutions" },
];

/** Who Coere is for in a language. */
export function applicationsIn(words: Catalog): Application[] {
  return appBase.map((app) => ({ ...app, ...words.applications[app.slug] }));
}

export const applications: Application[] = applicationsIn(en);

/** The industries in their order, with their icons and photos; the words come from the messages. */
const industryBase: { slug: IndustrySlug; icon: IndustryIconName; photo: { by: string; focus?: Focus } }[] = [
  { slug: "finance", icon: "chart", photo: { by: "David Vives" } },
  { slug: "technology", icon: "cpu", photo: { by: "Chris Briggs", focus: [0.5, 0.4, 1.25] } },
  { slug: "commerce", icon: "globe", photo: { by: "I P", focus: [0.7, 0.5] } },
  { slug: "consumer", icon: "cart", photo: { by: "Franki Chamaki" } },
  { slug: "manufacturing", icon: "factory", photo: { by: "Simon Kadula" } },
  { slug: "energy", icon: "bolt", photo: { by: "Zetong Li" } },
  { slug: "education", icon: "cap", photo: { by: "Jeremy Huang", focus: [0.45, 0.5] } },
  { slug: "legal", icon: "scale", photo: { by: "Joshua Woods", focus: [0.62, 0.5] } },
];

/** The industries in a language, from that language's catalog. */
export function industriesIn(words: Catalog): Industry[] {
  return industryBase.map(({ slug, icon, photo: shot }) => {
    const { alt, ...copy } = words.industries[slug];
    return { slug, icon, ...copy, uses: [...copy.uses], photo: photo(slug, alt, shot.by, shot.focus) };
  });
}

export const industries: Industry[] = industriesIn(en);
