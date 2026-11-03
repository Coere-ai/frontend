import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { anthropicFor, jevFor, problemFor } from "./refusals";

describe("refusals", () => {
  it("are problem details on most routes", async () => {
    const res = problemFor("rate_limited", 20);
    assert.equal(res.status, 429);
    assert.equal(res.headers.get("retry-after"), "20");
    assert.equal(((await res.json()) as { code: string }).code, "rate_limited");
    assert.equal(problemFor("signed_out", 20).headers.get("retry-after"), null);
    assert.equal(problemFor("unavailable").status, 503);
  });

  it("are Anthropic's shape on the proxy", async () => {
    const res = anthropicFor("usage_limit");
    assert.equal(res.status, 429);
    const body = (await res.json()) as { error: { details: { error_code: string } } };
    assert.equal(body.error.details.error_code, "enforced_spend_limit_reached");
    assert.equal(anthropicFor("rate_limited", 5).headers.get("retry-after"), "5");
    assert.equal(anthropicFor("suspended").status, 403);
  });

  it("are a plain error body on Jev", async () => {
    const res = jevFor("suspended");
    assert.equal(res.status, 403);
    assert.deepEqual(await res.json(), { error: "account_suspended" });
    assert.equal(jevFor("signed_out").status, 401);
    assert.equal(jevFor("rate_limited", 9).headers.get("retry-after"), "9");
  });
});
