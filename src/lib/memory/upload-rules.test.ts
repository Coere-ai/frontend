import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { fileLimit, MEMORY_FILE_CAP, parseCommitPath, parseUploadRequest, stagedPath } from "./upload-rules";

const UID = "6f1c1c2e-4b8e-4c55-9d7c-1e2f3a4b5c6d";
const OTHER = "11111111-2222-4333-8444-555555555555";
const DIGEST = "a".repeat(64);

describe("upload rules", () => {
  it("caps a file at the plan's storage and never over 50 MiB", () => {
    assert.equal(fileLimit(26_214_400), 26_214_400);
    assert.equal(fileLimit(500 * 1024 * 1024), MEMORY_FILE_CAP);
  });

  it("reads an upload request", () => {
    assert.deepEqual(parseUploadRequest({ bytes: 1024, digest: DIGEST }), { bytes: 1024, digest: DIGEST });
    assert.equal(parseUploadRequest({ bytes: 0, digest: DIGEST }), null);
    assert.equal(parseUploadRequest({ bytes: 1.5, digest: DIGEST }), null);
    assert.equal(parseUploadRequest({ bytes: 10, digest: "A".repeat(64) }), null);
    assert.equal(parseUploadRequest(null), null);
  });

  it("stages in the caller's incoming folder and commits only from there", () => {
    const path = stagedPath(UID);
    assert.match(path, new RegExp(`^${UID}/incoming/[A-Za-z0-9_-]{22}\\.coere$`));
    assert.equal(parseCommitPath({ path }, UID), path);
    assert.equal(parseCommitPath({ path }, OTHER), null);
    assert.equal(parseCommitPath({ path: `${UID}/memory.coere` }, UID), null);
    assert.equal(parseCommitPath({ path: `${UID}/incoming/../../${OTHER}/memory.coere` }, UID), null);
    assert.equal(parseCommitPath({ path: `${UID}/incoming/${"a".repeat(22)}.zip` }, UID), null);
  });
});
