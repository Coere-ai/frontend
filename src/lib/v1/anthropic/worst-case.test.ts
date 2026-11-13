import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { costMicros } from "../prices";
import { batchWorstCaseMicros, worstCaseMicros } from "./worst-case";

const message = (text: string, maxTokens?: number) => ({
  model: "claude-sonnet-5-5",
  ...(maxTokens === undefined ? {} : { max_tokens: maxTokens }),
  messages: [{ role: "user", content: text }],
});

describe("worstCaseMicros", () => {
  it("prices max_tokens as output and two bytes a token as cache writes", () => {
    const params = message("x".repeat(10_000), 16_000);
    const bytes = JSON.stringify(params).length;
    const expected = costMicros("claude-sonnet-5-5", { input: 0, output: 16_000, cacheRead: 0, cacheWrite: Math.ceil(bytes / 2) }, "direct");
    assert.equal(worstCaseMicros(params, "direct"), expected);
    // 16,000 output tokens at $10 a million is $0.16 on its own.
    assert.ok(worstCaseMicros(params, "direct") > 160_000);
  });

  it("takes the proxy's cap when max_tokens is missing, and halves a batch", () => {
    assert.ok(worstCaseMicros(message("hi"), "direct") >= 64_000 * 10);
    assert.equal(worstCaseMicros(message("hi", 1000), "batch") * 2 - worstCaseMicros(message("hi", 1000), "direct") <= 1, true);
  });

  it("stays above what the request can really cost", () => {
    // A real prompt of 4 bytes a token, fully written to cache, with every output token used.
    const text = "word ".repeat(40_000);
    const real = costMicros("claude-opus-5-5", { input: 0, output: 16_000, cacheRead: 0, cacheWrite: text.length / 4 }, "direct");
    assert.ok(worstCaseMicros({ ...message(text, 16_000), model: "claude-opus-5-5" }, "direct") > real);
  });
});

describe("a picture's worst case", () => {
  const picture = { type: "image", source: { type: "base64", media_type: "image/png", data: "iVBORw0KGgo=" } };
  const withPictures = (...content: object[]) => ({ model: "claude-opus-5-5", max_tokens: 1, messages: [{ role: "user", content }] });

  it("counts a full size picture however small its file is", () => {
    // A plain picture of 2576 px a side is a few hundred bytes of PNG and still 4,784 tokens.
    const full = costMicros("claude-opus-5-5", { input: 4_784, output: 1, cacheRead: 0, cacheWrite: 0 }, "direct");
    assert.ok(worstCaseMicros(withPictures(picture), "direct") >= full);
    assert.ok(worstCaseMicros(withPictures(picture, picture, picture), "direct") >= 3 * full);
  });

  it("counts a picture inside a tool result and inside a document", () => {
    const full = costMicros("claude-opus-5-5", { input: 4_784, output: 1, cacheRead: 0, cacheWrite: 0 }, "direct");
    assert.ok(worstCaseMicros(withPictures({ type: "tool_result", tool_use_id: "a", content: [picture] }), "direct") >= full);
    assert.ok(worstCaseMicros(withPictures({ type: "document", source: { type: "content", content: [picture] } }), "direct") >= full);
  });
});

describe("batchWorstCaseMicros", () => {
  it("adds every entry at batch price", () => {
    const entry = { custom_id: "a", params: message("hello", 16_000) };
    assert.equal(batchWorstCaseMicros({ requests: [entry, entry] }), 2 * worstCaseMicros(entry.params, "batch"));
    assert.equal(batchWorstCaseMicros({}), 0);
  });

  it("never lets one entry lower another's share", () => {
    const real = { custom_id: "a", params: message("hello", 16_000) };
    const negative = { custom_id: "b", params: message("hello", -1_000_000_000_000) };
    assert.ok(worstCaseMicros(negative.params, "batch") >= 0);
    assert.ok(batchWorstCaseMicros({ requests: [real, negative] }) >= worstCaseMicros(real.params, "batch"));
  });
});
