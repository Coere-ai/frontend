import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { BASE_SECTIONS, sectionChoices } from "./sections";

describe("sectionChoices", () => {
  it("offers the base sections first, then new ones once, named by the graph when it can", () => {
    const out = sectionChoices([{ key: "clients", name: "Clients" }, { key: "work", name: "Job" }], ["clients", "legal"]);
    assert.deepEqual(out.slice(0, BASE_SECTIONS.length), [...BASE_SECTIONS]);
    assert.deepEqual(out.slice(BASE_SECTIONS.length), [
      { key: "clients", name: "Clients" },
      { key: "legal", name: "legal" },
    ]);
  });
});
