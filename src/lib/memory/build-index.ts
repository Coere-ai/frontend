import type { CoereManifest } from "./coere-zip";
import type { IndexEntity, IndexFact, IndexRelation, IndexSection, IndexSource, MemoryIndex } from "./index-types";
import { readRecords, type Raw } from "./records";

/**
 * Builds the memory index (docs/accounts.md 8.7) from a `.coere` file's
 * records, so the dashboard reads one small JSON file instead of unzipping.
 * Quotes, values and evidence stay in the file. A fact's `sources` is the
 * number of chats its evidence points into. With sensitive memories off,
 * facts with a sensitivity are left out. Past `maxFacts` the most important
 * are kept and `truncated` is set.
 *
 * Each entity's `section` is the section's key (`work`), which is what an
 * organization's shared sections name. A fact's `under` stays the raw id
 * (`sec_work` or an entity id), as in the file.
 */

export const MAX_INDEX_FACTS = 50_000;

const str = (v: unknown): string | null => (typeof v === "string" ? v : null);
const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const isRecord = (v: unknown): v is Raw => typeof v === "object" && v !== null && !Array.isArray(v);

/** The section key for a section id: `sec_work` is `work`. */
export const sectionKeyOf = (id: string): string => (id.startsWith("sec_") ? id.slice(4) : id);

/** The chats a record's evidence points into: `claude:abc#m3` is chat `claude:abc`. */
export function chatsOf(r: Raw): string[] {
  if (!Array.isArray(r.evidence)) return [];
  const out = new Set<string>();
  for (const e of r.evidence) {
    const src = isRecord(e) ? str(e.src) : null;
    if (src && src.includes("#m")) out.add(src.slice(0, src.lastIndexOf("#m")));
  }
  return [...out];
}

/** Most important first, then the most recently seen, then by id, so a cut is stable. */
export function factOrder(a: IndexFact, b: IndexFact): number {
  return b.importance - a.importance || (b.last ?? "").localeCompare(a.last ?? "") || a.id.localeCompare(b.id);
}

export function buildIndex(
  manifest: Pick<CoereManifest, "digest" | "created" | "timeZone" | "self">,
  files: ReadonlyMap<string, string>,
  o: { includeSensitive: boolean; maxFacts?: number },
): { index: MemoryIndex; includesQuotes: boolean; includesSensitive: boolean } {
  const rec = readRecords(files);
  const sectionOfId = new Map<string, string>();
  const sections: IndexSection[] = rec.sections
    .filter((s) => str(s.id) && str(s.key))
    .sort((a, b) => num(a.order) - num(b.order) || String(a.key).localeCompare(String(b.key)))
    .map((s) => {
      sectionOfId.set(String(s.id), String(s.key));
      return { key: String(s.key), name: str(s.name) ?? String(s.key) };
    });
  const keyOf = (id: string) => sectionOfId.get(id) ?? sectionKeyOf(id);

  const entities: IndexEntity[] = rec.entities
    .filter((e) => str(e.id) && str(e.section))
    .map((e) => ({
      id: String(e.id),
      kind: str(e.kind) ?? "folder",
      name: str(e.name) ?? "",
      section: keyOf(String(e.section)),
      parent: str(e.parent),
      importance: num(e.importance),
    }));
  const entitySection = new Map(entities.map((e) => [e.id, e.section]));
  /** A fact's section: where it is filed, else its subject's. */
  const sectionOfFact = (f: Raw): string | null => {
    const home = str(f.under) ?? str(f.subject);
    if (!home) return null;
    return entitySection.get(home) ?? (home.startsWith("sec_") ? keyOf(home) : null);
  };

  const includesSensitive = rec.facts.some((f) => str(f.sensitivity) !== null);
  const chatSections = new Map<string, Set<string>>();
  const note = (r: Raw, section: string | null) => {
    if (!section) return;
    for (const chat of chatsOf(r)) chatSections.set(chat, (chatSections.get(chat) ?? new Set()).add(section));
  };
  for (const e of rec.entities) note(e, str(e.section) ? keyOf(String(e.section)) : null);

  let facts: IndexFact[] = [];
  for (const f of rec.facts) {
    const sensitivity = str(f.sensitivity);
    if (!str(f.id) || !str(f.subject) || (sensitivity !== null && !o.includeSensitive)) continue;
    const recorded = isRecord(f.recorded) ? f.recorded : {};
    note(f, sectionOfFact(f));
    facts.push({
      id: String(f.id),
      subject: String(f.subject),
      under: str(f.under),
      kind: str(f.kind) ?? "note",
      key: str(f.key),
      text: str(f.text) ?? "",
      importance: num(f.importance),
      status: str(f.status) ?? "active",
      sensitivity,
      first: str(recorded.first),
      last: str(recorded.last),
      sources: chatsOf(f).length,
    });
  }
  const max = o.maxFacts ?? MAX_INDEX_FACTS;
  const truncated = facts.length > max;
  if (truncated) facts = [...facts].sort(factOrder).slice(0, max);

  for (const r of rec.relations) note(r, entitySection.get(str(r.from) ?? "") ?? null);
  const relations: IndexRelation[] = rec.relations
    .filter((r) => str(r.id) && str(r.from) && str(r.to))
    .map((r) => ({ id: String(r.id), from: String(r.from), type: str(r.type) ?? "related_to", to: String(r.to) }));

  const sources: IndexSource[] = rec.sources
    .filter((s) => str(s.id))
    .map((s) => ({
      id: String(s.id),
      platform: str(s.platform) ?? "",
      title: str(s.title) ?? "",
      capturedAt: str(s.capturedAt),
      messages: num(s.messages),
      sections: [...(chatSections.get(String(s.id)) ?? [])].sort(),
    }));

  const index: MemoryIndex = {
    v: 1,
    digest: manifest.digest,
    created: manifest.created,
    timeZone: manifest.timeZone,
    self: manifest.self,
    sections,
    entities,
    facts,
    relations,
    sources,
    documents: rec.documents,
    truncated,
  };
  return { index, includesQuotes: rec.includesQuotes, includesSensitive };
}
