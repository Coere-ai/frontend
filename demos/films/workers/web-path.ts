/**
 * Where a page of coere-v2's fake web (tests/fake-pages/research: the
 * search engine on www.google.com and the biotech company sites) is kept
 * in this film: web.mts writes each page the workers can reach as a file
 * under web/, and a worker's tab opens that file when the run sends it to
 * the page's own address. Shared by the build (web.mts) and the film.
 */

/** Where the film's files are served. */
export const BASE = "/preview/live/workers/";

/** What the film's two lines ask for, as act@1 reads them ("find 20 biotech companies with leads"). */
export const WHATS = ["biotech companies", "gene therapy companies"] as const;

/** A company site's pages (tests/fake-pages/research/site.ts SITE_PAGES), home as "home". */
export const SITE_PAGES = ["home", "about", "team", "contact", "careers"] as const;

/** The file that stands for an address nothing in the fake web answers. */
export const NONE = "web/none.html";

const slug = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** The search engine's results page for a query, from the result it starts at. */
export const searchFile = (q: string, start: number): string => `web/google/${slug(q)}${start > 0 ? `-${start}` : ""}.html`;

/** A company site's page. */
export const siteFile = (host: string, page: string): string => `web/${host}/${page}.html`;

/** The file kept for an address, or null when the fake web has no such page. */
export function fileFor(address: string): string | null {
  let url: URL;
  try {
    url = new URL(address);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.hostname === "www.google.com") {
    if (url.pathname !== "/search") return null;
    return searchFile(url.searchParams.get("q") ?? "", Number(url.searchParams.get("start") ?? 0) || 0);
  }
  const page = url.pathname === "/" ? "home" : url.pathname.replace(/^\/|\/$/g, "");
  return (SITE_PAGES as readonly string[]).includes(page) || page === "members" ? siteFile(url.hostname, page) : null;
}
