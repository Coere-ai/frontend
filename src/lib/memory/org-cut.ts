import { sectionKeyOf } from "./build-index";
import type { MemoryIndex } from "./index-types";

/**
 * Cutting an index down to some sections (docs/accounts.md 14.2, 8.11). A
 * member's part of the organization graph is their index cut to the
 * organization's shared sections with every sensitive memory dropped; a
 * member's read of the merged graph is the graph cut to the sections their
 * access lets them read.
 */

/** The section a fact sits in: its folder's, else its subject's, else the section it is filed under. */
export function factSectionOf(
  fact: { under: string | null; subject: string },
  entitySection: ReadonlyMap<string, string>,
): string | null {
  const home = fact.under ?? fact.subject;
  return entitySection.get(home) ?? (home.startsWith("sec_") ? sectionKeyOf(home) : entitySection.get(fact.subject) ?? null);
}

export function cutToSections(index: MemoryIndex, sections: readonly string[], o: { dropSensitive: boolean }): MemoryIndex {
  const keep = new Set(sections);
  const allSections = new Map(index.entities.map((e) => [e.id, e.section]));
  const entities = index.entities.filter((e) => keep.has(e.section));
  const kept = new Set(entities.map((e) => e.id));
  const facts = index.facts.filter((f) => {
    if (o.dropSensitive && f.sensitivity !== null) return false;
    const section = factSectionOf(f, allSections);
    return section !== null && keep.has(section);
  });
  const sources = index.sources.flatMap(({ sensitiveSections, ...s }) => {
    // Sections reached only through sensitive memories count only where those memories are kept.
    const reached = o.dropSensitive ? (s.sections ?? []) : [...(s.sections ?? []), ...(sensitiveSections ?? [])];
    const inside = [...new Set(reached.filter((k) => keep.has(k)))].sort();
    return inside.length > 0 ? [{ ...s, sections: inside }] : [];
  });
  return {
    ...index,
    self: index.self && kept.has(index.self) ? index.self : null,
    sections: index.sections.filter((s) => keep.has(s.key)),
    entities: entities.map((e) => (e.parent && !kept.has(e.parent) ? { ...e, parent: null } : e)),
    facts,
    relations: index.relations.filter((r) => kept.has(r.from) && kept.has(r.to)),
    sources,
    documents: index.documents.filter((d) => sections.some((k) => d.path.startsWith(`sections/${k}/`))),
  };
}

/** A member's part: their index in the shared sections, sensitive memories always out. */
export function memberPart(index: MemoryIndex, sharedSections: readonly string[]): MemoryIndex {
  return cutToSections(index, sharedSections, { dropSensitive: true });
}
