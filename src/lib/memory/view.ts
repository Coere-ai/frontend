import type { MemoryIndex } from "./index-types";
import { factSectionOf } from "./org-cut";

/**
 * What a dashboard page sends the browser from a memory index: enough for
 * the graph and the searchable list, cut so a large index never travels
 * whole. Memories no longer true are left out, the most important are kept,
 * and each memory carries its section and the name of what it is about, so
 * the page groups and labels it without the rest of the index. Pure.
 */

export interface ViewFact {
  id: string;
  subject: string;
  under: string | null;
  text: string;
  importance: number;
  status: string;
  /** How many chats back it. */
  sources: number;
  section: string | null;
  /** The thing it is about or filed under, by name, or null for the person themselves. */
  about: string | null;
  last: string | null;
  /** In an organization's graph: the member who brought it. */
  contributor?: string;
}

export interface MemoryView {
  self: string | null;
  sections: { key: string; name: string }[];
  entities: { id: string; kind: string; name: string; section: string; parent: string | null; importance: number }[];
  facts: ViewFact[];
  sources: { id: string; platform: string; title: string; capturedAt: string | null; messages: number; sections?: string[] }[];
  /** How many active memories and chats the index holds, before the cut. */
  totalFacts: number;
  totalChats: number;
  /** True when the index itself had been cut at 50,000. */
  truncated: boolean;
}

/** Statuses of memories that are no longer true. */
const GONE = new Set(["superseded", "retracted", "forgotten", "deleted"]);

export function toView(index: MemoryIndex, o: { maxFacts?: number; maxChats?: number } = {}): MemoryView {
  const entitySection = new Map(index.entities.map((e) => [e.id, e.section]));
  const names = new Map(index.entities.filter((e) => e.kind !== "self" && e.id !== index.self).map((e) => [e.id, e.name]));
  const live = index.facts.filter((f) => !GONE.has(f.status));
  const facts = [...live]
    .sort((a, b) => b.importance - a.importance || (b.last ?? "").localeCompare(a.last ?? "") || a.id.localeCompare(b.id))
    .slice(0, o.maxFacts ?? 3000)
    .map((f) => {
      const out: ViewFact = {
        id: f.id,
        subject: f.subject,
        under: f.under,
        text: f.text,
        importance: f.importance,
        status: f.status,
        sources: f.sources,
        section: factSectionOf(f, entitySection),
        about: names.get(f.under ?? "") ?? names.get(f.subject) ?? null,
        last: f.last,
      };
      if (f.contributor) out.contributor = f.contributor;
      return out;
    });
  const sources = [...index.sources]
    .sort((a, b) => (b.capturedAt ?? "").localeCompare(a.capturedAt ?? ""))
    .slice(0, o.maxChats ?? 2000)
    .map(({ id, platform, title, capturedAt, messages, sections }) => ({ id, platform, title, capturedAt, messages, ...(sections ? { sections } : {}) }));
  return {
    self: index.self,
    sections: index.sections,
    entities: index.entities,
    facts,
    sources,
    totalFacts: live.length,
    totalChats: index.sources.length,
    truncated: index.truncated,
  };
}
