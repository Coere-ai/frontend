"use client";

import { useCallback, useEffect, useState } from "react";

import { usePolling } from "@/stats/charts/use-polling";

/** How often an open admin page refreshes itself. */
export const ADMIN_POLL_MS = 60_000;

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

/** One request to an admin data route. Never throws: a failure is a result too. */
async function fetchJson<T>(url: string): Promise<Result<T>> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const body = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
    if (res.status === 404) return { ok: false, error: "Not found. Sign in again if this keeps happening." };
    if (!res.ok || body === null) return { ok: false, error: body?.error || "Could not load this page." };
    return { ok: true, data: body };
  } catch {
    return { ok: false, error: "Could not load this page." };
  }
}

/**
 * Loads one admin data route and keeps it fresh: again whenever `url`
 * changes, quietly every minute while the tab is open, and on `reload`
 * (after an action). The last good answer stays on screen while a new one
 * loads, and an answer for a url that has since changed is dropped.
 * `poll: false` is for routes with a side effect, like opening a graph.
 */
export function useAdminData<T>(url: string | null, o: { poll?: boolean } = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!url) return;
    let live = true;
    void fetchJson<T>(url).then((r) => {
      if (!live) return;
      if (r.ok) {
        setData(r.data);
        setError(null);
      } else setError(r.error);
    });
    return () => {
      live = false;
    };
  }, [url, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const poll = o.poll !== false;
  const quiet = useCallback(() => {
    if (poll) reload();
  }, [poll, reload]);
  usePolling(quiet, ADMIN_POLL_MS);

  return { data, error, loading: url !== null && data === null && error === null, reload };
}
