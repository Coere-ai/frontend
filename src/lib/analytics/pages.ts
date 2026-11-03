import "server-only";

import { docPages } from "@/site/content/docs";
import { industries } from "@/site/content/industries";
import { products } from "@/site/content/products";

/**
 * The public pages, by path, with the names the dashboard shows for them.
 *
 * The same pages the sitemap lists, named from the same content files, so a
 * new product or industry is in the page picker the day it ships. Server side
 * on purpose: the content files carry far more than names, and pulling them
 * into the dashboard's client bundle would ship all of it to /statistics. The
 * read layer stamps the label onto each page row instead.
 *
 * A page missing from this list still shows up in the dashboard as soon as it
 * gets traffic, labelled by its path. Listing it here just means it can be
 * picked before anyone has visited it.
 */
const KNOWN: readonly { path: string; label: string }[] = [
  { path: "/", label: "Home" },
  ...products.map((p) => ({ path: `/products/${p.slug}`, label: p.name })),
  { path: "/industries", label: "Industries" },
  ...industries.map((i) => ({ path: `/industries/${i.slug}`, label: `Industries: ${i.name}` })),
  { path: "/resources", label: "Developer docs" },
  ...docPages
    .filter((d) => d.slug !== "overview")
    .map((d) => ({ path: `/resources/${d.slug}`, label: `Docs: ${d.title}` })),
  { path: "/about", label: "About" },
];

const BY_PATH = new Map(KNOWN.map((p) => [p.path, p.label]));

export function knownPages(): readonly { path: string; label: string }[] {
  return KNOWN;
}

/** A readable name for any path, including one that no longer exists. */
export function pageLabel(path: string): string {
  return BY_PATH.get(path) ?? path;
}
