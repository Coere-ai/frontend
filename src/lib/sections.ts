/**
 * The home page's sections, in the order a reader meets them.
 *
 * Every page is split into sections on its own (see
 * lib/analytics/sections/discover.ts), so most pages need nothing here. The
 * home page is listed because it is the page people land on, and knowing its
 * sections in advance lets the dashboard name them by product rather than by
 * headline, show a one line blurb on each card, and draw an empty card for a
 * section nobody has reached yet.
 *
 * `id` is what discovery calls the section: the section element's own DOM id,
 * or "hero" for the block that holds the page's h1. Adding a section to the
 * home page means adding it here too, or it is still tracked but named by its
 * heading.
 */
export type SectionMeta = {
  id: string;
  /** What the dashboard calls it. */
  label: string;
  /** One line on what the reader is looking at, for the preview card. */
  blurb: string;
};

export const SECTIONS: readonly SectionMeta[] = [
  { id: "hero", label: "Hero", blurb: "The opening line and what Coere is for." },
  { id: "demo", label: "Demo", blurb: "The full product film." },
  { id: "connect", label: "Coere Connect", blurb: "One memory across every AI." },
  { id: "solutions", label: "Coere Solutions", blurb: "One memory for the whole company." },
  { id: "forge", label: "Coere Forge", blurb: "Memory for the apps developers build." },
  { id: "compare", label: "How Coere compares", blurb: "Coere against the memory each AI keeps." },
] as const;

/**
 * Which registered sections each page carries, in page order. The dashboard
 * uses this to show an empty card for a section nobody has reached yet, and
 * the tracker uses it to name a section by the registry only on its own page,
 * since an id like "compare" is used on more than one page.
 */
export const PAGE_SECTIONS: Readonly<Record<string, readonly string[]>> = {
  "/": SECTIONS.map((s) => s.id),
};

const BY_ID = new Map(SECTIONS.map((s) => [s.id, s]));

export function sectionMeta(id: string): SectionMeta | undefined {
  return BY_ID.get(id);
}

/** The registry's entry for a section, only when the page really carries it. */
export function pageSectionMeta(path: string, id: string): SectionMeta | undefined {
  return PAGE_SECTIONS[path]?.includes(id) ? BY_ID.get(id) : undefined;
}

export function sectionOrder(id: string): number {
  const i = SECTIONS.findIndex((s) => s.id === id);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}
