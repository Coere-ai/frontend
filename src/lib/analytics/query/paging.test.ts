import assert from "node:assert/strict";
import { test } from "node:test";

import { readNewestFirst } from "./paging";

/** Rows 0..n-1, oldest first, served newest first a page at a time, as the query orders them. */
function table(n: number) {
  const rows = Array.from({ length: n }, (_, i) => ({ i }));
  return async (from: number, to: number) => [...rows].reverse().slice(from, to + 1);
}

test("past the cap the newest rows are kept, not the oldest", async () => {
  const rows = await readNewestFirst(table(2500), 1000, 2000);
  assert.equal(rows.length, 2000);
  assert.equal(rows.at(-1)?.i, 2499);
  assert.equal(rows[0]?.i, 500);
});

test("rows come back oldest first, every one once", async () => {
  const rows = await readNewestFirst(table(2345), 1000, 200_000);
  assert.deepEqual(rows.map((r) => r.i), Array.from({ length: 2345 }, (_, i) => i));
});

test("an empty table is no rows and one read", async () => {
  let reads = 0;
  const rows = await readNewestFirst(async () => { reads += 1; return []; }, 1000, 200_000);
  assert.deepEqual(rows, []);
  assert.equal(reads, 1);
});
