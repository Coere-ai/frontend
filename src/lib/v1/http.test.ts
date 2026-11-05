import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { json, noContent, problem, problemBody, PROBLEMS, refusal } from "./http";

describe("problem", () => {
  it("answers problem details with the code's status", async () => {
    const res = problem("usage_limit");
    assert.equal(res.status, 429);
    assert.equal(res.headers.get("content-type"), "application/problem+json");
    assert.deepEqual(await res.json(), {
      type: "https://www.coere.ai/docs/errors#usage_limit",
      title: "Monthly limit reached",
      status: 429,
      code: "usage_limit",
    });
  });

  it("matches the table of section 8", () => {
    const statuses = Object.fromEntries(Object.entries(PROBLEMS).map(([k, v]) => [k, v.status]));
    assert.deepEqual(statuses, {
      signed_out: 401,
      suspended: 403,
      invalid_grant: 400,
      bad_request: 400,
      not_found: 404,
      memory_sync_off: 409,
      refused: 409,
      sensitive_off: 412,
      too_large: 413,
      rate_limited: 429,
      usage_limit: 429,
      unavailable: 503,
    });
    assert.equal(problemBody("not_found").code, "not_found");
  });

  it("sets retry-after in whole seconds, at least 1", () => {
    assert.equal(problem("rate_limited", 12.2).headers.get("retry-after"), "13");
    assert.equal(problem("rate_limited", 0).headers.get("retry-after"), "1");
    assert.equal(problem("rate_limited").headers.get("retry-after"), null);
  });
});

describe("refusal", () => {
  it("is a 409 problem that names the rule and the line to show", async () => {
    const res = refusal("last_admin", "An organization needs an admin.");
    assert.equal(res.status, 409);
    assert.equal(res.headers.get("content-type"), "application/problem+json");
    assert.deepEqual(await res.json(), {
      type: "https://www.coere.ai/docs/errors#refused",
      title: "Not allowed",
      status: 409,
      code: "refused",
      reason: "last_admin",
      detail: "An organization needs an admin.",
    });
  });
});

describe("every answer", () => {
  it("is not cached, not indexed and has no CORS headers", () => {
    for (const res of [json({ a: 1 }), noContent(), problem("signed_out"), refusal("self", "x")]) {
      assert.equal(res.headers.get("cache-control"), "no-store");
      assert.equal(res.headers.get("x-robots-tag"), "noindex");
      assert.equal(res.headers.get("access-control-allow-origin"), null);
    }
    assert.equal(noContent().status, 204);
  });
});
