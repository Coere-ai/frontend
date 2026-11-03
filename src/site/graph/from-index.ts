import { QUIET_HUE } from "./theme";
import type { GraphNode } from "./types";

/**
 * A memory index (docs/accounts.md 8.7) as the graph draws it, in the
 * product's look: the person (or the organization) in the middle, the
 * sections round them, each section's folders and things outward, each
 * memory as a dot round what it is about, and each chat as a small dot round
 * the section it taught. Pure, so the person's page, the organization page
 * and the tests build the same tree.
 *
 * The graph files beside this one are a port of coere-v2's
 * `packages/ui/src/graph2d`, cut to what a read only page needs. Change
 * them there first.
 */

export interface TreeSection {
  key: string;
  name: string;
}

export interface TreeEntity {
  id: string;
  kind: string;
  name: string;
  section: string;
  parent: string | null;
  importance: number;
}

export interface TreeFact {
  id: string;
  subject: string;
  under: string | null;
  text: string;
  importance: number;
  status: string;
}

export interface TreeSource {
  id: string;
  title: string;
  capturedAt: string | null;
  sections?: string[];
}

export interface TreeInput {
  self: string | null;
  sections: readonly TreeSection[];
  entities: readonly TreeEntity[];
  facts: readonly TreeFact[];
  sources: readonly TreeSource[];
}

export interface TreeOptions {
  /** The words on the point in the middle: "You", or the organization's name. */
  center: string;
  /** The most memories and chats drawn, so a big library stays quick to lay out. */
  maxFacts?: number;
  maxChats?: number;
}

export const CORE_ID = "core";
export const sectionNodeId = (key: string) => `sec:${key}`;
export const entityNodeId = (id: string) => `ent:${id}`;
export const factNodeId = (id: string) => `fact:${id}`;
export const chatNodeId = (id: string) => `chat:${id}`;

/** Memories no longer true are kept in the index but not drawn. */
const GONE = new Set(["superseded", "retracted", "forgotten", "deleted"]);
/** A chat's dot is the smallest the graph draws, so the memories read as the big dots. */
const CHAT_WEIGHT = 0.7;

/** A section's colour by its place. The palette ends on a grey kept for what fits nowhere, so sections wrap before it. */
export const sectionHue = (index: number): number => Math.max(0, index) % QUIET_HUE;

/** A point's size from its importance, a little under to a little over the usual size. */
export function importanceWeight(importance: number): number {
  const n = Number.isFinite(importance) ? Math.round(importance) : 3;
  return 0.8 + 0.1 * (Math.min(5, Math.max(1, n)) - 1);
}

/** A name or a sentence as a label: one line, with no full stop at the end. */
export const bareLabel = (text: string): string =>
  text
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.!?;:,]+$/u, "");

/** A sentence cut to whole words, with three dots when it was cut. */
export function shortLabel(text: string, max = 52): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 3);
  const at = cut.lastIndexOf(" ");
  return `${(at > max / 2 ? cut.slice(0, at) : cut).replace(/[,;:.]+$/, "")}...`;
}

/** Most important first, then the most recent, then by id, so the cut is the same on every visit. */
const byImportance = (a: TreeFact & { last?: string | null }, b: TreeFact & { last?: string | null }) =>
  b.importance - a.importance || (b.last ?? "").localeCompare(a.last ?? "") || a.id.localeCompare(b.id);

export function buildTree(index: TreeInput, o: TreeOptions): GraphNode[] {
  const nodes: GraphNode[] = [{ id: CORE_ID, parent: null, kind: "core", hue: 0, weight: 1, label: o.center }];
  const hue = new Map<string, number>();
  index.sections.forEach((s, i) => {
    hue.set(s.key, sectionHue(i));
    nodes.push({ id: sectionNodeId(s.key), parent: CORE_ID, kind: "hub", hue: sectionHue(i), weight: 1, label: s.name });
  });
  const hubOf = (key: string | undefined) => (key !== undefined && hue.has(key) ? sectionNodeId(key) : CORE_ID);

  const isSelf = (e: TreeEntity) => e.kind === "self" || e.id === index.self;
  const things = new Map(index.entities.filter((e) => !isSelf(e)).map((e) => [e.id, e]));
  for (const e of things.values()) {
    const parent = e.parent && e.parent !== e.id && things.has(e.parent) ? entityNodeId(e.parent) : hubOf(e.section);
    nodes.push({
      id: entityNodeId(e.id),
      parent,
      kind: "branch",
      hue: hue.get(e.section) ?? QUIET_HUE,
      weight: importanceWeight(e.importance),
      label: shortLabel(bareLabel(e.name)) || "Untitled",
    });
  }

  /** Where a memory hangs: the thing it is filed under or about, its section, else the middle. */
  const homeOf = (f: TreeFact): { parent: string; hue: number } => {
    for (const id of [f.under, f.subject]) {
      if (!id) continue;
      const thing = things.get(id);
      if (thing) return { parent: entityNodeId(id), hue: hue.get(thing.section) ?? QUIET_HUE };
      if (id.startsWith("sec_") && hue.has(id.slice(4))) return { parent: sectionNodeId(id.slice(4)), hue: hue.get(id.slice(4))! };
    }
    return { parent: CORE_ID, hue: 0 };
  };
  const facts = index.facts.filter((f) => !GONE.has(f.status)).sort(byImportance).slice(0, o.maxFacts ?? 3000);
  for (const f of facts) {
    const at = homeOf(f);
    nodes.push({ id: factNodeId(f.id), ...at, kind: "leaf", weight: importanceWeight(f.importance), label: shortLabel(bareLabel(f.text)) });
  }

  const chats = [...index.sources].sort((a, b) => (b.capturedAt ?? "").localeCompare(a.capturedAt ?? "")).slice(0, o.maxChats ?? 600);
  for (const c of chats) {
    const key = (c.sections ?? []).find((k) => hue.has(k));
    nodes.push({
      id: chatNodeId(c.id),
      parent: hubOf(key),
      kind: "leaf",
      hue: key ? hue.get(key)! : 0,
      weight: CHAT_WEIGHT,
      label: shortLabel(c.title.trim() || "Untitled chat"),
    });
  }
  return nodes;
}

/**
 * The points a search leaves dim: everything but the matches and the points
 * on the way from the middle to each match, so a match still shows where it
 * sits. Null when the search is empty, which dims nothing.
 */
export function dimmedFor(nodes: readonly GraphNode[], query: string): Set<string> | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const lit = new Set<string>();
  for (const n of nodes) {
    if (!n.label.toLowerCase().includes(q)) continue;
    for (let at: GraphNode | undefined = n, i = 0; at && !lit.has(at.id) && i < 64; at = byId.get(at.parent ?? ""), i++) lit.add(at.id);
  }
  return new Set(nodes.filter((n) => !lit.has(n.id)).map((n) => n.id));
}
