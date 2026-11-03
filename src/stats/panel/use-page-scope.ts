"use client";

import { useCallback, useState } from "react";

const PARAM = "page";

/**
 * The page the dashboard is scoped to, kept in the address bar.
 *
 * `/admin/analytics?page=/products/connect` opens straight on that page, so a scoped
 * view can be bookmarked or sent to a colleague. Read once, on the first
 * client render, and written back with replaceState so picking pages does not
 * pile up history entries. The server render has no address bar and starts
 * site-wide, which is harmless: it only ever draws the loading line.
 */
export function usePageScope(): [string | null, (path: string | null) => void] {
  const [page, setPage] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const initial = new URLSearchParams(window.location.search).get(PARAM);
    return initial && initial.startsWith("/") ? initial : null;
  });

  const choose = useCallback((path: string | null) => {
    setPage(path);
    const url = new URL(window.location.href);
    if (path) url.searchParams.set(PARAM, path);
    else url.searchParams.delete(PARAM);
    window.history.replaceState(null, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return [page, choose];
}
