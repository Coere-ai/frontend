// The site-analytics contract
//
// One set of shapes shared by the read layer (lib/analytics/query), the route
// that serves them (/api/admin/analytics) and the panel that draws them. They
// live apart from the queries because the panel is a client component, and the
// query layer holds the server's database key.

import type { BreakdownRow, GeoRollup } from "./geo";
import type { ClickStat, OutboundStat, PageOption, PageStat, SectionStat } from "./content";
import type { Audience, SiteDailyPoint, SiteHourlyPoint, SiteTotals } from "./traffic";

export type * from "./content";
export type * from "./geo";
export type * from "./traffic";

/** Everything the Analytics tab renders, for one day range and one scope. */
export interface SiteAnalytics {
  window: {
    days: number;
    tz: string;
    /** ISO instants bounding the range, so the panel can label it honestly. */
    since: string;
    until: string;
  };
  /** The page every scoped number is about, or null for the whole site. */
  scope: string | null;
  /** Every page view ever recorded in this scope, ignoring the day range. A
   *  window total that moves when someone changes the range is a different
   *  question wearing the same label. */
  lifetimeViews: number;
  totals: SiteTotals;
  last24h: SiteTotals;
  /** The 24 hours before `last24h`, for the delta. */
  previous24h: SiteTotals;
  daily: SiteDailyPoint[];
  hourly: SiteHourlyPoint[];
  /** Every page in the window, most-viewed first. Never scoped, because the
   *  all-pages table and the picker both need the whole site. */
  pages: PageStat[];
  /** Pages the picker offers: everything with traffic plus every known page. */
  pageOptions: PageOption[];
  /** The scoped page's sections, ranked by reading time. Empty for the whole
   *  site, where sections from different pages are not comparable. */
  sections: SectionStat[];
  clicks: ClickStat[];
  outbound: OutboundStat[];
  geo: GeoRollup;
  /** Which audience every other number in this payload is about. */
  audience: Audience;
  devices: BreakdownRow[];
  browsers: BreakdownRow[];
  operatingSystems: BreakdownRow[];
  referrers: BreakdownRow[];
}
