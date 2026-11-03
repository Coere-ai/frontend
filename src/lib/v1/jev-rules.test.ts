import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { jevAnswerHeaders, jevModel, jevUsage } from "./jev-rules";

describe("jev rules", () => {
  it("allows the two Jev models only", () => {
    assert.equal(jevModel({ model: "jev-1.14.0" }), "jev-1.14.0");
    assert.equal(jevModel({ model: "jev-1.13.0" }), "jev-1.13.0");
    assert.equal(jevModel({ model: "jev-2" }), null);
    assert.equal(jevModel({}), null);
  });

  it("reads input tokens and the answering model", () => {
    assert.deepEqual(jevUsage({ model: "jev-1.13.0", usage: { input_tokens: 812, output_tokens: 3 } }, "jev-1.14.0"), { model: "jev-1.13.0", input: 812 });
    assert.deepEqual(jevUsage({}, "jev-1.14.0"), { model: "jev-1.14.0", input: 0 });
  });

  it("keeps only the headers Jev's client reads", () => {
    const out = jevAnswerHeaders(new Headers({ "content-type": "application/json", "retry-after-ms": "200", "x-key-id": "k" }));
    assert.equal(out.get("retry-after-ms"), "200");
    assert.equal(out.get("x-key-id"), null);
    assert.equal(out.get("cache-control"), "no-store");
  });
});
