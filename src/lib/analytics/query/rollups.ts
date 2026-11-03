import type { BreakdownRow, CityStat, CountryStat, GeoRollup, RegionStat, SiteTotals } from "../types";

import type { VisitRow } from "./rows";
import { groupBy, mean, median, uniques } from "./stats";

// Rollups over visits: the headline totals, the categorical splits, and the
// geography. Each takes the visits already chosen for the scope and audience.

/** Headline numbers for one set of visits. */
export function totalsOf(visits: VisitRow[]): SiteTotals {
  const seconds = visits.map((v) => v.duration_seconds);
  const conversions = visits.filter((v) => v.converted).length;
  return {
    views: visits.length,
    uniqueVisitors: uniques(visits),
    sessions: new Set(visits.map((v) => v.session_id)).size,
    conversions,
    conversionRate: visits.length ? conversions / visits.length : 0,
    avgSeconds: Math.round(mean(seconds)),
    medianSeconds: Math.round(median(seconds)),
    totalSeconds: seconds.reduce((a, b) => a + b, 0),
    avgScroll: Math.round(mean(visits.map((v) => v.max_scroll))),
  };
}

/** One categorical split (device, browser, OS, referrer), biggest first. */
export function breakdown(
  visits: VisitRow[],
  key: (v: VisitRow) => string,
  label: (k: string) => string,
): BreakdownRow[] {
  const total = visits.length;
  return [...groupBy(visits, key)]
    .map(([k, rows]) => ({
      key: k,
      label: label(k),
      views: rows.length,
      uniques: uniques(rows),
      share: total ? rows.length / total : 0,
    }))
    .sort((a, b) => b.views - a.views);
}

/** Countries, regions and plottable cities for one set of visits. */
export function geoRollup(visits: VisitRow[]): GeoRollup {
  const total = visits.length;

  const countries: CountryStat[] = [...groupBy(visits, (v) => v.country ?? "")]
    .map(([code, rows]) => ({
      code,
      label: code || "Unknown",
      views: rows.length,
      uniques: uniques(rows),
      conversions: rows.filter((r) => r.converted).length,
      avgSeconds: Math.round(mean(rows.map((r) => r.duration_seconds))),
      share: total ? rows.length / total : 0,
    }))
    .sort((a, b) => b.views - a.views);

  const regions: RegionStat[] = [
    ...groupBy(visits, (v) => `${v.country ?? ""}|${v.region ?? ""}`),
  ]
    .map(([composite, rows]) => {
      const [country = "", code = ""] = composite.split("|");
      return {
        country,
        code,
        label: code || "Unknown",
        views: rows.length,
        uniques: uniques(rows),
        avgSeconds: Math.round(mean(rows.map((r) => r.duration_seconds))),
      };
    })
    .sort((a, b) => b.views - a.views);

  // A city with no coordinates is not a point on a map. It is counted in
  // `unplacedViews` instead of being drawn at (0, 0), which is a real place.
  const placeable = visits.filter(
    (v) => v.latitude !== null && v.longitude !== null && v.city,
  );
  const cities: CityStat[] = [
    ...groupBy(placeable, (v) => `${v.country ?? ""}|${v.region ?? ""}|${v.city}`),
  ]
    .map(([, rows]) => {
      const first = rows[0]!;
      return {
        city: first.city ?? "",
        country: first.country ?? "",
        region: first.region ?? "",
        latitude: first.latitude!,
        longitude: first.longitude!,
        views: rows.length,
        uniques: uniques(rows),
        avgSeconds: Math.round(mean(rows.map((r) => r.duration_seconds))),
      };
    })
    .sort((a, b) => b.views - a.views);

  return {
    countries,
    regions,
    cities,
    placedViews: placeable.length,
    unplacedViews: total - placeable.length,
  };
}
