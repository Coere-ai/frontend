import type { ReactNode } from "react";

/**
 * The parts of /account: a heading, one plain line, and rows divided by a
 * hairline. No cards and no tints, so the page reads like the site's
 * other quiet pages (/install).
 */
export function Part({ title, line, children }: { title: string; line: string; children: ReactNode }) {
  return (
    <section className="border-t border-neutral-200 pt-8">
      <h2 className="text-[22px] font-medium tracking-[-0.02em] text-neutral-950">{title}</h2>
      <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-neutral-500">{line}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** One row: what it is on the left, its one action on the right. */
export function Row({ name, detail, children }: { name: string; detail?: string; children?: ReactNode }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3.5">
      <div className="min-w-0">
        <p className="text-[15px] text-neutral-950 break-words">{name}</p>
        {detail ? <p className="mt-0.5 text-[13px] text-neutral-500">{detail}</p> : null}
      </div>
      {children}
    </li>
  );
}

/** The quiet button a row's action uses. */
export const rowButtonClass =
  "shrink-0 rounded-full px-4 py-2 text-[14px] text-neutral-950 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950";
