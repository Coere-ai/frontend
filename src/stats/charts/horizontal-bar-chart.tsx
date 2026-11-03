"use client";

import { Fragment } from "react";

import type { MultiSeries } from "./multi-line-chart";

// Horizontal bar comparison
//
// Collapses each series to a single TOTAL and draws one horizontal bar per
// series, so pages, places, sources and sections are compared side by side on
// a shared baseline. Bars scale to the largest total. Label, track, fill and
// value, in one grid.

export function HorizontalBarChart({
  series,
  height = 320,
  labelWidth = "8rem",
}: {
  series: MultiSeries[];
  height?: number;
  /** Width of the label gutter, as a CSS length. Metric names fit the default;
   *  place names like "Newfoundland and Labrador" need more before they stop
   *  being distinguishable from each other once truncated.
   *
   *  "auto" sizes the gutter to the longest label instead, so nothing is ever
   *  cut off. Use it where the labels are the answer rather than a key to it,
   *  and where they are bounded: a gutter that grows to fit is a gutter that
   *  can squeeze the bars. */
  labelWidth?: string;
}) {
  const auto = labelWidth === "auto";
  const rows = series
    .map((s) => ({
      id: s.id,
      label: s.label,
      color: s.color,
      value: s.values.reduce((a, b) => a + (b || 0), 0),
      format: s.format,
    }))
    .sort((a, b) => b.value - a.value);
  const max = Math.max(1, ...rows.map((r) => r.value));

  if (rows.length === 0) {
    return (
      <div className="grid place-items-center text-[12.5px] text-zinc-400" style={{ height }}>
        Add a metric to compare.
      </div>
    );
  }

  // One grid for the whole chart rather than a flex row per bar: the three
  // columns are then shared, which is what lets the label column size to the
  // longest label with every track still starting at the same x. Per-row flex
  // could only ever do that with a width fixed in advance.
  return (
    <div
      className="grid content-center items-center gap-x-2.5 gap-y-2.5 py-2"
      style={{
        minHeight: height,
        gridTemplateColumns: `${auto ? "max-content" : labelWidth} minmax(0, 1fr) max-content`,
      }}
    >
      {rows.map((r) => {
        const width = Math.round((r.value / max) * 100);
        return (
          <Fragment key={r.id}>
            <span
              className={`text-[12.5px] font-medium text-zinc-900 ${
                auto ? "whitespace-nowrap" : "truncate"
              }`}
              title={r.label}
            >
              {r.label}
            </span>
            <div className="h-4 overflow-hidden rounded-full bg-[color:var(--color-chart-track)]">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${width}%`, background: r.color }}
              />
            </div>
            <span className="min-w-[3.5rem] text-right text-[12.5px] tabular-nums text-zinc-900">
              {r.format ? r.format(r.value) : Math.round(r.value).toLocaleString("en-US")}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}
