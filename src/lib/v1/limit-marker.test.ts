import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { LIMIT_HEADER, LIMIT_SOURCES, markUpstream } from "./limit-marker";

describe("markUpstream", () => {
  it("marks an upstream 429 and nothing else", () => {
    assert.equal(LIMIT_HEADER, "x-coere-limit");
    assert.equal(markUpstream(new Headers(), 429).get(LIMIT_HEADER), "upstream");
    for (const status of [200, 400, 500, 503, 529]) assert.equal(markUpstream(new Headers(), status).get(LIMIT_HEADER), null, String(status));
  });

  it("replaces whatever the upstream sent under the name", () => {
    assert.equal(markUpstream(new Headers({ [LIMIT_HEADER]: "spend-pending" }), 429).get(LIMIT_HEADER), "upstream");
    assert.equal(markUpstream(new Headers({ [LIMIT_HEADER]: "anything" }), 200).get(LIMIT_HEADER), null);
  });

  it("keeps the values to the fixed four of the contract", () => {
    assert.deepEqual([...LIMIT_SOURCES], ["spend-pending", "per-minute", "concurrency", "upstream"]);
  });
});
