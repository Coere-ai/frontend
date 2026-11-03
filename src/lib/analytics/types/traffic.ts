// Traffic over time: totals, daily and hourly points, and the audience filter.
//
// A COUNT is always a whole number of page views, never a share, so the panel
// can sum, bucket and cumulate any of them the same way. Rates are given
// separately, already divided.

/** Headline numbers for one time window. Computed for the whole range, for the
 *  last 24 hours, and for the 24 before that, so the panel can show a delta
 *  without a second round trip. */
export interface SiteTotals {
  /** Page views: one row per page load anywhere on the public site. */
  views: number;
  /** Distinct browsers (the stable per-browser id), not people. */
  uniqueVisitors: number;
  /** Distinct page loads. Equal to `views` today, kept separate because that is
   *  an implementation detail of how a view is recorded, not a promise. */
  sessions: number;
  /** Views that opened a primary call to action. */
  conversions: number;
  /** conversions / views, 0..1. Zero when there are no views. */
  conversionRate: number;
  /** Mean ACTIVE seconds per view (time with the tab focused). */
  avgSeconds: number;
  /** Median active seconds. The mean alone is unreadable here: one tab left
   *  open for an hour moves it and moves nothing a reader should believe. */
  medianSeconds: number;
  totalSeconds: number;
  /** Mean deepest scroll reached, 0-100. */
  avgScroll: number;
}

/** One day of the overall series. */
export interface SiteDailyPoint {
  date: string;
  views: number;
  uniques: number;
  conversions: number;
  /** Mean active seconds per view that day, rounded. */
  avgSeconds: number;
}

/** One hour of TODAY, in the viewer's timezone. Always 24 entries. */
export interface SiteHourlyPoint {
  /** 0-23, local to the requested timezone. */
  hour: number;
  views: number;
  uniques: number;
  conversions: number;
}

/** Who a set of numbers is about. "human" is the default everywhere: a
 *  dashboard whose headline view count includes crawlers is answering a
 *  different question than the one it appears to answer. */
export type Audience = "human" | "bot" | "all";
