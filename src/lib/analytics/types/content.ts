// What people read and click: pages, the sections inside them, and clicks.

/** The section of a page that held readers longest, for the all-pages table. */
export interface TopSection {
  id: string;
  label: string;
  totalSeconds: number;
}

/** One page of the public site. */
export interface PageStat {
  path: string;
  /** What the dashboard calls it: "Home", a product's name. Falls
   *  back to the path for a page the registry does not know. */
  label: string;
  views: number;
  uniques: number;
  avgSeconds: number;
  /** Mean deepest scroll on this page, 0-100. Read with avgSeconds: a long
   *  visit that never left the first screen is not a page that was read. */
  avgScroll: number;
  conversions: number;
  conversionRate: number;
  /** How many distinct sections have been read on this page in the window. */
  sectionCount: number;
  /** The most-read section, or null when no section was recorded. */
  topSection: TopSection | null;
}

/** One entry in the dashboard's page picker. Includes known pages with no
 *  traffic yet, so a page can be picked before anyone has opened it. */
export interface PageOption {
  path: string;
  label: string;
  views: number;
}

export type SiteEventKind = "click" | "cta" | "outbound" | "section";

/** One thing people click, per page. Split by path on purpose: the same label
 *  in the header and in the footer are two different buttons to whoever has to
 *  decide which one to move. */
export interface ClickStat {
  /** The element's own text. "Unlabeled" when the element carried none. */
  label: string;
  kind: SiteEventKind;
  path: string;
  count: number;
}

/** One link off the site. */
export interface OutboundStat {
  href: string;
  /** Host only, for a table that stays readable when the URL is long. */
  host: string;
  label: string;
  count: number;
}

/** How much of a page one section actually got read.
 *
 *  `totalSeconds` is ACTIVE time during which this section filled more of the
 *  viewport than any other, so the sections of a visit never sum to more than
 *  the visit lasted, and the numbers can be compared to each other and to the
 *  visit's own duration without qualification. */
export interface SectionStat {
  /** The page the section lives on. Two pages can both have an "overview". */
  path: string;
  /** The section's id: a `data-section` value, a heading's DOM id, or a slug
   *  of the heading's text. */
  id: string;
  /** The name the page gave it, or the id for rows older than labels. */
  label: string;
  /** Order down the page, 0-based. Rows older than positions sort last. */
  position: number;
  /** Visits that reached this section at all. */
  views: number;
  /** Distinct visitors that reached it. */
  uniques: number;
  /** Summed active seconds across every visit. */
  totalSeconds: number;
  /** Mean active seconds among the visits that reached it. */
  avgSeconds: number;
  /** Share of all section time on its page in the window, 0..1. */
  share: number;
  /** Share of the page's visits that got this far, 0..1. The drop-off. */
  reach: number;
}
