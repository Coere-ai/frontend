import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DISPLAY_NAME_MAX, parseDisplayName } from "./display-name";

describe("parseDisplayName", () => {
  it("trims and folds the spaces between words", () => {
    assert.deepEqual(parseDisplayName("  Ada \t  Lovelace \n"), { ok: true, name: "Ada Lovelace" });
  });

  it("treats an empty box as clearing the name", () => {
    assert.deepEqual(parseDisplayName(""), { ok: true, name: null });
    assert.deepEqual(parseDisplayName("   "), { ok: true, name: null });
    assert.deepEqual(parseDisplayName(null), { ok: true, name: null });
  });

  it("takes out characters that draw nothing or turn the text around", () => {
    assert.deepEqual(parseDisplayName("Ada‮​\u0007 L"), { ok: true, name: "Ada L" });
    assert.deepEqual(parseDisplayName("​‏"), { ok: true, name: null });
  });

  it("keeps accents and joined emoji", () => {
    assert.deepEqual(parseDisplayName("Zoë 👩‍💻"), { ok: true, name: "Zoë 👩‍💻" });
  });

  it("counts characters the way the database does", () => {
    assert.deepEqual(parseDisplayName("😀".repeat(DISPLAY_NAME_MAX)), { ok: true, name: "😀".repeat(DISPLAY_NAME_MAX) });
    assert.deepEqual(parseDisplayName("a".repeat(DISPLAY_NAME_MAX + 1)), { ok: false, problem: "Use 80 characters or fewer." });
  });

  it("refuses what is not text", () => {
    assert.equal(parseDisplayName(42).ok, false);
  });
});
