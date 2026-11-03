import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { anthropicError, anthropicErrorBody } from "./errors";

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

  it("sets retry-after on a rate limit and tells the client not to retry a refusal", () => {
    const limited = anthropicError("rate_limited", { retryAfter: 30 });
    assert.equal(limited.headers.get("retry-after"), "30");
    assert.equal(limited.headers.get("x-should-retry"), null);
    assert.equal(anthropicError("signed_out").headers.get("x-should-retry"), "false");
  });
});
