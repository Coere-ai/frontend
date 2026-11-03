/**
 * The records of a `.coere` file the index is built from, read loosely: each
 * line of each `.json` or `.jsonl` entry is parsed and sorted by its `t`, so
 * the 2.0 tree and 1.0's flat files read the same way. Documents are the
 * front matter of each `.md`. A line that does not parse is skipped.
 */

export type Raw = Record<string, unknown>;

export interface FileRecords {
  sections: Raw[];
  entities: Raw[];
  facts: Raw[];
  relations: Raw[];
  sources: Raw[];
  documents: Array<{ path: string; title: string }>;
  /** Whether any evidence carries a quote, which memory_files records. */
  includesQuotes: boolean;
}

const isRecord = (v: unknown): v is Raw => typeof v === "object" && v !== null && !Array.isArray(v);

/** A `.md` document's title, from the JSON line between its `---` fences. */
export function documentTitle(text: string): string | null {
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---", 4);
  if (end === -1) return null;
  try {
    const front: unknown = JSON.parse(text.slice(4, end));
    return isRecord(front) && front.t === "document" && typeof front.title === "string" ? front.title : null;
  } catch {
    return null;
  }
}

const hasQuote = (r: Raw): boolean =>
  Array.isArray(r.evidence) && r.evidence.some((e) => isRecord(e) && isRecord(e.quote));

export function readRecords(files: ReadonlyMap<string, string>): FileRecords {
  const out: FileRecords = { sections: [], entities: [], facts: [], relations: [], sources: [], documents: [], includesQuotes: false };
  const sorted = [...files.keys()].sort();
  for (const path of sorted) {
    const text = files.get(path) ?? "";
    if (path.endsWith(".md")) {
      const title = documentTitle(text);
      if (title !== null) out.documents.push({ path, title });
      continue;
    }
    for (const line of text.split("\n")) {
      if (!line.trim()) continue;
      let r: unknown;
      try {
        r = JSON.parse(line);
      } catch {
        continue;
      }
      if (!isRecord(r) || typeof r.t !== "string") continue;
      if (r.t === "section") out.sections.push(r);
      else if (r.t === "entity") out.entities.push(r);
      else if (r.t === "fact") out.facts.push(r);
      else if (r.t === "relation") out.relations.push(r);
      else if (r.t === "source") out.sources.push(r);
      else continue;
      if (!out.includesQuotes && hasQuote(r)) out.includesQuotes = true;
    }
  }
  return out;
}
