"use client";

import type { Range } from "./chart-series";
import { ChartTypeToggle, type ChartType } from "./chart-type-toggle";

// Segmented range toggle for the traffic chart. Defaults to
// day/week/month/year; a chart can pass a narrower set.
// When `chartType`/`onChartType` are supplied it also renders the line/area/bar
// switcher on the SAME row; when `cumulative`/`onCumulative` are supplied it
// renders a running-total toggle too, so every chart's controls sit together.

export function RangeToggle({
  value,
  onChange,
  ranges = ["day", "week", "month", "year"],
  chartType,
  onChartType,
  cumulative,
  onCumulative,
}: {
  value: Range;
  onChange: (r: Range) => void;
  /** Which ranges to offer. */
  ranges?: Range[];
  /** When both are set, the line/area/bar switcher renders alongside the range. */
  chartType?: ChartType;
  onChartType?: (t: ChartType) => void;
  /** When both are set, a running-total (cumulative) toggle renders too. Only
   *  pass these for ADDITIVE-count charts (a running total of a level series is
   *  meaningless), so snapshot charts simply omit them. */
  cumulative?: boolean;
  onCumulative?: (c: boolean) => void;
}) {
  const pills = (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-canvas-soft)]/40 p-0.5">
      {ranges.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full capitalize transition-colors ${
            value === r ? "bg-zinc-900 text-white" : "text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );

  const hasType = chartType && onChartType;
  const hasCum = typeof cumulative === "boolean" && !!onCumulative;
  if (!hasType && !hasCum) return pills;
  return (
    <div className="inline-flex items-center gap-2">
      {hasType && (
        <ChartTypeToggle value={chartType!} onChange={onChartType!} />
      )}
      {hasCum && <CumulativeToggle value={cumulative!} onChange={onCumulative!} />}
      {pills}
    </div>
  );
}

// A text pill that switches a chart between per-bucket counts and a running
// total. Mirrors ChartTypeToggle's container + inner-button so its height lines
// up exactly with the line/area/bar switcher on the same row.
export function CumulativeToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (c: boolean) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-[color:var(--color-border)] bg-white/90 p-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm">
      <button
        type="button"
        onClick={() => onChange(!value)}
        aria-pressed={value}
        title={value ? "Showing a running total" : "Show a running total"}
        className={`inline-flex h-[22px] items-center justify-center rounded-[6px] px-2 text-[10.5px] font-semibold transition-colors ${
          value ? "bg-zinc-900 text-white" : "text-zinc-900 hover:bg-zinc-100"
        }`}
      >
        Total
      </button>
    </div>
  );
}
