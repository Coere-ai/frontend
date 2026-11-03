import type { ClickStat, OutboundStat, PageOption, PageStat, SectionStat } from "../types";

import type { EventRow, VisitRow } from "./rows";
import { sectionCountByPath, topSectionByPath } from "./sections";
import { groupBy, mean, uniques } from "./stats";

// Rollups over what people read and clicked: pages, picker options, clicks
// and outbound links.

/**
 * One row per page, most-viewed first.
 *
 * `sections` is the section rollup for the SAME visits, so each page can name
 * the part of it that held readers longest. `labelFor` names the page; it is
 * passed in because the registry that knows the names lives on the server.
 */
export function pageRollup(
  visits: VisitRow[],
  sections: SectionStat[],
  labelFor: (path: string) => string,
): PageStat[] {
  const top = topSectionByPath(sections);
  const counts = sectionCountByPath(sections);
  return [...groupBy(visits, (v) => v.path)]
    .map(([path, rows]): PageStat => {
      const conversions = rows.filter((r) => r.converted).length;
      return {
        path,
        label: labelFor(path),
        views: rows.length,
        uniques: uniques(rows),
        avgSeconds: Math.round(mean(rows.map((r) => r.duration_seconds))),
        avgScroll: Math.round(mean(rows.map((r) => r.max_scroll))),
        conversions,
        conversionRate: rows.length ? conversions / rows.length : 0,
        sectionCount: counts.get(path) ?? 0,
        topSection: top.get(path) ?? null,
      };
    })
    .sort((a, b) => b.views - a.views);
}

/** Pages with traffic first (busiest first), then known pages nobody has
 *  opened yet, so a page can be picked before its first visit. */
export function pageOptions(
  pages: PageStat[],
  known: readonly { path: string; label: string }[],
): PageOption[] {
  const out: PageOption[] = pages.map((p) => ({ path: p.path, label: p.label, views: p.views }));
  const listed = new Set(out.map((p) => p.path));
  for (const k of known) {
    if (!listed.has(k.path)) out.push({ path: k.path, label: k.label, views: 0 });
  }
  return out;
}

/** Clicks and conversions, split by page. The same label in the header and in
 *  the footer are two different buttons to whoever has to move one. */
export function clickRollup(events: EventRow[]): ClickStat[] {
  return [
    ...groupBy(
      events.filter((e) => e.kind === "click" || e.kind === "cta"),
      (e) => `${e.kind} ${e.path} ${e.label ?? ""}`,
    ),
  ]
    .map(([, rows]) => {
      const first = rows[0]!;
      return {
        label: first.label?.trim() || "Unlabeled",
        kind: first.kind as ClickStat["kind"],
        path: first.path,
        count: rows.length,
      };
    })
    .sort((a, b) => b.count - a.count);
}

/** Host only, for a table that stays readable when the URL is long. */
function hostOf(href: string): string {
  try {
    return new URL(href).host.toLowerCase();
  } catch {
    return href.startsWith("mailto:") ? "email" : href.slice(0, 60);
  }
}

/** Links off the site, grouped by destination. */
export function outboundRollup(events: EventRow[]): OutboundStat[] {
  return [...groupBy(events.filter((e) => e.kind === "outbound"), (e) => e.href ?? "")]
    .map(([href, rows]) => ({
      href,
      host: hostOf(href),
      label: rows[0]!.label?.trim() || href,
      count: rows.length,
    }))
    .sort((a, b) => b.count - a.count);
}
