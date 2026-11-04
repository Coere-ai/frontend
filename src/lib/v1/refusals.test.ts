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

  it("are a usage_limit 429 for either spent limit, titled by the limit", async () => {
    const month = problemFor("usage_limit", 100);
    assert.equal(month.status, 429);
    assert.equal(month.headers.get("retry-after"), "100");
    assert.deepEqual(await month.json(), {
      type: "https://www.coere.ai/docs/errors#usage_limit", title: "Monthly limit reached", status: 429, code: "usage_limit",
    });
    const life = (await problemFor("usage_limit", 3600, "lifetime").json()) as { title: string; code: string };
    assert.deepEqual([life.title, life.code], ["Lifetime limit reached", "usage_limit"]);
    assert.equal((await jevFor("usage_limit", 3600).json() as { error: string }).error, "usage_limit");
  });

  it("title a spent day, or a spent first build, as the daily limit", async () => {
    const day = problemFor("usage_limit", 7200, "daily");
    assert.equal(day.status, 429);
    assert.equal(day.headers.get("retry-after"), "7200");
    assert.deepEqual(await day.json(), {
      type: "https://www.coere.ai/docs/errors#usage_limit", title: "Daily limit reached", status: 429, code: "usage_limit",
    });
    assert.equal(((await problemFor("usage_limit", 3600, "first_build").json()) as { title: string }).title, "Daily limit reached");
    const jev = jevFor("usage_limit", 7200);
    assert.deepEqual([jev.status, jev.headers.get("retry-after")], [429, "7200"]);
  });

  it("are Anthropic's shape on the proxy", async () => {
    const res = anthropicFor("usage_limit", 3600, "lifetime");
    assert.equal(res.status, 400);
    const body = (await res.json()) as { error: { type: string; message: string } };
    assert.equal(body.error.type, "invalid_request_error");
    assert.ok(body.error.message.startsWith("You have reached your specified lifetime"));
    const month = (await anthropicFor("usage_limit").json()) as { error: { message: string } };
    assert.ok(month.error.message.startsWith("You have reached your specified monthly"));
    for (const limit of ["daily", "first_build"] as const) {
      const day = anthropicFor("usage_limit", 7200, limit);
      assert.equal(day.status, 400);
      assert.deepEqual(await day.json(), {
        type: "error",
        error: { type: "invalid_request_error", message: "You have reached your specified daily usage limit on coere.ai." },
      });
    }
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
