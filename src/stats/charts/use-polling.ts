import { useEffect } from "react";

// Auto-refresh for the dashboard. Polls `load({ silent: true })`
// on an interval, but ONLY while the tab is visible, a backgrounded or
// minimised tab (or one left open overnight) stops polling and resumes
// (with an immediate refresh) the moment it becomes visible again.
//
// `load` must be a stable reference (wrap it in useCallback) so the
// effect doesn't re-subscribe on every render.
export function usePolling(
  load: (opts?: { silent?: boolean }) => void,
  intervalMs = 30000,
) {
  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) load({ silent: true });
    }, intervalMs);

    const onVisible = () => {
      if (!document.hidden) load({ silent: true });
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [load, intervalMs]);
}
