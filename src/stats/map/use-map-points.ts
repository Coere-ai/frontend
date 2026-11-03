"use client";

import { useMemo } from "react";

import type { CityStat } from "@/lib/analytics/types";

import { project } from "./world-shapes";

/** Area, not radius, carries the value: scaling the radius directly makes ten
 *  times the traffic look a hundred times larger. */
const radiusFor = (views: number, max: number) => 2.5 + 9 * Math.sqrt(views / max);

/** One point per city, largest first, so the smallest land last in the DOM and
 *  stay clickable when they sit inside a bigger city's circle. */
export function useCityPoints(cities: CityStat[] | undefined) {
  return useMemo(() => {
    const list = cities ?? [];
    if (!list.length) return [];
    const max = Math.max(...list.map((c) => c.views), 1);
    return [...list]
      .sort((a, b) => b.views - a.views)
      .map((c) => ({ c, ...project(c.latitude, c.longitude), r: radiusFor(c.views, max) }));
  }, [cities]);
}

/**
 * One point per subdivision, at the view-weighted centroid of its cities.
 *
 * The map ships country outlines only, so there is no subdivision shape to
 * shade, and inventing one place per region would put California somewhere
 * arbitrary. A centroid of the cities we actually saw traffic from is a claim
 * the data supports, and a region with most of its traffic in one city sits on
 * that city rather than in the middle of the ones it barely saw.
 */
export function useRegionPoints(cities: CityStat[] | undefined) {
  return useMemo(() => {
    const list = (cities ?? []).filter((c) => c.region && c.country);
    if (!list.length) return [];
    const acc = new Map<
      string,
      { country: string; region: string; views: number; lat: number; lon: number; w: number }
    >();
    for (const c of list) {
      const key = `${c.country}|${c.region}`;
      // A city with no recorded views still marks a place, so it counts for at
      // least one: weight zero would drop it out of the centroid entirely.
      const w = Math.max(c.views, 1);
      const prev = acc.get(key);
      if (prev) {
        prev.views += c.views;
        prev.lat += c.latitude * w;
        prev.lon += c.longitude * w;
        prev.w += w;
      } else {
        acc.set(key, { country: c.country, region: c.region, views: c.views, lat: c.latitude * w, lon: c.longitude * w, w });
      }
    }
    // Divide the weighted sums back down by the weights that built them.
    const rows = [...acc.values()].map((r) => ({ ...r, lat: r.lat / r.w, lon: r.lon / r.w }));
    const max = Math.max(...rows.map((r) => r.views), 1);
    return rows
      .sort((a, b) => b.views - a.views)
      .map((r) => ({ r, ...project(r.lat, r.lon), radius: radiusFor(r.views, max) }));
  }, [cities]);
}
