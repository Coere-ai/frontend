"use client";

import { useMemo, useState } from "react";

import type { DayPoint } from "@/lib/admin/by-day";
import type { ChartType } from "@/stats/charts/chart-type-toggle";
import { buildSeries, seriesAxis, toCumulativeValues, type Range } from "@/stats/charts/chart-series";
import { MultiLineChart } from "@/stats/charts/multi-line-chart";
import { RangeToggle } from "@/stats/charts/range-toggle";
import { Section } from "@/stats/panel/ui";

export interface DayLine {
  id: string;
  label: string;
  points: DayPoint[];
  format?: (n: number) => string;
}

const COLORS = ["var(--color-chart)", "var(--color-chart-deep)", "var(--color-chart-soft)"];

/**
 * One or more daily series over the week, month or year, with the panel's
 * range, chart type and running total switches. The admin totals are kept
 * per UTC day, so there is no hourly view; every line shares the first
 * line's axis.
 */
export function DayChart({ title, lines, ranges = ["week", "month", "year"] }: { title: string; lines: DayLine[]; ranges?: Range[] }) {
  const [range, setRange] = useState<Range>("month");
  const [chartType, setChartType] = useState<ChartType>("line");
  const [cumulative, setCumulative] = useState(false);

  const chart = useMemo(() => {
    const built = lines.map((l) => buildSeries(l.points, range));
    const { labels, ticks } = seriesAxis(built[0] ?? []);
    const series = lines.map((l, i) => {
      const values = (built[i] ?? []).map((p) => p.value);
      return { id: l.id, label: l.label, color: COLORS[i % COLORS.length]!, format: l.format, values: cumulative ? toCumulativeValues(values) : values };
    });
    return { labels, ticks, series };
  }, [lines, range, cumulative]);

  return (
    <Section
      title={title}
      control={
        <RangeToggle
          value={range}
          onChange={setRange}
          ranges={ranges}
          chartType={chartType}
          onChartType={setChartType}
          cumulative={cumulative}
          onCumulative={setCumulative}
        />
      }
    >
      <MultiLineChart labels={chart.labels} ticks={chart.ticks} series={chart.series} type={chartType} switchable={false} height={260} />
    </Section>
  );
}
