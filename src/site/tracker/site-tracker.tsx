"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { clickListener } from "@/lib/analytics/beacon/clicks";
import { sectionClock } from "@/lib/analytics/beacon/section-clock";
import { framed, send, uuid, visitorId } from "@/lib/analytics/beacon/transport";

// Site analytics, client side.
//
// Mounted once, in the site layout, so it runs on every public page and never
// on /statistics, which lives outside that layout. It records the view, counts
// how long the visitor actually spent reading, notes how far down they got,
// reports what they clicked, and measures which SECTIONS of the page they read
// and for how long. Sections are found automatically on every page (see
// lib/analytics/sections/discover.ts), so a new page is tracked by existing.
//
// It does not touch a cookie and does not identify anybody. Every send is
// fire-and-forget; see lib/analytics/beacon/transport.ts.

const TICK_SECONDS = 1;
const FLUSH_SECONDS = 15;
/** Sections per beacon. Keeps each body well under the endpoint's size cap on
 *  a page with many sections. */
const SECTIONS_PER_BEACON = 20;

/** The dashboard is not the site. Counting our own visits to /statistics would
 *  put the operator in their own numbers. Checked here as well as by where the
 *  tracker is mounted, so moving it cannot start counting them. The account
 *  pages sit inside the site's layout but are private, so they are left out
 *  too. */
const IGNORED = /^\/(statistics|sign-in|sign-up|auth|connect|dashboard|join)(\/|$)/;

export function SiteTracker() {
  const pathname = usePathname();

  // A fresh session per PATH, not per mount: a client-side navigation is a new
  // page view, and folding it into the previous one would attribute the second
  // page's reading time to the first.
  useEffect(() => {
    if (!pathname || IGNORED.test(pathname) || framed()) return;

    const base = (() => {
      const fields = { sessionId: uuid(), visitorId: visitorId(), path: pathname };
      return () => fields;
    })();
    const sections = sectionClock();
    let active = 0;
    let sent = 0;
    let scroll = 0;

    send({ ...base(), type: "view", referrer: document.referrer || null });

    /** Flush the running totals. On a timer, on tab-hide, and on unload. */
    const flush = (beacon = false) => {
      const readings = sections.drain();
      if (active - sent <= 0 && scroll === 0 && readings.length === 0) return;

      sent = active;
      send({ ...base(), type: "heartbeat", durationSeconds: active, maxScroll: scroll }, beacon);
      for (let i = 0; i < readings.length; i += SECTIONS_PER_BEACON) {
        const batch = readings.slice(i, i + SECTIONS_PER_BEACON);
        send({ ...base(), type: "sections", sections: batch }, beacon);
      }
    };

    // ACTIVE seconds, not wall-clock: a tab left open in the background for an
    // hour is not an hour of reading, and counting it would make every average
    // meaningless.
    const tick = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      active += TICK_SECONDS;
      sections.sample(TICK_SECONDS);
      if (active - sent >= FLUSH_SECONDS) flush();
    }, TICK_SECONDS * 1000);

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const pct = scrollable <= 0 ? 100 : Math.round((window.scrollY / scrollable) * 100);
      scroll = Math.max(scroll, Math.min(100, Math.max(0, pct)));
    };
    onScroll();
    // Mark what is on screen at load, so a visit shorter than the first tick
    // still records what it reached, but credit it no time because none has
    // passed. Skipped for a tab opened in the background, which has seen nothing.
    if (document.visibilityState === "visible") sections.sample(0);

    const onClick = clickListener(base);
    const onHide = () => {
      if (document.visibilityState === "hidden") flush(true);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, true);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);

    return () => {
      flush(true);
      window.clearInterval(tick);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, [pathname]);

  return null;
}
