import assert from "node:assert/strict";
import { test } from "node:test";

import { joinUsers, monthKey, numOrNull, toPlans } from "./user-rows";

const profile = {
  id: "u1",
  email: "a@example.com",
  username: "ada",
  plan_id: "free",
  status: "active",
  created_at: "2026-11-01T10:00:00Z",
  last_seen_at: null,
};

test("each column comes from its own table", () => {
  const [row] = joinUsers([{ ...profile, monthly_limit_micros: "20000000", lifetime_limit_micros: null }], {
    members: [{ user_id: "u1", org_id: "o1", role: "admin", org_name: "Acme" }],
    devices: [{ user_id: "u1" }, { user_id: "u1" }, { user_id: "u2" }],
    month: [{ user_id: "u1", requests: 4, cost_micros: "1500" }],
    totals: [{ user_id: "u1", tokens_saved: "9000", cost_micros: "8000" }],
    files: [{ user_id: "u1", bytes: 2048 }],
  });
  assert.deepEqual(row?.org, { id: "o1", name: "Acme", role: "admin" });
  assert.equal(row?.devices, 2);
  assert.equal(row?.monthCostMicros, 1500);
  assert.equal(row?.monthRequests, 4);
  assert.equal(row?.lifetimeCostMicros, 8000);
  assert.equal(row?.tokensSaved, 9000);
  assert.equal(row?.memoryBytes, 2048);
  assert.equal(row?.monthlyLimitMicros, 20_000_000);
  assert.equal(row?.lifetimeLimitMicros, null);
});

test("an account with no other rows reads zero and no organization", () => {
  const [row] = joinUsers([profile], { members: [], devices: [], month: [], totals: [], files: [] });
  assert.equal(row?.org, null);
  assert.equal(row?.devices, 0);
  assert.equal(row?.lifetimeCostMicros, 0);
  assert.equal(row?.monthlyLimitMicros, null);
});

test("a limit of zero is a limit, not the plan's", () => {
  assert.equal(numOrNull(0), 0);
  assert.equal(numOrNull("0"), 0);
  assert.equal(numOrNull(null), null);
  assert.equal(numOrNull(undefined), null);
});

test("plans keep a null lifetime limit as none, and carry the daily and first build limits", () => {
  assert.deepEqual(
    toPlans([
      { id: "free", name: "Free", monthly_limit_micros: "5000000", lifetime_limit_micros: null, daily_limit_micros: null, first_build_limit_micros: 10_000_000 },
      { id: "plus", name: "Plus", monthly_limit_micros: 20_000_000, daily_limit_micros: "2000000", first_build_limit_micros: "10000000" },
    ]),
    [
      { id: "free", name: "Free", monthlyLimitMicros: 5_000_000, lifetimeLimitMicros: null, dailyLimitMicros: null, firstBuildLimitMicros: 10_000_000 },
      { id: "plus", name: "Plus", monthlyLimitMicros: 20_000_000, lifetimeLimitMicros: null, dailyLimitMicros: 2_000_000, firstBuildLimitMicros: 10_000_000 },
    ],
  );
});

test("an account's own daily limits and its first build are kept, null when unset", () => {
  const parts = { members: [], devices: [], month: [], totals: [], files: [] };
  const [own] = joinUsers([{ ...profile, daily_limit_micros: "3000000", first_build_limit_micros: "0", first_build_at: "2026-11-02T10:00:00Z" }], parts);
  assert.deepEqual([own?.dailyLimitMicros, own?.firstBuildLimitMicros, own?.firstBuildAt], [3_000_000, 0, "2026-11-02T10:00:00Z"]);
  const [plain] = joinUsers([profile], parts);
  assert.deepEqual([plain?.dailyLimitMicros, plain?.firstBuildLimitMicros, plain?.firstBuildAt], [null, null, null]);
});

test("the month is the first of the month in UTC", () => {
  assert.equal(monthKey(Date.parse("2026-11-30T23:59:59Z")), "2026-11-01");
  assert.equal(monthKey(Date.parse("2026-01-01T00:00:00Z")), "2026-01-01");
});
