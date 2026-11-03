import assert from "node:assert/strict";
import { test } from "node:test";

import { csvField, toCsv } from "./csv";

test("plain fields stay as they are", () => {
  assert.equal(csvField("ada@example.com"), "ada@example.com");
  assert.equal(csvField(42), "42");
  assert.equal(csvField(null), "");
  assert.equal(csvField(undefined), "");
});

test("commas, quotes, line breaks and edge spaces are quoted", () => {
  assert.equal(csvField("a,b"), '"a,b"');
  assert.equal(csvField('say "hi"'), '"say ""hi"""');
  assert.equal(csvField("two\nlines"), '"two\nlines"');
  assert.equal(csvField(" padded"), '" padded"');
});

test("a field a spreadsheet would run as a formula is defused", () => {
  assert.equal(csvField("=HYPERLINK(\"x\")"), "\"'=HYPERLINK(\"\"x\"\")\"");
  assert.equal(csvField("+1"), "'+1");
  assert.equal(csvField("-1"), "'-1");
  assert.equal(csvField("@SUM(A1)"), "'@SUM(A1)");
  assert.equal(csvField(-1), "-1");
});

test("a file is the head and the rows with CRLF line ends", () => {
  assert.equal(toCsv(["email", "joined"], [["a@x.com", "2026-11-03"], ["b,c@x.com", null]]), 'email,joined\r\na@x.com,2026-11-03\r\n"b,c@x.com",\r\n');
});
