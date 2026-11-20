import type { ReactNode } from "react";
import { SOFT_CARD } from "@/site/home/look";

export type GridFeature = { title: string; text: string; icon: ReactNode };

/**
 * Every feature at a glance: a soft card each, with its line icon on a
 * pale blue tile, a name and one line, four to a row on wide screens.
 */
export function FeatureGrid({ items }: { items: GridFeature[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
      {items.map((item) => (
        <li key={item.title} className={`${SOFT_CARD} p-7`}>
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">{item.icon}</span>
          <h3 className="mt-6 text-[20px] font-semibold tracking-[-0.02em] text-neutral-950">{item.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">{item.text}</p>
        </li>
      ))}
    </ul>
  );
}
