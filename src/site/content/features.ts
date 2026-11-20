import { catalog as en } from "@/site/i18n/messages/en/catalog";
import type { Messages } from "@/site/i18n/messages/types";
import type { FilmKey } from "./films";

type Catalog = Messages["catalog"];

/**
 * A feature with the film that shows it. The products menu links each one
 * to its place in Capabilities on the Agents page, where it plays live.
 */
export type Feature = {
  slug: string;
  /** Short name for menus. */
  name: string;
  /** The line a feature row leads with. */
  title: string;
  description: string;
  film: FilmKey;
  /** Its place in Capabilities on the Agents page. */
  href: string;
  /** False keeps it out of the products menu, which lists only the main ones; Capabilities still shows it. */
  menu?: false;
};

/** Capabilities on the Agents page: every feature in one place, linked from wherever a few are shown. */
export const ALL_FEATURES = { href: "/products/agents#capabilities", linkLabel: "See all features" };

/** The features in their order, with their films and places; the words come from the messages. */
const base: Omit<Feature, "name" | "title" | "description">[] = [
  { slug: "memory", film: "memory", href: "/products/agents#capability-memory" },
  { slug: "extraction", film: "extraction", href: "/products/agents#capability-extraction" },
  { slug: "smart-context", film: "smartContext", href: "/products/agents#capability-smart-context" },
  { slug: "voice", film: "voiceMode", href: "/products/agents#capability-voice" },
  { slug: "cori", film: "coriChat", href: "/products/agents#capability-cori" },
  { slug: "actions", film: "actionsGmail", href: "/products/agents#capability-actions" },
  { slug: "writer", film: "coriRewrite", href: "/products/agents#capability-writer" },
  { slug: "any-site", film: "actionsAnywhere", href: "/products/agents#capability-any-site", menu: false },
  { slug: "workers", film: "workers", href: "/products/agents#capability-workers" },
];

/** The features in a language, from that language's catalog. */
export function featuresIn(words: Catalog): Feature[] {
  return base.map((feature) => ({ ...feature, ...words.features[feature.slug as keyof Catalog["features"]] }));
}

/** The features in English. */
export const features: Feature[] = featuresIn(en);

export function featureBySlug(slug: string): Feature | undefined {
  return features.find((f) => f.slug === slug);
}
