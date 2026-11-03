import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mergeSettings, SYNCED_KEYS, validateSettings } from "./synced-keys";

describe("SYNCED_KEYS", () => {
  it("is the list of 6.6", () => {
    assert.equal(SYNCED_KEYS.length, 13);
    assert.ok(SYNCED_KEYS.includes("coere.browser_use"));
    assert.ok(!SYNCED_KEYS.includes("coere.account" as never));
  });
});

describe("validateSettings", () => {
  it("accepts synced keys with object values", () => {
    const s = { "coere.prefs": { theme: "light" }, "coere.browser_use": { level: 2, model: "x", blocked: [] } };
    assert.deepEqual(validateSettings(s), s);
    assert.deepEqual(validateSettings({}), {});
  });

  it("refuses an unknown key, a non object value, or a big one", () => {
    assert.equal(validateSettings({ "coere.account": {} }), null);
    assert.equal(validateSettings({ "coere.prefs": "light" }), null);
    assert.equal(validateSettings({ "coere.prefs": [1] }), null);
    assert.equal(validateSettings({ "coere.prefs": null }), null);
    assert.equal(validateSettings({ "coere.prefs": { big: "x".repeat(8200) } }), null);
    assert.equal(validateSettings([]), null);
  });

  it("refuses Browser Use's on and grantedAt", () => {
    assert.equal(validateSettings({ "coere.browser_use": { on: false, level: 1 } }), null);
    assert.equal(validateSettings({ "coere.browser_use": { grantedAt: 1 } }), null);
  });
});

describe("mergeSettings", () => {
  it("lays the change over the stored record key by key", () => {
    const merged = mergeSettings({ "coere.prefs": { a: 1 }, "coere.voice": { b: 2 }, "old.key": { c: 3 } }, { "coere.prefs": { a: 2 } });
    assert.deepEqual(merged, { "coere.prefs": { a: 2 }, "coere.voice": { b: 2 } });
    assert.deepEqual(mergeSettings(null, { "coere.ais": {} }), { "coere.ais": {} });
  });

  it("refuses a record over 64 KiB", () => {
    const big = { pad: "x".repeat(8000) };
    const current = Object.fromEntries(
      ["coere.prefs", "coere.run.settings", "coere.ais", "coere.memory.prefs", "coere.memory.capture", "coere.memory.corepack", "coere.memory.recall", "coere.memorylinks"].map((k) => [k, big]),
    );
    assert.equal(mergeSettings(current, { "coere.voice": big }), null);
  });
});
