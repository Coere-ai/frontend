import assert from "node:assert/strict";
import { test } from "node:test";

import { allCsv, csvName, listCsv, readInterestList } from "./interest-lists";

const row = (email: string, createdAt: string, source: string | null = "install") => ({ email, source, createdAt });

test("only the three lists are read from a query", () => {
  assert.equal(readInterestList("developers"), "developers");
  assert.equal(readInterestList("connect"), "connect");
  assert.equal(readInterestList("teams"), "teams");
  for (const raw of [null, "", "all", "Connect", "forge", "teams;drop"]) assert.equal(readInterestList(raw), null, String(raw));
});

test("a list's CSV has its head and one escaped line per row", () => {
  assert.equal(listCsv([row("a@example.com", "2026-11-04T10:00:00.000Z"), row("=x@example.com", "2026-11-03T10:00:00.000Z", null)]), "email,source,joined_utc\r\na@example.com,install,2026-11-04T10:00:00.000Z\r\n'=x@example.com,,2026-11-03T10:00:00.000Z\r\n");
});

test("the export of everything names each row's product, in list order", () => {
  const csv = allCsv({
    developers: [row("dev@example.com", "2026-11-02T00:00:00.000Z", "site")],
    connect: [row("fan@example.com", "2026-11-04T00:00:00.000Z"), row("two@example.com", "2026-11-01T00:00:00.000Z")],
    teams: [row("lead@example.com", "2026-11-03T00:00:00.000Z", "try-teams")],
  });
  assert.deepEqual(csv.split("\r\n"), [
    "product,email,source,joined_utc",
    "developers,dev@example.com,site,2026-11-02T00:00:00.000Z",
    "connect,fan@example.com,install,2026-11-04T00:00:00.000Z",
    "connect,two@example.com,install,2026-11-01T00:00:00.000Z",
    "teams,lead@example.com,try-teams,2026-11-03T00:00:00.000Z",
    "",
  ]);
});

test("the file names are fixed", () => {
  assert.equal(csvName("connect"), "coere-interested-connect.csv");
  assert.equal(csvName("all"), "coere-interested-all.csv");
});
