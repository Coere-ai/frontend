"use client";

import { useState } from "react";

import { day, plural } from "@/lib/dashboard/format";
import type { MemoryView, ViewFact } from "@/lib/memory/view";

/**
 * The memories as a list, one group per section, in the order the sections
 * come. A long section shows its first memories and a button for the rest.
 * In an organization's list each memory names who brought it.
 */

const FIRST = 40;

export function groupBySection(view: MemoryView, facts: readonly ViewFact[]): Array<{ key: string; name: string; facts: ViewFact[] }> {
  const groups = new Map<string, ViewFact[]>();
  for (const f of facts) {
    const key = f.section && view.sections.some((s) => s.key === f.section) ? f.section : "";
    const list = groups.get(key);
    if (list) list.push(f);
    else groups.set(key, [f]);
  }
  const named = view.sections.filter((s) => groups.has(s.key)).map((s) => ({ ...s, facts: groups.get(s.key)! }));
  return groups.has("") ? [...named, { key: "", name: "Other", facts: groups.get("")! }] : named;
}

function Section({ name, facts, names }: { name: string; facts: ViewFact[]; names?: Record<string, string> }) {
  const [all, setAll] = useState(false);
  const shown = all ? facts : facts.slice(0, FIRST);
  return (
    <section>
      <h3 className="flex items-baseline justify-between gap-4 border-b border-neutral-200 pb-3 text-[15px] font-medium text-neutral-950">
        {name}
        <span className="text-[13px] font-normal text-neutral-500">{plural(facts.length, "memory", "memories")}</span>
      </h3>
      <ul className="divide-y divide-neutral-100">
        {shown.map((f) => (
          <li key={f.id} className="py-3.5">
            <p className="text-[15px] leading-relaxed text-neutral-950">{f.text}</p>
            <p className="mt-1 text-[13px] text-neutral-500">
              {[
                f.about,
                f.contributor ? `Brought by ${names?.[f.contributor] ?? "a former member"}` : null,
                f.sources > 0 ? `From ${plural(f.sources, "chat")}` : null,
                f.last ? `Seen ${day(f.last)}` : null,
              ]
                .filter(Boolean)
                .join(". ")}
            </p>
          </li>
        ))}
      </ul>
      {facts.length > FIRST && !all ? (
        <button type="button" onClick={() => setAll(true)} className="mt-2 rounded-full px-4 py-2 text-[14px] text-neutral-950 transition-colors hover:bg-neutral-100">
          Show {plural(facts.length - FIRST, "more memory", "more memories")}
        </button>
      ) : null}
    </section>
  );
}

export function MemoryList({ view, facts, names }: { view: MemoryView; facts: readonly ViewFact[]; names?: Record<string, string> }) {
  const groups = groupBySection(view, facts);
  if (groups.length === 0) return <p className="text-[15px] text-neutral-500">No memories match.</p>;
  return (
    <div className="space-y-10">
      {groups.map((g) => (
        <Section key={g.key || "self"} name={g.name} facts={g.facts} names={names} />
      ))}
    </div>
  );
}
