// The tracker's plumbing: ids, framing, and the send itself.
//
// Everything here is best-effort. A tracking failure must never affect the
// page, so every call is wrapped and every failure is silent.

const TRACK_URL = "/api/site/track";
const VISITOR_KEY = "coere_vid";

export function uuid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** A random id kept in localStorage. Its only job is to tell a returning
 *  browser from a new one; it is not a cookie and identifies nobody. */
export function visitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const fresh = uuid();
    localStorage.setItem(VISITOR_KEY, fresh);
    return fresh;
  } catch {
    // Private mode, or storage disabled. A per-load id still records the visit;
    // it just cannot be recognised as a return.
    return uuid();
  }
}

/** True when this document is inside a frame.
 *
 *  The statistics dashboard previews the live pages in small frames. Those are
 *  the operator looking at their own site, not traffic, and counting them would
 *  make the dashboard change the numbers it is reporting. */
export function framed(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    // A cross-origin parent throws on access, which itself means we are framed.
    return true;
  }
}

/** POST, or sendBeacon when the page is going away. Beacon is the only
 *  transport that survives an unload. */
export function send(body: Record<string, unknown>, beacon = false): void {
  const json = JSON.stringify(body);
  try {
    if (beacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(TRACK_URL, new Blob([json], { type: "text/plain" }));
      return;
    }
    void fetch(TRACK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: json,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* tracking never throws into the page */
  }
}
