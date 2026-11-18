import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { backupAfter, backupChange, removesCopy } from "./memory-backup-request";

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

describe("removesCopy", () => {
  it("removes the copy when the backup goes off", () => {
    assert.equal(removesCopy({ sync: false }, null), true);
    assert.equal(removesCopy({ sync: false }, { includesSensitive: false }), true);
  });

  it("removes a copy holding sensitive memories when they go off, and keeps one without", () => {
    assert.equal(removesCopy({ includeSensitive: false }, { includesSensitive: true }), true);
    assert.equal(removesCopy({ includeSensitive: false }, { includesSensitive: false }), false);
    assert.equal(removesCopy({ includeSensitive: false }, null), false);
  });

  it("keeps the copy when a switch goes on", () => {
    assert.equal(removesCopy({ includeSensitive: true }, { includesSensitive: true }), false);
    assert.equal(removesCopy({ sync: true }, { includesSensitive: true }), false);
  });
});
