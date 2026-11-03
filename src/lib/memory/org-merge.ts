import { createHash } from "node:crypto";

import { factOrder, MAX_INDEX_FACTS } from "./build-index";
import type { IndexEntity, IndexFact, IndexRelation, IndexSection, IndexSource, MemoryIndex } from "./index-types";
import { memberPart } from "./org-cut";

/**
 * Merging members' parts into one organization graph (docs/accounts.md
 * 14.2). Entities with the same section, kind and name (compared without
 * case or extra spaces) become one; facts keep the member who brought them
 * as `contributor`; relations follow the merged entities. Parts are cut to
 * the shared sections again here, so narrowing the sections takes effect on
 * the next merge without rewriting every part. Pure and ordered by member
 * id, so the same parts always give the same graph.
 */

export interface MemberPart {
  userId: string;
  index: MemoryIndex;
}

export const normalName = (name: string): string => name.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();

/** An id not yet used, so two members' records never share one. */
function unique(id: string, used: Set<string>, userId: string): string {
  let out = id;
  for (let n = 1; used.has(out); n++) out = `${id}~${userId.slice(0, 8)}${n > 1 ? n : ""}`;
  used.add(out);
  return out;
}

export function mergeParts(parts: readonly MemberPart[], sharedSections: readonly string[], now = new Date()): MemoryIndex {
  const ordered = [...parts].sort((a, b) => a.userId.localeCompare(b.userId));
  const sections = new Map<string, IndexSection>();
  const entities = new Map<string, IndexEntity>();
  const byKey = new Map<string, string>();
  const entityIds = new Set<string>();
  const facts: IndexFact[] = [];
  const factIds = new Set<string>();
  const relations = new Map<string, IndexRelation>();
  const relationIds = new Set<string>();
  const sources = new Map<string, IndexSource>();
  const documents = new Map<string, { path: string; title: string }>();
  let truncated = false;

  for (const { userId, index: whole } of ordered) {
    const part = memberPart(whole, sharedSections);
    truncated ||= part.truncated;
    for (const s of part.sections) if (!sections.has(s.key)) sections.set(s.key, s);
    const map = new Map<string, string>();
    for (const e of part.entities) {
      const key = `${e.section}\u0000${e.kind}\u0000${normalName(e.name)}`;
      const found = byKey.get(key);
      if (found) {
        map.set(e.id, found);
        const m = entities.get(found)!;
        m.importance = Math.max(m.importance, e.importance);
      } else {
        const id = unique(e.id, entityIds, userId);
        byKey.set(key, id);
        map.set(e.id, id);
        entities.set(id, { ...e, id, parent: null });
      }
    }
    for (const e of part.entities) {
      const merged = entities.get(map.get(e.id)!)!;
      const parent = e.parent ? map.get(e.parent) : undefined;
      if (merged.parent === null && parent && parent !== merged.id) merged.parent = parent;
    }
    const remap = (id: string) => map.get(id) ?? id;
    for (const f of part.facts) {
      facts.push({ ...f, id: unique(f.id, factIds, userId), subject: remap(f.subject), under: f.under ? remap(f.under) : null, contributor: userId });
    }
    for (const r of part.relations) {
      const from = remap(r.from);
      const to = remap(r.to);
      const key = `${from}\u0000${r.type}\u0000${to}`;
      if (from !== to && !relations.has(key)) relations.set(key, { id: unique(r.id, relationIds, userId), from, type: r.type, to });
    }
    for (const s of part.sources) {
      const had = sources.get(s.id);
      const merged = [...new Set([...(had?.sections ?? []), ...(s.sections ?? [])])].sort();
      sources.set(s.id, { ...(had ?? s), sections: merged });
    }
    for (const d of part.documents) documents.set(`${d.path}\u0000${d.title}`, d);
  }

  let allFacts = facts;
  if (allFacts.length > MAX_INDEX_FACTS) {
    truncated = true;
    allFacts = [...allFacts].sort(factOrder).slice(0, MAX_INDEX_FACTS);
  }
  const digest = createHash("sha256")
    .update(ordered.map((p) => `${p.userId} ${p.index.digest}\n`).join(""))
    .digest("hex");
  const order = new Map(sharedSections.map((k, i) => [k, i]));
  return {
    v: 1,
    digest,
    created: now.toISOString(),
    timeZone: null,
    self: null,
    sections: [...sections.values()].sort((a, b) => (order.get(a.key) ?? 0) - (order.get(b.key) ?? 0)),
    entities: [...entities.values()],
    facts: allFacts,
    relations: [...relations.values()],
    sources: [...sources.values()],
    documents: [...documents.values()],
    truncated,
  };
}
