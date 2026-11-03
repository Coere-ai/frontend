import type { BreakdownRow } from "@/lib/analytics/types";

import { pct } from "./labels";
import { EmptyCard } from "./ui";

/** A categorical split, drawn as labelled bars rather than a pie: the reader's
 *  question is "how much of the total", and a bar answers it against a shared
 *  baseline that a pie has to be measured by eye. */
export function Breakdown({
  title,
  rows,
  glyph,
  format,
}: {
  title: string;
  rows: BreakdownRow[];
  glyph: (key: string) => React.ReactNode;
  format?: (key: string) => string;
}) {
  return (
    <div>
      <h4 className="mb-2 text-[12.5px] font-semibold text-[color:var(--color-ink)]">
        {title}
      </h4>
      {rows.length === 0 ? (
        <EmptyCard>Nothing recorded yet.</EmptyCard>
      ) : (
        <ul
          className="space-y-2 rounded-xl border p-3"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          {rows.map((r) => (
            <li key={r.key || "unknown"}>
              <div className="flex items-center gap-2">
                <span className="shrink-0">{glyph(r.key)}</span>
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-[color:var(--color-ink)]">
                  {format ? format(r.key) : r.label}
                </span>
                <span className="shrink-0 text-[12px] tabular-nums text-[color:var(--color-ink)]">
                  {r.views.toLocaleString()}
                </span>
                <span className="w-10 shrink-0 text-right text-[11.5px] tabular-nums text-[color:var(--color-ink)]">
                  {pct(r.share)}
                </span>
              </div>
              <div
                className="mt-1 h-1 overflow-hidden rounded-full"
                style={{ background: "var(--color-chart-track)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(2, r.share * 100)}%`,
                    background: "var(--color-chart)",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
