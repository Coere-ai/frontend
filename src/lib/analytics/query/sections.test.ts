import assert from "node:assert/strict";
import { test } from "node:test";

import type { SectionRow, VisitRow } from "./rows";
import { sectionRollup, topSectionByPath } from "./sections";

const T = "2026-10-01T00:00:00Z";

function visit(session: string, path: string): VisitRow {
  return {
    session_id: session, visitor_id: `v-${session}`, path, referrer: null, device: null,
    browser: null, os: null, country: null, region: null, city: null, latitude: null,
    longitude: null, duration_seconds: 0, max_scroll: 0, converted: false, cta_clicks: 0,
    created_at: T,
  };
}

function row(session: string, path: string, section: string, seconds: number,
  label: string | null = null, position: number | null = null): SectionRow {
  return { session_id: session, visitor_id: `v-${session}`, path, section, seconds, label, position, created_at: T };
}

test("reach and share are measured against the section's own page", () => {
  const visits = [visit("a", "/investment-memo"), visit("b", "/investment-memo"), visit("c", "/"), visit("d", "/")];
  const stats = sectionRollup(
    [
      row("a", "/investment-memo", "section-04", 30, "Our technology", 4),
      row("b", "/investment-memo", "section-04", 10, "Our technology", 4),
      row("a", "/investment-memo", "section-09", 10, "Vision", 9),
      row("c", "/", "hero", 5),
    ],
    visits,
  );
  const tech = stats.find((s) => s.id === "section-04")!;
  assert.equal(tech.reach, 1);
  assert.equal(tech.share, 0.8);
  assert.equal(tech.avgSeconds, 20);
  assert.equal(stats.find((s) => s.id === "section-09")!.reach, 0.5);
  // Landing page rows from before labels existed fall back to the registry.
  const hero = stats.find((s) => s.id === "hero")!;
  assert.equal(hero.label, "Hero");
  assert.equal(hero.position, 0);
  assert.equal(hero.reach, 0.5);
});

test("rows from visits outside the chosen set are dropped", () => {
  const stats = sectionRollup([row("ghost", "/", "hero", 50)], [visit("a", "/")]);
  assert.deepEqual(stats, []);
});

test("the newest label wins when a heading was renamed", () => {
  const stats = sectionRollup(
    [row("a", "/x", "intro", 1, "Old name", 0), row("b", "/x", "intro", 1, "New name", 0)],
    [visit("a", "/x"), visit("b", "/x")],
  );
  assert.equal(stats[0]!.label, "New name");
});

test("topSectionByPath picks each page's most-read section", () => {
  const visits = [visit("a", "/p"), visit("b", "/q")];
  const top = topSectionByPath(
    sectionRollup([row("a", "/p", "one", 5), row("a", "/p", "two", 9), row("b", "/q", "x", 0)], visits),
  );
  assert.equal(top.get("/p")!.id, "two");
  assert.equal(top.has("/q"), false);
});
