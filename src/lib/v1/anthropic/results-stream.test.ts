import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { meteredResults } from "./results-stream";
import type { ModelTally } from "./usage";

const line = (model: string, input: number) =>
  JSON.stringify({ custom_id: "c", result: { type: "succeeded", message: { model, usage: { input_tokens: input, output_tokens: 0 } } } }) + "\n";

function streamOf(parts: string[], fail = false): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  return new ReadableStream({
    start(c) {
      for (const p of parts) c.enqueue(enc.encode(p));
      if (fail) c.error(new Error("cut"));
      else c.close();
    },
  });
}

describe("meteredResults", () => {
  it("passes the bytes through and meters once at the end", async () => {
    const parts = [line("claude-sonnet-5-5", 1000), line("claude-sonnet-5-5", 1000)];
    const seen: Array<Map<string, ModelTally>> = [];
    const out = meteredResults(streamOf(parts), async (t) => {
      seen.push(t);
    });
    assert.equal(await new Response(out).text(), parts.join(""));
    assert.equal(seen.length, 1);
    assert.equal(seen[0]?.get("claude-sonnet-5-5")?.costMicros, 2000);
  });

  it("breaks the read when the metering fails, so the reader does not take it for a whole read", async () => {
    // The extension deletes a batch after one whole read, and a batch deleted unmetered is charged its worst case.
    const parts = [line("claude-sonnet-5-5", 1000)];
    const out = meteredResults(streamOf(parts), async () => {
      throw new Error("not metered");
    });
    const reader = out.getReader();
    const first = await reader.read();
    assert.equal(new TextDecoder().decode(first.value), parts[0]);
    await assert.rejects(reader.read());
  });

  it("meters nothing when the stream breaks", async () => {
    let called = false;
    const out = meteredResults(streamOf([line("claude-haiku-5-5", 10)], true), async () => {
      called = true;
    });
    await assert.rejects(new Response(out).text());
    assert.equal(called, false);
  });

  it("meters nothing when the reader stops early", async () => {
    let called = false;
    const out = meteredResults(streamOf([line("claude-haiku-5-5", 10), line("claude-haiku-5-5", 10)]), async () => {
      called = true;
    });
    const reader = out.getReader();
    await reader.read();
    await reader.cancel();
    assert.equal(called, false);
  });
});
