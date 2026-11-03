"use client";

import { useMemo, useState } from "react";

import type { SectionStat } from "@/lib/analytics/types";
import { PAGE_SECTIONS, sectionMeta } from "@/lib/sections";

import { Segmented } from "../panel/ui";

import { SectionCard } from "./section-card";

// Section by section, for one page.
//
// One card per section, each showing the section itself in a live frame, so a
// preview cannot go stale and what the operator sees is what the visitor saw.

type Order = "page" | "read";

/** A zeroed row for a section that exists but nobody has read yet. */
function unread(path: string, id: string, label: string, position: number): SectionStat {
  return { path, id, label, position, views: 0, uniques: 0, totalSeconds: 0, avgSeconds: 0, share: 0, reach: 0 };
}

/**
 * Every section worth a card on this page.
 *
 * Pages with hand-tagged sections (PAGE_SECTIONS) are known in advance, so the
 * ones nobody reached still get a card and the drop-off shows as empty cards.
 * Other pages are discovered from their own markup in the browser, so only what
 * was recorded is known here.
 */
function cardsFor(path: string, sections: SectionStat[]): SectionStat[] {
  const known = PAGE_SECTIONS[path];
  if (!known) return sections;
  const recorded = new Set(sections.map((s) => s.id));
  const missing = known.flatMap((id, position) =>
    recorded.has(id) ? [] : [unread(path, id, sectionMeta(id)?.label ?? id, position)],
  );
  return [...sections, ...missing];
}

export function SectionsRead({ path, sections }: { path: string; sections: SectionStat[] }) {
  const [order, setOrder] = useState<Order>("page");

  // The DOM order never changes; sorting uses CSS `order`, because moving an
  // iframe in the document reloads it, and every toggle would flash each card.
  const cards = useMemo(
    () => [...cardsFor(path, sections)].sort((a, b) => a.id.localeCompare(b.id)),
    [path, sections],
  );

  const placement = useMemo(() => {
    const sorted = [...cards].sort((a, b) =>
      order === "page"
        ? a.position - b.position
        : b.totalSeconds - a.totalSeconds || a.position - b.position,
    );
    return new Map(sorted.map((c, i) => [c.id, i]));
  }, [cards, order]);

  const peakSeconds = Math.max(1, ...cards.map((c) => c.totalSeconds));

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-[12.5px] font-semibold text-[color:var(--color-ink)]">
          Section by section
        </h4>
        <Segmented
          value={order}
          onChange={(v) => setOrder(v as Order)}
          options={[
            { value: "page", label: "Page order" },
            { value: "read", label: "Most read" },
          ]}
        />
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <SectionCard
            key={card.id}
            stat={card}
            peakSeconds={peakSeconds}
            order={placement.get(card.id) ?? 0}
          />
        ))}
      </ul>
    </div>
  );
}
