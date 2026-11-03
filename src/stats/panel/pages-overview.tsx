import type { PageStat } from "@/lib/analytics/types";

import { formatDuration } from "../charts/format";
import { HorizontalBarChart } from "../charts/horizontal-bar-chart";

import { PREVIEW_ROWS } from "./place-block";
import { EmptyCard, Framed, Table } from "./ui";

/**
 * Every page, side by side, as the way into one of them.
 *
 * The bar answers "where did people land". The table adds how long they
 * stayed, how far they scrolled and which part held them longest, and each row
 * opens that page's own dashboard.
 */
export function PagesOverview({
  pages,
  onPick,
}: {
  pages: PageStat[];
  onPick: (path: string) => void;
}) {
  if (pages.length === 0) return <EmptyCard>No page views yet.</EmptyCard>;
  const top = pages.slice(0, PREVIEW_ROWS);

  return (
    <div className="space-y-6">
      <Framed>
        <HorizontalBarChart
          height={Math.max(160, top.length * 34 + 40)}
          labelWidth="auto"
          series={top.map((p) => ({
            id: p.path,
            label: p.label,
            color: "var(--color-chart)",
            values: [p.views],
          }))}
        />
      </Framed>

      <div>
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="text-[12.5px] font-semibold text-[color:var(--color-ink)]">Every page</h4>
          <p className="text-[11.5px] text-[color:var(--color-muted)]">
            Pick a page to see which of its sections people read.
          </p>
        </div>
        <Table
          head={["Page", "Views", "Avg time", "Scroll", "Most read section"]}
          empty="No page views yet."
          onRowClick={(i) => onPick(pages[i]!.path)}
          rows={pages.map((p) => [
            <button
              key="p"
              type="button"
              onClick={(e) => {
                // The row handles the click; this keeps the keyboard path.
                e.stopPropagation();
                onPick(p.path);
              }}
              className="text-left font-medium underline-offset-2 hover:underline"
            >
              {p.label}
              <span className="ml-2 font-normal text-[11.5px] text-[color:var(--color-muted)]">
                {p.path}
              </span>
            </button>,
            p.views.toLocaleString(),
            formatDuration(p.avgSeconds),
            `${p.avgScroll}%`,
            p.topSection ? (
              <span key="s" title={`${formatDuration(p.topSection.totalSeconds)} read in total`}>
                {p.topSection.label}
              </span>
            ) : (
              <span key="s" className="text-[color:var(--color-muted-soft)]">
                Not yet recorded
              </span>
            ),
          ])}
        />
      </div>
    </div>
  );
}
