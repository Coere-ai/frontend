import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { laneBucket, messageLane, rateRetryAfter } from "./lanes";

describe("laneBucket", () => {
  it("keeps ordinary calls on the device and the plan's limit", () => {
    assert.deepEqual(laneBucket("default", "dev1", 60), { key: "dev1", limit: 60 });
  });

  it("gives Jev and count_tokens their own, larger bucket", () => {
    assert.deepEqual(laneBucket("jev", "dev1", 60), { key: "jev:dev1", limit: 1000 });
    assert.deepEqual(laneBucket("count", "dev1", 300), { key: "count:dev1", limit: 3000 });
  });

  it("gives Haiku messages their own bucket, so sorting a library never meets the plan's 60 a minute", () => {
    assert.equal(messageLane("claude-haiku-5-5"), "haiku");
    assert.equal(messageLane("claude-sonnet-5-5"), "default");
    assert.equal(messageLane(undefined), "default");
    assert.deepEqual(laneBucket("haiku", "dev1", 60), { key: "haiku:dev1", limit: 1000 });
  });
});

describe("rateRetryAfter", () => {
  it("never asks for more than 30 seconds", () => {
    assert.equal(rateRetryAfter(59), 30);
    assert.equal(rateRetryAfter(4), 4);
  });
});
