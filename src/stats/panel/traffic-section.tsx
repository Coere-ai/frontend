"use client";

import { useMemo, useState } from "react";

import type { HourlyTraffic } from "@/lib/analytics/query/timeline";
import type { SiteAnalytics } from "@/lib/analytics/types";

import type { ChartType } from "../charts/chart-type-toggle";
import { buildSeries, seriesAxis, toCumulativeValues, type Range } from "../charts/chart-series";
import { MultiLineChart, type MultiSeries } from "../charts/multi-line-chart";
import { RangeToggle } from "../charts/range-toggle";

import { Section } from "./ui";

/**
 * Views, visitors and conversions over time, on one axis.
 *
 * Three series together because the question is how they move TOGETHER: views
 * without visitors is one person refreshing, and views without conversions is
 * traffic that did nothing. The day, week and month views read the hourly
 * bundle; the year view reads the daily series.
 */
export function TrafficSection({
  data,
  hourly,
}: {
  data: SiteAnalytics;
  hourly: HourlyTraffic | null;
}) {
  const [range, setRange] = useState<Range>("month");
  const [chartType, setChartType] = useState<ChartType>("line");
  const [cumulative, setCumulative] = useState(false);

  const chart = useMemo(() => {
    const asDaily = (pick: (d: SiteAnalytics["daily"][number]) => number) =>
      data.daily.map((d) => ({ date: d.date, count: pick(d) }));
    // Today's 24-slot strip, the fallback for a payload cached without the
    // hourly bundle, so the day view still draws per hour.
    const todayStrip = (pick: (h: SiteAnalytics["hourly"][number]) => number) =>
      data.hourly.map((h) => ({ date: String(h.hour), count: pick(h) }));

    const line = (
      daily: (d: SiteAnalytics["daily"][number]) => number,
      today: (h: SiteAnalytics["hourly"][number]) => number,
      wide: HourlyTraffic[keyof HourlyTraffic] | undefined,
    ) => buildSeries(asDaily(daily), range, wide ?? todayStrip(today));

    // Every line shares one x axis, so the axis is built ONCE from the views.
    const views = line((d) => d.views, (h) => h.views, hourly?.views);
    const { labels, ticks } = seriesAxis(views);

    const series: MultiSeries[] = [
      {
        id: "views",
        label: "Views",
        color: "var(--color-chart)",
        values: views.map((p) => p.value),
      },
      {
        id: "uniques",
        label: "Visitors",
        color: "var(--color-chart-soft)",
        values: line((d) => d.uniques, (h) => h.uniques, hourly?.uniques).map((p) => p.value),
      },
      {
        id: "conversions",
        label: "Conversions",
        color: "var(--color-chart-deep)",
        values: line((d) => d.conversions, (h) => h.conversions, hourly?.conversions).map(
          (p) => p.value,
        ),
      },
    ];

    return {
      labels,
      ticks,
      series: cumulative
        ? series.map((s) => ({ ...s, values: toCumulativeValues(s.values) }))
        : series,
    };
  }, [data, hourly, range, cumulative]);

  return (
    <Section
      title="Traffic"
      control={
        <RangeToggle
          value={range}
          onChange={setRange}
          ranges={["day", "week", "month", "year"]}
          chartType={chartType}
          onChartType={setChartType}
          cumulative={cumulative}
          onCumulative={setCumulative}
        />
      }
    >
      <div className="mt-1">
        <MultiLineChart
          labels={chart.labels}
          ticks={chart.ticks}
          series={chart.series}
          type={chartType}
          switchable={false}
          height={300}
        />
      </div>
    </Section>
  );
}
