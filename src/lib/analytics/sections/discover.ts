import { pageSectionMeta, sectionMeta } from "@/lib/sections";

import { cleanLabel, idAllocator, slugify } from "./ids";

/**
 * Finding the sections of whatever page is on screen.
 *
 * Every page on the site is split into sections without anyone having to tag
 * it. Three sources, in order:
 *
 *   1. Elements carrying `data-section`, for a page that wants hand-picked
 *      sections.
 *   2. Otherwise, the page's own `<section>` blocks. Coere builds every page
 *      from them, most with an id, so they are the parts a reader sees. Only the
 *      outermost ones count, so a card grid inside a block stays part of it.
 *   3. Otherwise, the page's headings. Each h1 or h2 starts a section that runs
 *      until the next one, which is how a reader thinks of a long text anyway.
 *
 * A block's id is its DOM id. Without one, the block that holds the page's h1
 * is "hero", and any other is a slug of its name. It is named by
 * `data-section-label`, then by the registry in lib/sections.ts when this page
 * is listed there, then "Hero" for the hero, then by its first heading, its
 * aria-label or a short opening line, then by its id.
 *
 * Shared by the tracker (which measures the boxes every second) and by the
 * dashboard's preview frames (which scroll to the box). Pure DOM, no React.
 */

export type SectionBox = {
  id: string;
  label: string;
  /** 0-based order down the page, so the dashboard can show page order. */
  position: number;
  /** Viewport coordinates at the moment of the call, in CSS pixels. */
  top: number;
  bottom: number;
};

/** Headings that open a section when nothing else marks one. h3 and below
 *  are sub-points of a section, not sections of the page. */
const HEADINGS = "h1, h2";

/** "use-cases" reads as "Use cases" when a block has no heading at all. */
function humanize(id: string): string {
  const words = id.replace(/[-_]+/g, " ").trim();
  return words ? words[0]!.toUpperCase() + words.slice(1) : "";
}

/** The element whose sections describe the page. `main` when the page has one,
 *  because a nav or a footer is chrome, not content. */
function contentRoot(doc: Document): HTMLElement | null {
  return doc.querySelector("main") ?? doc.body;
}

/** The page's own path, without a trailing slash, the way the beacon stores it. */
function pathOf(doc: Document): string {
  const path = doc.location?.pathname ?? "/";
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

/** Sections tagged by hand with `data-section`. */
function tagged(doc: Document): SectionBox[] {
  const nodes = [...doc.querySelectorAll<HTMLElement>("[data-section]")];
  const allocate = idAllocator();
  return nodes.flatMap((el, position) => {
    const raw = el.dataset.section ?? "";
    if (!raw) return [];
    const r = el.getBoundingClientRect();
    const label =
      el.dataset.sectionLabel ||
      sectionMeta(raw)?.label ||
      el.querySelector("h1, h2, h3")?.textContent ||
      raw;
    return [
      {
        id: allocate(raw, `section-${position + 1}`),
        label: cleanLabel(label),
        position,
        top: r.top,
        bottom: r.bottom,
      },
    ];
  });
}

/** A line short enough to be a section's name rather than its body. */
const SHORT_LINE = 48;

/** What a block calls itself: its first heading, its aria-label, or a short
 *  opening line such as "More from Coere". Empty when it says none of these. */
function blockName(el: HTMLElement): string {
  const heading = el.querySelector("h1, h2, h3")?.textContent?.trim();
  if (heading) return heading;
  const aria = el.getAttribute("aria-label")?.trim();
  if (aria) return aria;
  const first = el.querySelector("p")?.textContent?.trim() ?? "";
  return first.length <= SHORT_LINE ? first : "";
}

/** The page's outermost `<section>` blocks. */
function blocks(doc: Document): SectionBox[] {
  const root = contentRoot(doc);
  if (!root) return [];
  const outer = [...root.querySelectorAll<HTMLElement>("section")].filter(
    (el) => !el.parentElement?.closest("section"),
  );
  const path = pathOf(doc);
  const h1 = root.querySelector("h1");
  const allocate = idAllocator();
  return outer.map((el, position) => {
    const name = blockName(el);
    // The block holding the page's h1 is its hero. Every Coere page opens with
    // one, and calling it "hero" keeps it apart from a closing call that
    // repeats the headline, which would otherwise share its slug.
    const hero = !el.id && h1 !== null && el.contains(h1);
    const id = allocate(el.id || (hero ? "hero" : ""), slugify(name) || `section-${position + 1}`);
    const label =
      el.dataset.sectionLabel ||
      pageSectionMeta(path, id)?.label ||
      (hero ? "Hero" : "") ||
      name ||
      humanize(el.id) ||
      `Section ${position + 1}`;
    const r = el.getBoundingClientRect();
    return { id, label: cleanLabel(label), position, top: r.top, bottom: r.bottom };
  });
}

/** Sections cut from the page's headings. */
function fromHeadings(doc: Document): SectionBox[] {
  const root = contentRoot(doc);
  if (!root) return [];
  const headings = [...root.querySelectorAll<HTMLElement>(HEADINGS)].filter(
    (h) => (h.textContent ?? "").trim() !== "",
  );
  if (headings.length === 0) return [];

  const rootBox = root.getBoundingClientRect();
  const allocate = idAllocator();
  return headings.map((h, position) => {
    const text = h.dataset.sectionLabel || h.textContent || "";
    const top =
      // The first section also owns whatever sits above its heading (a
      // masthead, a byline), so no part of the page goes unattributed.
      position === 0
        ? Math.min(rootBox.top, h.getBoundingClientRect().top)
        : h.getBoundingClientRect().top;
    const next = headings[position + 1];
    const bottom = next ? next.getBoundingClientRect().top : rootBox.bottom;
    return {
      id: allocate(h.id, slugify(text) || `section-${position + 1}`),
      label: cleanLabel(text),
      position,
      top,
      bottom: Math.max(top, bottom),
    };
  });
}

/** Every section of the document, in page order. Empty for a page with no
 *  tagged elements, no section blocks and no headings, which then reports no
 *  sections at all. */
export function discoverSections(doc: Document): SectionBox[] {
  const hand = tagged(doc);
  if (hand.length > 0) return hand;
  const parts = blocks(doc);
  return parts.length > 0 ? parts : fromHeadings(doc);
}
