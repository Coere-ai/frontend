import assert from "node:assert/strict";
import { test } from "node:test";

import { parseInline, slugify } from "./inline";

test("plain text stays one piece", () => {
  assert.deepEqual(parseInline("Plain words."), [{ kind: "text", text: "Plain words." }]);
});

test("links, bold and code are read in order", () => {
  assert.deepEqual(parseInline("See [Forge](/products/forge), **now** with `npm i`."), [
    { kind: "text", text: "See " },
    { kind: "link", text: "Forge", href: "/products/forge" },
    { kind: "text", text: ", " },
    { kind: "bold", text: "now" },
    { kind: "text", text: " with " },
    { kind: "code", text: "npm i" },
    { kind: "text", text: "." },
  ]);
});

test("an unclosed mark stays text", () => {
  assert.deepEqual(parseInline("a **b and [c"), [{ kind: "text", text: "a **b and [c" }]);
});

test("bold around a whole link keeps the link", () => {
  assert.deepEqual(parseInline("**[Connect](/products/connect)**"), [{ kind: "bold", text: "Connect", href: "/products/connect" }]);
});

test("a heading becomes an anchor address", () => {
  assert.equal(slugify("What the money is for"), "what-the-money-is-for");
  assert.equal(slugify("Catalyst 26: what's next?"), "catalyst-26-whats-next");
});
