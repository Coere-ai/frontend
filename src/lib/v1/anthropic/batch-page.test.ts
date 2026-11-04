import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { afterCursor, pageLimit } from "./batch-page";

describe("pageLimit", () => {
  it("defaults to 20 and caps at 100", () => {
    assert.equal(pageLimit(null), 20);
    assert.equal(pageLimit("100"), 100);
    assert.equal(pageLimit("500"), 100);
    assert.equal(pageLimit("7"), 7);
    for (const bad of ["0", "-1", "x", "1.5"]) assert.equal(pageLimit(bad), 20);
  });
});

describe("afterCursor", () => {
  it("quotes the timestamp and id, which hold characters PostgREST reads as syntax", () => {
    assert.equal(
      afterCursor({ id: "msgbatch_01", created_at: "2026-11-04T10:00:00.5+00:00" }),
      'created_at.lt."2026-11-04T10:00:00.5+00:00",and(created_at.eq."2026-11-04T10:00:00.5+00:00",id.lt."msgbatch_01")',
    );
  });
});
