import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { signsOutAtOnce } from "./at-once";

describe("signsOutAtOnce", () => {
  it("signs out as it loads for a visit the person started, or from this site", () => {
    assert.equal(signsOutAtOnce("none"), true);
    assert.equal(signsOutAtOnce("same-origin"), true);
  });

  it("waits for the button on a visit from another site, or with no header", () => {
    assert.equal(signsOutAtOnce("cross-site"), false);
    assert.equal(signsOutAtOnce("same-site"), false);
    assert.equal(signsOutAtOnce(null), false);
  });
});
