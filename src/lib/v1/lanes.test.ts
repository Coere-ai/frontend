import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { laneBucket, MAX_RATE_RETRY_SECONDS, messageLane, rateRetryAfter } from "./lanes";

describe("laneBucket", () => {
  it("keeps the account, settings, events and memory calls on the device and the plan's limit", () => {
    assert.deepEqual(laneBucket("default", "dev1", 60), { key: "dev1", limit: 60 });
    assert.deepEqual(laneBucket("default", "dev1", 300), { key: "dev1", limit: 300 });
  });

  it("gives model messages their own bucket of five times the plan's, at least 600", () => {
    assert.deepEqual(laneBucket("message", "dev1", 60), { key: "message:dev1", limit: 600 });
    assert.deepEqual(laneBucket("message", "dev1", 120), { key: "message:dev1", limit: 600 });
    assert.deepEqual(laneBucket("message", "dev1", 300), { key: "message:dev1", limit: 1500 });
  });

  it("gives Haiku messages thirty times the plan's, at least 2,000", () => {
    assert.deepEqual(laneBucket("haiku", "dev1", 60), { key: "haiku:dev1", limit: 2000 });
    assert.deepEqual(laneBucket("haiku", "dev1", 120), { key: "haiku:dev1", limit: 3600 });
    assert.deepEqual(laneBucket("haiku", "dev1", 300), { key: "haiku:dev1", limit: 9000 });
  });

  it("keeps Jev and count_tokens at ten times the plan's, at least 1,000", () => {
    assert.deepEqual(laneBucket("jev", "dev1", 60), { key: "jev:dev1", limit: 1000 });
    assert.deepEqual(laneBucket("count", "dev1", 300), { key: "count:dev1", limit: 3000 });
  });

  it("never shares a bucket between lanes", () => {
    const keys = (["default", "message", "haiku", "jev", "count"] as const).map((l) => laneBucket(l, "dev1", 60).key);
    assert.equal(new Set(keys).size, keys.length);
  });

  it("lets a build of 100 calls in flight at 20 s a call start inside the Free plan's message lane", () => {
    // 100 in flight with each call taking about 20 s is about 300 starts a minute.
    assert.ok(laneBucket("message", "dev1", 60).limit >= 300);
  });
});

describe("messageLane", () => {
  it("sends Haiku to its own lane and every other model, or none, to the message lane", () => {
    assert.equal(messageLane("claude-haiku-5-5"), "haiku");
    assert.equal(messageLane("claude-sonnet-5-5"), "message");
    assert.equal(messageLane("claude-opus-5-5"), "message");
    assert.equal(messageLane(undefined), "message");
  });
});

describe("rateRetryAfter", () => {
  it("never asks for more than 30 seconds", () => {
    assert.equal(MAX_RATE_RETRY_SECONDS, 30);
    assert.equal(rateRetryAfter(59), 30);
    assert.equal(rateRetryAfter(4), 4);
  });
});
