import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEFAULTS, findEntry, fits, readEntry, SETTING_GROUPS, writeEntry } from "./catalog";
import { isSyncedKey, validateSettings } from "./synced-keys";

const entry = (id: string) => {
  const e = findEntry(id);
  if (!e) throw new Error(`no entry ${id}`);
  return e;
};

describe("settings catalog", () => {
  it("names only synced keys, each entry once, each with a default", () => {
    const ids = SETTING_GROUPS.flatMap((g) => g.entries.map((e) => e.id));
    assert.equal(new Set(ids).size, ids.length);
    for (const g of SETTING_GROUPS)
      for (const e of g.entries) {
        assert.ok(isSyncedKey(e.key), e.key);
        assert.ok(DEFAULTS[e.key], `no default for ${e.key}`);
        assert.ok(fits(e, readEntry({}, e)), `default of ${e.id} does not fit`);
      }
    assert.equal(findEntry("nope"), null);
  });

  it("reads the stored value, else the default", () => {
    assert.equal(readEntry({}, entry("search")), false);
    assert.equal(readEntry({ "coere.prefs": { search: true } }, entry("search")), true);
    assert.equal(readEntry({ "coere.memory.prefs": { context: { mode: "suggest" } } }, entry("context-mode")), "suggest");
    assert.equal(readEntry({ "coere.memory.prefs": { context: { mode: "loud" } } }, entry("context-mode")), "auto");
    assert.equal(readEntry({ "coere.memory.prefs": { context: { budget: 1500 } } }, entry("context-budget")), 1500);
  });

  it("checks a value against the entry's kind", () => {
    assert.equal(fits(entry("search"), true), true);
    assert.equal(fits(entry("search"), "true"), false);
    assert.equal(fits(entry("context-budget"), 3000), true);
    assert.equal(fits(entry("context-budget"), 2000), false);
    assert.equal(fits(entry("browser-level"), "review"), true);
  });

  it("writes the whole value of the key, keeping what is stored", () => {
    const stored = { "coere.memory.prefs": { v: 1, autosave: false, context: { mode: "manual" } } };
    assert.deepEqual(writeEntry(stored, entry("context-budget"), 3000), {
      v: 1,
      autosave: false,
      context: { mode: "manual", budget: 3000, standing: true, sensitive: false, skipRecent: false },
    });
  });

  it("marks a Cori choice as the person's own", () => {
    const next = writeEntry({}, entry("agent"), false);
    assert.equal(next.agent, false);
    assert.deepEqual(next.chosen, { agent: true, agentAlways: false });
    assert.deepEqual(next.keys, { chat: "rightOption", search: "optionDouble" });
  });

  it("never writes Browser Use's local fields, so the API's rule accepts the change", () => {
    const next = writeEntry({ "coere.browser_use": { level: "autonomous", model: "bolt", blocked: ["x.com"] } }, entry("browser-model"), "pro");
    assert.deepEqual(next, { level: "autonomous", model: "pro", blocked: ["x.com"] });
    assert.notEqual(validateSettings({ "coere.browser_use": next }), null);
  });
});
