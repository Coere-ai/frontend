import { sectionMeta, sectionOrder } from "@/lib/sections";

import type { SectionStat, TopSection } from "../types";

import type { SectionRow, VisitRow } from "./rows";
import { groupBy, uniques } from "./stats";

/** Where a section with no recorded position sorts: after every real one. */
const UNPLACED = 999;

/** The last non-null value in rows that are oldest first. The newest label is
 *  the one the page shows today, if a heading was renamed. */
function latest<T>(rows: SectionRow[], pick: (r: SectionRow) => T | null): T | null {
  for (let i = rows.length - 1; i >= 0; i--) {
    const v = pick(rows[i]!);
    if (v !== null && v !== undefined) return v;
  }
  return null;
}

/** A name and an order for rows written before labels existed. Only the
 *  home page is in the registry, so only its rows can be named this way. */
function fallbackLabel(path: string, id: string): string {
  return (path === "/" && sectionMeta(id)?.label) || id;
}
function fallbackPosition(path: string, id: string): number {
  return path === "/" && sectionMeta(id) ? sectionOrder(id) : UNPLACED;
}

/**
 * Roll section readings up per (page, section), ranked by reading time.
 *
 * `visits` is the set already chosen for this scope and audience. Section rows
 * carry no bot flag of their own, so they inherit their visit's: a row whose
 * visit is not in the set is someone else's audience, or outside the window,
 * and is dropped.
 *
 * Reach and share are measured against the section's OWN page. Dividing by
 * every visit on the site would let blog traffic quietly drag down the reach
 * of a product page section, and the number would fall while nothing about it changed.
 */
export function sectionRollup(rows: SectionRow[], visits: VisitRow[]): SectionStat[] {
  const sessions = new Set(visits.map((v) => v.session_id));
  const mine = rows.filter((r) => sessions.has(r.session_id));

  const visitsByPath = new Map<string, number>();
  for (const v of visits) visitsByPath.set(v.path, (visitsByPath.get(v.path) ?? 0) + 1);
  const secondsByPath = new Map<string, number>();
  for (const r of mine) secondsByPath.set(r.path, (secondsByPath.get(r.path) ?? 0) + r.seconds);

  return [...groupBy(mine, (r) => `${r.path}\u0000${r.section}`)]
    .map(([, rs]): SectionStat => {
      const { path, section: id } = rs[0]!;
      const seconds = rs.reduce((a, r) => a + r.seconds, 0);
      const readers = new Set(rs.map((r) => r.session_id)).size;
      const pageVisits = visitsByPath.get(path) ?? 0;
      const pageSeconds = secondsByPath.get(path) ?? 0;
      return {
        path,
        id,
        label: latest(rs, (r) => r.label) ?? fallbackLabel(path, id),
        position: latest(rs, (r) => r.position) ?? fallbackPosition(path, id),
        views: readers,
        uniques: uniques(rs),
        totalSeconds: seconds,
        // Averaged over the visits that REACHED the section: folding in the
        // zeroes of everyone who never scrolled there would make a well-read
        // section look skimmed.
        avgSeconds: rs.length ? Math.round(seconds / rs.length) : 0,
        share: pageSeconds ? seconds / pageSeconds : 0,
        // Capped at 1: the beacons are independent, so a section row can land
        // without its view row in the window, and 104% would read as a bug.
        reach: pageVisits ? Math.min(1, readers / pageVisits) : 0,
      };
    })
    .sort((a, b) => b.totalSeconds - a.totalSeconds || a.position - b.position);
}

/** The most-read section of each page, keyed by path. */
export function topSectionByPath(stats: SectionStat[]): Map<string, TopSection> {
  const out = new Map<string, TopSection>();
  // `stats` is ranked, so the first row seen for a path is its top section.
  for (const s of stats) {
    if (out.has(s.path) || s.totalSeconds <= 0) continue;
    out.set(s.path, { id: s.id, label: s.label, totalSeconds: s.totalSeconds });
  }
  return out;
}

/** Distinct sections recorded per page. */
export function sectionCountByPath(stats: SectionStat[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const s of stats) out.set(s.path, (out.get(s.path) ?? 0) + 1);
  return out;
}
