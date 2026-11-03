import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { readBody, readJson } from "./body";

const post = (body: BodyInit, headers: Record<string, string> = {}) =>
  new Request("https://www.coere.ai/api/v1/x", { method: "POST", body, headers, duplex: "half" } as RequestInit);

describe("readBody", () => {
  it("reads a body under the cap", async () => {
    const r = await readBody(post("hello"), 10);
    assert.equal(r.ok && new TextDecoder().decode(r.bytes), "hello");
  });

  it("refuses a declared length over the cap without reading", async () => {
    assert.deepEqual(await readBody(post("hi", { "content-length": "99" }), 10), { ok: false, reason: "too_large" });
  });

  it("stops a streamed body at the cap", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        for (let i = 0; i < 5; i++) c.enqueue(new Uint8Array(4));
        c.close();
      },
    });
    assert.deepEqual(await readBody(post(stream), 10), { ok: false, reason: "too_large" });
  });
});

describe("readJson", () => {
  it("parses JSON and refuses anything else", async () => {
    const good = await readJson(post('{"a":1}'), 100);
    assert.deepEqual(good.ok && good.value, { a: 1 });
    assert.deepEqual(await readJson(post("{"), 100), { ok: false, reason: "bad_request" });
    assert.deepEqual(await readJson(post(""), 100), { ok: false, reason: "bad_request" });
  });
});
