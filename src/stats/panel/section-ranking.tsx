import type { SectionStat } from "@/lib/analytics/types";

import { formatDuration } from "../charts/format";
import { HorizontalBarChart } from "../charts/horizontal-bar-chart";

import { pct } from "./labels";
import { Framed, Table } from "./ui";

/**
 * Where on one page the reading time went.
 *
 * Two views of the same sections. The bars rank them by total reading time,
 * which is "what did people actually read". The table keeps page order, which
 * is "how far did they get": reach falling down the column is the drop-off.
 */
export function SectionRanking({ sections }: { sections: SectionStat[] }) {
  const ranked = [...sections].sort((a, b) => b.totalSeconds - a.totalSeconds);
  const inPageOrder = [...sections].sort((a, b) => a.position - b.position);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h4 className="mb-2 text-[12.5px] font-semibold text-[color:var(--color-ink)]">
          Where they spend time
        </h4>
        <Framed>
          <HorizontalBarChart
            height={Math.max(160, ranked.length * 32 + 40)}
            labelWidth="11rem"
            series={ranked.map((s) => ({
              id: s.id,
              label: s.label,
              color: "var(--color-chart)",
              values: [s.totalSeconds],
              format: formatDuration,
            }))}
          />
        </Framed>
      </div>
      <div>
        <h4 className="mb-2 text-[12.5px] font-semibold text-[color:var(--color-ink)]">
          How far down they get
        </h4>
        <Table
          head={["Section", "Reached", "Avg time", "Share of time"]}
          empty="No sections recorded yet."
          rows={inPageOrder.map((s) => [
            <span key="s" className="font-medium" title={s.label}>
              {s.label}
            </span>,
            pct(s.reach),
            formatDuration(s.avgSeconds),
            pct(s.share),
          ])}
        />
      </div>
    </div>
  );
}
