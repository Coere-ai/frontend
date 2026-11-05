import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { badRequest, done, refused, REFUSAL_LINES, unavailable } from "@/lib/org/outcome";

import { outcomeAnswer } from "./outcome-answer";

describe("outcomeAnswer", () => {
  it("answers 200 with the notice, or null", async () => {
    const res = outcomeAnswer(done("Saved."));
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { notice: "Saved." });
    assert.deepEqual(await outcomeAnswer(done()).json(), { notice: null });
  });

  it("answers a rule's refusal as 409 refused with its reason and line", async () => {
    const res = outcomeAnswer(refused("last_admin"));
    assert.equal(res.status, 409);
    const body = await res.json();
    assert.equal(body.code, "refused");
    assert.equal(body.reason, "last_admin");
    assert.equal(body.detail, REFUSAL_LINES.last_admin);
    assert.equal((await outcomeAnswer(refused("self", "You are already in this organization.")).json()).detail, "You are already in this organization.");
  });

  it("answers unavailable and bad_request as their own problems", async () => {
    assert.equal(outcomeAnswer(unavailable()).status, 503);
    const bad = outcomeAnswer(badRequest());
    assert.equal(bad.status, 400);
    assert.equal((await bad.json()).code, "bad_request");
  });

  it("is never cached", () => {
    for (const o of [done(), refused("not_admin"), unavailable()]) assert.equal(outcomeAnswer(o).headers.get("cache-control"), "no-store");
  });
});
