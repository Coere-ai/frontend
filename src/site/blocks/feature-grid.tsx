import type { ReactNode } from "react";

export type GridFeature = { title: string; text: string; icon: ReactNode };

/**
 * Every feature at a glance: a line icon, a name and one line, four to a
 * row on wide screens. No cards or boxes; the grid's spacing does the work.
 */
export function FeatureGrid({ items }: { items: GridFeature[] }) {
  return (
    <ul className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <li key={item.title}>
          <span className="text-neutral-950">{item.icon}</span>
          <h3 className="mt-6 text-[22px] font-medium tracking-[-0.02em] text-neutral-950">{item.title}</h3>
          <p className="mt-2.5 text-[15px] leading-relaxed text-neutral-600">{item.text}</p>
        </li>
      ))}
    </ul>
  );
}
