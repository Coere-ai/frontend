import { factOrder } from "./build-index";
import type { MemoryIndex } from "./index-types";

/**
 * The organization graph as one API answer (docs/accounts.md 8.11). A
 * function's answer on Vercel is at most 4.5 MB, and a merged graph may hold
 * 50,000 facts, so the answer keeps the most important facts that fit, then
 * sets `truncated`. Sources and entities are cut too when facts alone are not
 * enough, and relations whose ends are gone go with them.
 */

/** Bytes of JSON an answer may hold, well under the 4.5 MB ceiling. */
export const ANSWER_BYTES = 4_000_000;
/** Facts an answer starts from, before any byte check. */
export const ANSWER_FACTS = 5_000;

const sizeOf = (index: MemoryIndex) => new TextEncoder().encode(JSON.stringify(index)).byteLength;

export function capForAnswer(index: MemoryIndex, maxBytes = ANSWER_BYTES, maxFacts = ANSWER_FACTS): MemoryIndex {
  let out: MemoryIndex = index;
  if (out.facts.length > maxFacts) out = { ...out, facts: [...out.facts].sort(factOrder).slice(0, maxFacts), truncated: true };
  if (sizeOf(out) <= maxBytes) return out;
  out = { ...out, facts: [...out.facts].sort(factOrder), truncated: true };
  // Halve the biggest lists in turn until the answer fits.
  while (sizeOf(out) > maxBytes) {
    if (out.facts.length > 0) out = { ...out, facts: out.facts.slice(0, Math.floor(out.facts.length / 2)) };
    else if (out.sources.length > 0) out = { ...out, sources: out.sources.slice(0, Math.floor(out.sources.length / 2)) };
    else if (out.entities.length > 0) {
      const entities = out.entities.slice(0, Math.floor(out.entities.length / 2));
      const kept = new Set(entities.map((e) => e.id));
      out = { ...out, entities, relations: out.relations.filter((r) => kept.has(r.from) && kept.has(r.to)) };
    } else break;
  }
  return out;
}
