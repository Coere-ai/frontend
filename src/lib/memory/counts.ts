import type { CoereManifest } from "./coere-zip";

/**
 * A memory file's counts, read from its manifest's per file record counts
 * (docs/accounts.md 8.6) without parsing a record. Both layouts count: the
 * 2.0 tree (`_facts.jsonl` in each folder) and 1.0's flat files.
 */

export interface MemoryCounts {
  memories: number;
  entities: number;
  links: number;
  chats: number;
  documents: number;
  sections: number;
}

const base = (path: string) => path.slice(path.lastIndexOf("/") + 1);

export function countsFromManifest(m: Pick<CoereManifest, "files">): MemoryCounts {
  const c: MemoryCounts = { memories: 0, entities: 0, links: 0, chats: 0, documents: 0, sections: 0 };
  for (const [path, info] of Object.entries(m.files)) {
    const n = typeof info?.records === "number" && info.records > 0 ? Math.floor(info.records) : 0;
    const name = base(path);
    if (name === "_facts.jsonl" || path === "facts.jsonl") c.memories += n;
    else if (name === "_folder.json" || name === "_self.json" || path === "entities.jsonl") c.entities += n;
    else if (name === "_relations.jsonl" || path === "relations.jsonl") c.links += n;
    else if (path === "sources.jsonl") c.chats += n;
    else if (name === "_section.json" || path === "sections.jsonl") c.sections += n;
    else if (name.endsWith(".md") && !path.includes(".versions/") && !path.startsWith("chats/")) c.documents += 1;
  }
  return c;
}
