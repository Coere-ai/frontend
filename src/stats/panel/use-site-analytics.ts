"use client";

import { useCallback, useEffect, useState } from "react";

import type { HourlyTraffic } from "@/lib/analytics/query/timeline";
import type { Audience, SiteAnalytics } from "@/lib/analytics/types";

import { usePolling } from "../charts/use-polling";

/** How often the open dashboard refreshes itself. */
export const POLL_MS = 60_000;

type Result =
  | { ok: true; analytics: SiteAnalytics; hourly: HourlyTraffic | null }
  | { ok: false; error: string };

/** One request to the data route. Never throws: a failure is a result too. */
async function fetchPayload(days: number, audience: Audience, page: string | null): Promise<Result> {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const query = new URLSearchParams({ days: String(days), tz, audience });
    if (page) query.set("page", page);
    const res = await fetch(`/api/statistics/data?${query}`, { cache: "no-store" });
    const body = (await res.json().catch(() => ({}))) as {
      analytics?: SiteAnalytics;
      hourlySeries?: HourlyTraffic;
      error?: string;
    };
    // The route's own words when it has them ("Analytics storage is not
    // configured."), which say what to fix; a generic line otherwise.
    if (!res.ok || !body.analytics) return { ok: false, error: body.error || "Could not load site analytics." };
    // A payload without the hourly bundle simply leaves the chart on its
    // daily fallback.
    return { ok: true, analytics: body.analytics, hourly: body.hourlySeries ?? null };
  } catch {
    return { ok: false, error: "Could not load site analytics." };
  }
}

/**
 * Load the dashboard's payload for one range, audience and page scope.
 *
 * Refetches when any of the three changes, and quietly every minute while the
 * tab is open. Every load keeps the current numbers on screen until the new
 * ones arrive, so the page never flashes back to "Loading". An answer to a
 * choice that has since changed is dropped, so a slow reply about the whole
 * site cannot land on top of the page that was picked after it.
 */
export function useSiteAnalytics(days: number, audience: Audience, page: string | null) {
  const [data, setData] = useState<SiteAnalytics | null>(null);
  const [hourly, setHourly] = useState<HourlyTraffic | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback((r: Result) => {
    if (r.ok) {
      setData(r.analytics);
      setHourly(r.hourly);
      setError(null);
    } else {
      setError(r.error);
    }
  }, []);

  const load = useCallback(() => {
    void fetchPayload(days, audience, page).then(apply);
  }, [days, audience, page, apply]);

  useEffect(() => {
    let live = true;
    void fetchPayload(days, audience, page).then((r) => {
      if (live) apply(r);
    });
    return () => {
      live = false;
    };
  }, [days, audience, page, apply]);
  usePolling(load, POLL_MS);

  // Loading only until the first answer, good or bad.
  const loading = data === null && error === null;
  return { data, hourly, loading, error, reload: load };
}
