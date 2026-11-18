import assert from "node:assert/strict";
import { test } from "node:test";

import type { VisitRow } from "./rows";
import { dailySeries } from "./timeline";

const visit = (created_at: string): VisitRow => ({
  session_id: created_at,
  visitor_id: created_at,
  path: "/",
  referrer: null,
  device: null,
  browser: null,
  os: null,
  country: null,
  region: null,
  city: null,
  latitude: null,
  longitude: null,
  duration_seconds: 0,
  max_scroll: 0,
  converted: false,
  cta_clicks: 0,
  created_at,
});

test("the last hour of a 25 hour day names each day of the week once", () => {
  // 23:30 on 1 November 2026 in New York, the day the clocks went back.
  const now = new Date("2026-11-02T04:30:00Z");
  const days = dailySeries([visit("2026-11-01T12:00:00Z")], 7, "America/New_York", now).map((d) => d.date);
  assert.deepEqual(days, ["2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01"]);
});

test("the first hour after a 23 hour day still names that day", () => {
  // 00:30 on 9 March 2026 in New York, the day after the clocks went forward.
  const now = new Date("2026-03-09T04:30:00Z");
  const days = dailySeries([], 3, "America/New_York", now).map((d) => d.date);
  assert.deepEqual(days, ["2026-03-07", "2026-03-08", "2026-03-09"]);
});

test("a visit counts on its own local day", () => {
  const now = new Date("2026-11-18T12:00:00Z");
  const series = dailySeries([visit("2026-11-18T03:00:00Z")], 2, "America/Los_Angeles", now);
  assert.deepEqual(series.map((d) => [d.date, d.views]), [["2026-11-17", 1], ["2026-11-18", 0]]);
});
