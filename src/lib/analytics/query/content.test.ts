import assert from "node:assert/strict";
import { test } from "node:test";

import { pageOptions } from "./content";
import type { PageStat } from "../types";

const page = (path: string, views: number): PageStat => ({
  path, label: path, views, uniques: views, avgSeconds: 0, avgScroll: 0,
  conversions: 0, conversionRate: 0, sectionCount: 0, topSection: null,
});

test("pageOptions lists visited pages first, then known pages with no traffic", () => {
  const out = pageOptions([page("/", 10)], [
    { path: "/", label: "Home" },
    { path: "/investment-memo", label: "Investment memo" },
  ]);
  assert.deepEqual(out, [
    { path: "/", label: "/", views: 10 },
    { path: "/investment-memo", label: "Investment memo", views: 0 },
  ]);
});
