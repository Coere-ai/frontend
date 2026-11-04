import type { ReactNode } from "react";

/**
 * The dashboard's building blocks, all in the site's flat look: the page
 * title, a bordered card with an optional title, and a washed panel for
 * notes and empty states.
 */

export function PageHeader({ title, lede, actions }: { title: string; lede?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="text-3xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-[2.5rem] md:leading-[1.1]">{title}</h1>
        {lede ? <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-500 text-pretty md:text-base">{lede}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className = "",
}: {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-neutral-200 p-7 md:p-9 ${className}`}>
      {title || actions ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            {title ? <h2 className="text-xl font-medium tracking-[-0.02em] text-neutral-950">{title}</h2> : null}
            {description ? <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-neutral-500">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children ? <div className={title || actions ? "mt-6" : ""}>{children}</div> : null}
    </section>
  );
}

export function Wash({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-neutral-50 p-7 md:p-9 ${className}`}>{children}</div>;
}

/** One number with its name, for the rows of totals at the top of a page. */
export function Stat({ label, value, note }: { label: string; value: ReactNode; note?: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[13px] text-neutral-500">{label}</p>
      <p className="mt-1.5 truncate text-2xl font-medium tracking-[-0.03em] text-neutral-950 md:text-[1.75rem]">{value}</p>
      {note ? <p className="mt-1 text-[13px] text-neutral-500">{note}</p> : null}
    </div>
  );
}

/** Totals in a row on a wide screen, two to a row on a phone. */
export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-4">{children}</div>;
}

/** A line of muted text with a value on the right, for the rows inside a card. */
export function Row({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-neutral-100 py-3.5 first:border-t-0 first:pt-0 last:pb-0">
      <div className="min-w-0 text-[15px] text-neutral-950">{label}</div>
      <div className="shrink-0 text-[15px] text-neutral-500">{children}</div>
    </div>
  );
}
