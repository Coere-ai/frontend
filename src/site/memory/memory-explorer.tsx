"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { compact, plural } from "@/lib/dashboard/format";
import type { MemoryView } from "@/lib/memory/view";
import { buildTree, dimmedFor } from "@/site/graph/from-index";
import { GraphCanvas } from "@/site/graph/graph-canvas";
import { inputClass } from "@/site/ui/form-field";
import { SearchIcon } from "@/site/ui/icons/interface-icons";

import { MemoryList } from "./memory-list";

/**
 * The graph and the list of one memory, with one search over both: the
 * graph dims what does not match and the list keeps only what does. The
 * person's own page puts "You" in the middle; the organization page its
 * name, and passes the members' names for who brought each memory.
 */
export function MemoryExplorer({ view, center, names }: { view: MemoryView; center: string; names?: Record<string, string> }) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const nodes = useMemo(() => buildTree(view, { center }), [view, center]);
  const dimmed = useMemo(() => dimmedFor(nodes, deferred), [nodes, deferred]);
  const facts = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    if (!q) return view.facts;
    return view.facts.filter((f) => f.text.toLowerCase().includes(q) || (f.about ?? "").toLowerCase().includes(q));
  }, [view, deferred]);
  const cut = view.totalFacts > view.facts.length;

  return (
    <div className="space-y-8">
      <div className="relative">
        <SearchIcon size={18} className="pointer-events-none absolute top-1/2 left-4 mt-1 -translate-y-1/2 text-neutral-400" />
        <label htmlFor="memory-search" className="sr-only">
          Search memories
        </label>
        <input
          id="memory-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search memories"
          autoComplete="off"
          className={`${inputClass(false)} h-12 pl-11`}
        />
      </div>
      <GraphCanvas nodes={nodes} dimmed={dimmed} label={`Memory graph with ${plural(view.facts.length, "memory", "memories")} around ${center}`} />
      {cut ? (
        <p className="text-[13px] text-neutral-500">
          Showing the {compact(view.facts.length)} most important of {compact(view.totalFacts)} memories.
        </p>
      ) : null}
      <MemoryList view={view} facts={facts} names={names} />
    </div>
  );
}
