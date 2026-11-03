// The dashboard's building blocks: headline tiles, framed cards, titled
// sections, the segmented switch and the plain table. Shared by every section
// of the analytics panel so they all read as one page.

/** One headline number. */
export function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink)]">
        {label}
      </div>
      <div className="mt-1.5 text-[22px] font-semibold leading-none text-[color:var(--color-ink)]">
        {value}
      </div>
    </div>
  );
}

/** The card every chart sits in. The tables carry their own border; without
 *  this the bar charts floated on the page beside them and the section stopped
 *  reading as one row of panels. */
export function Framed({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border px-3 py-2"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      {children}
    </div>
  );
}

export function Section({
  title,
  children,
  control,
}: {
  title: string;
  children: React.ReactNode;
  control?: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[13.5px] font-semibold text-[color:var(--color-ink)]">{title}</h3>
        {control}
      </div>
      {children}
    </section>
  );
}

/** A two or three way switch. Used where a toggle would have to be labelled to
 *  say what its off state means. */
export function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div
      className="flex overflow-hidden rounded-md border"
      style={{ borderColor: "var(--color-border)" }}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={on}
            className="px-2.5 py-1 text-[11.5px] transition-colors"
            style={{
              background: on ? "var(--color-accent)" : "transparent",
              color: on ? "#fff" : "var(--color-ink)",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** A plain table, first column left, numbers right. `onRowClick` makes each
 *  row a way into something (the page table uses it to pick a page). */
export function Table({
  head,
  rows,
  empty,
  onRowClick,
}: {
  head: string[];
  rows: React.ReactNode[][];
  empty: string;
  onRowClick?: (index: number) => void;
}) {
  if (!rows.length) return <EmptyCard>{empty}</EmptyCard>;
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: "var(--color-border)" }}
    >
      <table className="w-full text-[12.5px]">
        <thead>
          <tr style={{ background: "var(--color-canvas-soft)" }}>
            {head.map((h, i) => (
              <th
                key={h}
                className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.07em] ${
                  i === 0 ? "text-left" : "text-right"
                }`}
                style={{ color: "var(--color-ink)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr
              key={ri}
              className={`border-t ${onRowClick ? "cursor-pointer transition-colors hover:bg-[color:var(--color-canvas-soft)]" : ""}`}
              style={{ borderColor: "var(--color-rule-subtle)" }}
              onClick={onRowClick ? () => onRowClick(ri) : undefined}
            >
              {r.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-3 py-2 ${ci === 0 ? "text-left" : "text-right tabular-nums"}`}
                  style={{ color: "var(--color-ink)" }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The bordered note shown where a chart or table has nothing to draw yet. */
export function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border p-5 text-[12.5px]"
      style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
    >
      {children}
    </div>
  );
}
