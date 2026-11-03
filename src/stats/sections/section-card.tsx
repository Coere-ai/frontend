import type { SectionStat } from "@/lib/analytics/types";
import { PAGE_SECTIONS, sectionMeta } from "@/lib/sections";

import { formatDuration } from "../charts/format";
import { pct } from "../panel/labels";

import { SectionPreview } from "./section-preview";

/**
 * One section of one page: a live preview, then how much it was read.
 *
 * `order` is the card's place under the current sort, applied with CSS rather
 * than by moving the element, because moving an iframe reloads it.
 */
export function SectionCard({
  stat,
  peakSeconds,
  order,
}: {
  stat: SectionStat;
  peakSeconds: number;
  order: number;
}) {
  // Only hand-tagged sections have a written blurb.
  const blurb = PAGE_SECTIONS[stat.path] ? sectionMeta(stat.id)?.blurb : undefined;
  const read = stat.views > 0;

  return (
    <li
      className="group overflow-hidden rounded-xl border transition-[border-color,box-shadow] hover:shadow-sm"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", order }}
    >
      <SectionPreview path={stat.path} id={stat.id} label={stat.label} />

      <div className="px-3.5 pt-3 pb-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <h4
            className="truncate text-[13px] font-semibold text-[color:var(--color-ink)]"
            title={stat.label}
          >
            {stat.label}
          </h4>
          {read && (
            <span className="shrink-0 tabular-nums text-[11.5px]" style={{ color: "var(--color-muted)" }}>
              {stat.views} read
            </span>
          )}
        </div>

        {blurb && (
          <p className="mt-0.5 truncate text-[11.5px]" style={{ color: "var(--color-muted-soft)" }}>
            {blurb}
          </p>
        )}

        <dl className="mt-3 grid grid-cols-2 gap-2">
          <Metric label="Avg time" value={read ? formatDuration(stat.avgSeconds) : "None"} />
          <Metric label="Total time" value={read ? formatDuration(stat.totalSeconds) : "None"} />
        </dl>

        {/* Two readings of the same row: how much of the page's reading time
            this section took, and how far down the page people got. */}
        <div className="mt-3">
          <Bar
            title="Share of the page's section time"
            value={stat.totalSeconds / peakSeconds}
            caption={`${pct(stat.share)} of time read`}
          />
          <Bar
            title="Share of visits that got here"
            value={stat.reach}
            caption={`${pct(stat.reach)} of visits reached it`}
            subtle
          />
        </div>
      </div>
    </li>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg px-2.5 py-2" style={{ background: "var(--color-canvas-soft)" }}>
      <dt
        className="text-[10px] font-medium tracking-[0.07em] uppercase"
        style={{ color: "var(--color-muted)" }}
      >
        {label}
      </dt>
      <dd className="mt-0.5 tabular-nums text-[15px] font-semibold text-[color:var(--color-ink)]">
        {value}
      </dd>
    </div>
  );
}

/** A thin meter with a caption. Full blue for time, a lighter step for reach. */
function Bar({
  title,
  value,
  caption,
  subtle = false,
}: {
  title: string;
  value: number;
  caption: string;
  subtle?: boolean;
}) {
  const w = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="mt-1.5" title={title}>
      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--color-chart-track)" }}>
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${w}%`,
            background: subtle ? "var(--color-chart-soft)" : "var(--color-chart)",
          }}
        />
      </div>
      <p className="mt-1 text-[11px]" style={{ color: "var(--color-muted)" }}>
        {caption}
      </p>
    </div>
  );
}
