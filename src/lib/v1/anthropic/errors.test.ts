import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { anthropicError, anthropicErrorBody, holdRefusedAnswer } from "./errors";

describe("anthropicError", () => {
  it("answers each case of 8.4 with its status and Anthropic's body", async () => {
    const cases: Array<[Parameters<typeof anthropicError>[0], number, string, string]> = [
      ["signed_out", 401, "authentication_error", "signed_out"],
      ["suspended", 403, "permission_error", "account_suspended"],
      ["rate_limited", 429, "rate_limit_error", "rate_limited"],
      ["beta", 400, "invalid_request_error", "Unexpected value(s) for the `anthropic-beta` header."],
      ["too_large", 413, "request_too_large", "request_too_large"],
      ["unavailable", 503, "api_error", "unavailable"],
    ];
    for (const [c, status, type, message] of cases) {
      const res = anthropicError(c);
      assert.equal(res.status, status, c);
      assert.deepEqual(await res.json(), { type: "error", error: { type, message } });
      assert.equal(res.headers.get("cache-control"), "no-store");
    }
  });

  it("answers a spent limit with Anthropic's spend limit 400, naming the limit", () => {
    assert.deepEqual(anthropicErrorBody("usage_limit"), {
      type: "error",
      error: { type: "invalid_request_error", message: "You have reached your specified monthly usage limit on coere.ai." },
    });
    assert.deepEqual(anthropicErrorBody("usage_limit", undefined, "lifetime"), {
      type: "error",
      error: { type: "invalid_request_error", message: "You have reached your specified lifetime usage limit on coere.ai." },
    });
    const res = anthropicError("usage_limit", { limit: "lifetime" });
    assert.equal(res.status, 400);
    assert.equal(res.headers.get("x-should-retry"), "false");
  });

  it("names a refused model", () => {
    assert.deepEqual(anthropicErrorBody("model", "claude-2"), {
      type: "error",
      error: { type: "not_found_error", message: "model: claude-2" },
    });
  });

  it("names what refused every 429, and puts no marker on any other answer", () => {
    assert.equal(anthropicError("rate_limited", { retryAfter: 30 }).headers.get("x-coere-limit"), "per-minute");
    for (const source of ["spend-pending", "per-minute", "concurrency", "upstream"] as const) {
      assert.equal(anthropicError("rate_limited", { retryAfter: 2, source }).headers.get("x-coere-limit"), source);
    }
    for (const c of ["signed_out", "suspended", "usage_limit", "model", "beta", "too_large", "unavailable", "not_found", "bad_request", "upstream"] as const) {
      const res = anthropicError(c);
      assert.notEqual(res.status, 429, c);
      assert.equal(res.headers.get("x-coere-limit"), null, c);
    }
  });

  it("sets retry-after on a rate limit and tells the client not to retry a refusal", () => {
    const limited = anthropicError("rate_limited", { retryAfter: 30 });
    assert.equal(limited.headers.get("retry-after"), "30");
    assert.equal(limited.headers.get("x-should-retry"), null);
    assert.equal(anthropicError("signed_out").headers.get("x-should-retry"), "false");
  });
});

describe("holdRefusedAnswer", () => {
  it("answers a pending hold as a 10 s wait marked spend-pending", async () => {
    const res = holdRefusedAnswer("pending");
    assert.equal(res.status, 429);
    assert.equal(res.headers.get("retry-after"), "10");
    assert.equal(res.headers.get("x-coere-limit"), "spend-pending");
    assert.equal(res.headers.get("x-should-retry"), null);
    assert.deepEqual(await res.json(), { type: "error", error: { type: "rate_limit_error", message: "rate_limited" } });
  });

  it("answers a concurrency hold as a 2 s wait marked concurrency", () => {
    const res = holdRefusedAnswer("concurrency");
    assert.equal(res.status, 429);
    assert.equal(res.headers.get("retry-after"), "2");
    assert.equal(res.headers.get("x-coere-limit"), "concurrency");
  });

  it("answers each spent limit as Anthropic's spend limit 400 with no marker", async () => {
    for (const limit of ["lifetime", "first_build", "monthly", "daily"] as const) {
      const res = holdRefusedAnswer(limit);
      assert.equal(res.status, 400, limit);
      assert.equal(res.headers.get("x-coere-limit"), null, limit);
      assert.equal(res.headers.get("x-should-retry"), "false", limit);
      assert.deepEqual(await res.json(), anthropicErrorBody("usage_limit", undefined, limit));
    }
  });

  it("answers a reserve_spend it could not ask as unavailable", () => {
    const res = holdRefusedAnswer(null);
    assert.equal(res.status, 503);
    assert.equal(res.headers.get("x-coere-limit"), null);
  });
});
