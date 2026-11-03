import "server-only";

import { HOURLY_WINDOW_DAYS } from "@/lib/time-series";

import { knownPages, pageLabel } from "../pages";
import { referrerLabel } from "../referrers";
import type { Audience, SiteAnalytics } from "../types";

import { clickRollup, outboundRollup, pageOptions, pageRollup } from "./content";
import { fetchAll, fetchSections, lifetimeViews } from "./fetch";
import { breakdown, geoRollup, totalsOf } from "./rollups";
import { EVENT_COLUMNS, VISIT_COLUMNS, type EventRow, type VisitRow } from "./rows";
import { sectionRollup } from "./sections";
import { dailySeries, hourlyTraffic, todayByHour, type HourlyTraffic } from "./timeline";

// Reading the analytics.
//
// One pass over the rows in the window, rolled up in TypeScript. This is one
// marketing site and the window is at most a year of its own traffic, so a
// hand-written SQL aggregate per panel would be hundreds of lines to maintain
// for a table that will not outgrow this. Every rollup reads the same rows, so
// any of them can move into Postgres later without changing the wire contract.
//
// SCOPE. With a path, every number is about that one page: its visits, its
// clicks, its geography, its sections. The page list and the picker options
// are always site-wide, because they are how you choose a scope.

export type { HourlyTraffic } from "./timeline";

export type AnalyticsPayload = {
  analytics: SiteAnalytics;
  hourlySeries: HourlyTraffic;
};

const DAY_MS = 86_400_000;

export async function loadSiteAnalytics(
  days: number,
  tz: string,
  audience: Audience,
  path: string | null = null,
): Promise<AnalyticsPayload> {
  const now = new Date();
  // Read far enough back for both the window and the hourly chart's 31 days.
  const since = new Date(now.getTime() - Math.max(days, HOURLY_WINDOW_DAYS) * DAY_MS);
  const windowStart = now.getTime() - days * DAY_MS;
  const sinceIso = since.toISOString();

  const [siteVisits, siteEvents, siteSections, lifetime] = await Promise.all([
    fetchAll<VisitRow>("site_visits", VISIT_COLUMNS, sinceIso, audience),
    fetchAll<EventRow>("site_events", EVENT_COLUMNS, sinceIso, audience),
    fetchSections(sinceIso, audience),
    lifetimeViews(audience, path),
  ]);

  const at = (iso: string) => new Date(iso).getTime();
  const inWindow = <T extends { created_at: string }>(rows: T[]) =>
    rows.filter((r) => at(r.created_at) >= windowStart);
  const inScope = <T extends { path: string }>(rows: T[]) =>
    path ? rows.filter((r) => r.path === path) : rows;

  // Site-wide, for the page table and the picker.
  const siteWindow = inWindow(siteVisits);
  const allSections = sectionRollup(siteSections, siteWindow);
  const pages = pageRollup(siteWindow, allSections, pageLabel);

  // Scoped, for everything else.
  const scoped = inScope(siteVisits);
  const visits = inScope(siteWindow);
  const events = inScope(inWindow(siteEvents));
  const last24 = scoped.filter((v) => at(v.created_at) >= now.getTime() - DAY_MS);
  const prev24 = scoped.filter((v) => {
    const t = at(v.created_at);
    return t >= now.getTime() - 2 * DAY_MS && t < now.getTime() - DAY_MS;
  });

  const analytics: SiteAnalytics = {
    window: { days, tz, since: new Date(windowStart).toISOString(), until: now.toISOString() },
    scope: path,
    lifetimeViews: lifetime,
    totals: totalsOf(visits),
    last24h: totalsOf(last24),
    previous24h: totalsOf(prev24),
    daily: dailySeries(visits, days, tz, now),
    hourly: todayByHour(visits, tz, now),
    pages,
    pageOptions: pageOptions(pages, knownPages()),
    // Sections from different pages are not comparable, so the site-wide view
    // carries none; the page table names each page's top section instead.
    sections: path ? allSections.filter((s) => s.path === path) : [],
    clicks: clickRollup(events),
    outbound: outboundRollup(events),
    geo: geoRollup(visits),
    audience,
    devices: breakdown(visits, (v) => v.device ?? "", (k) => k || "Unknown"),
    browsers: breakdown(visits, (v) => v.browser ?? "", (k) => k || "Unknown"),
    operatingSystems: breakdown(visits, (v) => v.os ?? "", (k) => k || "Unknown"),
    referrers: breakdown(visits, (v) => v.referrer ?? "", referrerLabel),
  };

  return { analytics, hourlySeries: hourlyTraffic(scoped, tz, now) };
}
