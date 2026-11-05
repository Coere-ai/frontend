import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { backupAfter, backupChange } from "./memory-backup-request";

describe("backupChange", () => {
  it("takes either switch or both", () => {
    assert.deepEqual(backupChange({ sync: false }), { sync: false });
    assert.deepEqual(backupChange({ includeSensitive: true }), { includeSensitive: true });
    assert.deepEqual(backupChange({ sync: true, includeSensitive: false }), { sync: true, includeSensitive: false });
  });

  it("refuses an empty body, another field or a value that is not a boolean", () => {
    for (const body of [null, [], "sync", {}, { sync: "false" }, { sync: 0 }, { sync: true, plan: "team" }, { memory_sync: false }]) assert.equal(backupChange(body), null);
  });
});

describe("backupAfter", () => {
  it("keeps the switch the change leaves alone", () => {
    assert.deepEqual(backupAfter({ sync: false }, { memorySync: true, includeSensitive: true }), { sync: false, includeSensitive: true });
    assert.deepEqual(backupAfter({ includeSensitive: true }, { memorySync: false, includeSensitive: false }), { sync: false, includeSensitive: true });
  });
});
