import assert from "node:assert/strict";
import { test } from "node:test";

import { summarizeSecurity } from "./security-summary";

const NOW = Date.parse("2026-11-03T12:00:00Z");

test("sign ins and failures land on their UTC day", () => {
  const { daily, counts } = summarizeSecurity(
    [
      { kind: "sign_in", created_at: "2026-11-03T01:00:00Z" },
      { kind: "sign_in", created_at: "2026-11-02T23:59:00Z" },
      { kind: "sign_in_failed", created_at: "2026-11-03T02:00:00Z" },
      { kind: "admin_sign_in_failed", created_at: "2026-11-03T03:00:00Z" },
      { kind: "token_rejected", created_at: "2026-11-03T04:00:00Z" },
    ],
    2,
    NOW,
  );
  assert.deepEqual(daily, [
    { date: "2026-11-02", signIns: 1, failures: 0, adminFailures: 0 },
    { date: "2026-11-03", signIns: 1, failures: 1, adminFailures: 1 },
  ]);
  assert.equal(counts.token_rejected, 1);
  assert.equal(counts.sign_in, 2);
});

test("events outside the window are not counted", () => {
  const { counts } = summarizeSecurity([{ kind: "rate_limited", created_at: "2026-10-01T00:00:00Z" }, { kind: "rate_limited", created_at: "nonsense" }], 7, NOW);
  assert.equal(counts.rate_limited, undefined);
});
