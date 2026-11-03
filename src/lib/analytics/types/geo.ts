// Where visitors are and what they use.
//
// "Unknown" is a real answer. Geography comes from the edge and is absent in
// local development and for any address it cannot place; browser and OS come
// from a user agent that may be missing or lying. Those rows are labelled and
// kept, because dropping them would make every total quietly wrong.

/** Views rolled up by country. */
export interface CountryStat {
  /** ISO 3166-1 alpha-2, or "" when the edge could not place the visitor. */
  code: string;
  /** The code, or "Unknown". The panel is free to widen this into a full
   *  country name client-side (Intl.DisplayNames); the server has no country
   *  name table and inventing one here would be a dependency for nothing. */
  label: string;
  views: number;
  uniques: number;
  conversions: number;
  avgSeconds: number;
  /** Share of all views in the window, 0..1. */
  share: number;
}

/** Views rolled up by sub-country region (state / province code from the edge). */
export interface RegionStat {
  /** ISO 3166-1 alpha-2 of the containing country, or "". */
  country: string;
  /** The edge's region code, or "" when it gave none. */
  code: string;
  label: string;
  views: number;
  uniques: number;
  avgSeconds: number;
}

/** One plottable point. Coordinates are the CITY's centroid from the edge, not
 *  a device position: everyone in one city shares a point, and a city with no
 *  coordinates is not in this list at all (see `unplacedViews`). */
export interface CityStat {
  city: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  views: number;
  uniques: number;
  avgSeconds: number;
}

export interface GeoRollup {
  countries: CountryStat[];
  regions: RegionStat[];
  cities: CityStat[];
  /** Views the map can draw. */
  placedViews: number;
  /** Views with no coordinates. Show this next to the map rather than pretending
   *  the plotted points are the whole traffic. In local development it is every
   *  view, which is why the map has to say so instead of rendering empty. */
  unplacedViews: number;
}

/** One row of a categorical split (device class, browser, OS, referrer). */
export interface BreakdownRow {
  /** The stored value, stable across renders: "mobile", "Chrome", "macOS", the
   *  referring host. Empty string when the column was null. */
  key: string;
  /** What to print: the value, or "Unknown" / "Direct". */
  label: string;
  views: number;
  uniques: number;
  /** Share of the split's total views, 0..1. */
  share: number;
}
