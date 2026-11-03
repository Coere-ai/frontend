"use client";

import { useEffect, useRef, useState } from "react";
import { fmtCompact, labelIndexes } from "./chart-axis";
import { ChartTypeToggle, type ChartType } from "./chart-type-toggle";

// Dependency-free multi-series chart. A single (left) Y axis whose scale spans
// ALL series, so every metric is plotted on the same scale and stays directly
// comparable. Shared x labels (time). Renders as
// line, area, or grouped-bar via the top-right switcher. Hover shows every
// series at that point.

export interface MultiSeries {
  id: string;
  label: string;
  color: string;
  /** Values aligned by index with `labels`. */
  values: number[];
  /** Tooltip / axis formatter (e.g. money). */
  format?: (n: number) => string;
}

/** Axis numbers in the page's own font, Geist, with figures of equal width so
 *  a column of ticks lines up. */
const AXIS_TEXT = { fontVariantNumeric: "tabular-nums" } as const;

export function MultiLineChart({
  labels,
  ticks,
  series,
  height = 300,
  type = "line",
  switchable = true,
}: {
  labels: string[];
  /** Axis-tick text per bucket (undefined = this bucket carries no label), from
   *  chartSeries' seriesAxis(). When supplied, only these buckets can be
   *  labelled, an hourly week reads as seven dates, not 168 timestamps. */
  ticks?: (string | undefined)[];
  series: MultiSeries[];
  height?: number;
  type?: ChartType;
  switchable?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  // Parent-controlled when switchable=false (the switcher lives on the range
  // row); internal state only backs the optional built-in switcher.
  const [internalCt, setInternalCt] = useState<ChartType>(type);
  const ct = switchable ? internalCt : type;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0]?.contentRect.width;
      if (cw) setWidth(cw);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = labels.length;
  const w = width || 680;
  const padLeft = 46;
  const padRight = 14;
  const padTop = switchable ? 20 : 14;
  const padBottom = 26;
  const innerW = Math.max(1, w - padLeft - padRight);
  const innerH = Math.max(1, height - padTop - padBottom);

  // One scale for every series, the axis spans the max value across all of them.
  const max = Math.max(1, ...series.flatMap((s) => s.values), 0);
  const baseY = padTop + innerH;

  const slot = innerW / Math.max(1, n);
  const xAt = (i: number) => padLeft + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const barXc = (i: number) => padLeft + (i + 0.5) * slot;
  const cx = (i: number) => (ct === "bar" ? barXc(i) : xAt(i));
  const yAt = (v: number) => padTop + innerH - (v / max) * innerH;

  const lineFor = (s: MultiSeries) =>
    s.values.map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ");
  const areaFor = (s: MultiSeries) =>
    s.values.length > 0
      ? `${lineFor(s)} L${xAt(s.values.length - 1).toFixed(1)},${baseY.toFixed(1)} L${xAt(0).toFixed(1)},${baseY.toFixed(1)} Z`
      : "";

  // Grouped bars: each x slot holds one bar per series, side by side.
  const groupW = slot * 0.74;
  const k = Math.max(1, series.length);
  const barW = Math.max(1, groupW / k);

  const allMoney = series.length > 0 && series.every((s) => s.format);
  const moneyFmt = allMoney ? series[0]!.format : undefined;
  const axisFmt = (v: number) => (moneyFmt ? moneyFmt(v) : fmtCompact(v));
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  const tickText = (i: number) => ticks?.[i] ?? labels[i] ?? "";
  const labelIdxs = labelIndexes(labels, ticks, innerW);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (n <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const i =
      ct === "bar"
        ? Math.max(0, Math.min(n - 1, Math.floor((x - padLeft) / slot)))
        : n <= 1
          ? 0
          : Math.max(0, Math.min(n - 1, Math.round(((x - padLeft) / innerW) * (n - 1))));
    setHover(i);
  };

  const hoverX = hover != null ? cx(hover) : 0;
  const tipLeft = hover != null ? Math.min(Math.max(hoverX, 60), w - 60) : 0;

  return (
    <div ref={wrapRef} style={{ width: "100%", position: "relative" }} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      {switchable && (
        <div className="absolute right-0 top-0 z-10">
          <ChartTypeToggle value={internalCt} onChange={setInternalCt} />
        </div>
      )}
      <svg width={w} height={height} style={{ display: "block" }}>
        {/* Horizontal gridlines + left axis tick labels. */}
        {yTicks.map((t) => {
          const y = padTop + innerH - t * innerH;
          return (
            <g key={t}>
              <line x1={padLeft} y1={y} x2={padLeft + innerW} y2={y} stroke="var(--color-line)" strokeWidth={1} />
              <text x={padLeft - 7} y={y + 3} textAnchor="end" fontSize="9" fill="var(--color-ink)" style={AXIS_TEXT}>
                {axisFmt(max * t)}
              </text>
            </g>
          );
        })}

        {/* Series, bars (grouped) or lines/areas. */}
        {ct === "bar"
          ? series.map((s, si) =>
              s.values.map((v, i) => {
                const bh = (v / max) * innerH;
                const x = barXc(i) - groupW / 2 + si * barW;
                return <rect key={s.id + "-" + i} x={x} y={baseY - bh} width={Math.max(1, barW - 1)} height={Math.max(0, bh)} rx={1.5} fill={s.color} opacity={hover === i ? 1 : 0.88} />;
              }),
            )
          : series.map((s) => (
              <g key={s.id}>
                {ct === "area" && <path d={areaFor(s)} fill={s.color} fillOpacity={0.12} />}
                <path d={lineFor(s)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                {n <= 60 && s.values.map((v, i) => <circle key={i} cx={xAt(i)} cy={yAt(v)} r={2} fill={s.color} />)}
              </g>
            ))}

        {/* Hover crosshair + per-series points. */}
        {hover != null && n > 0 && (
          <>
            <line x1={hoverX} y1={padTop} x2={hoverX} y2={baseY} stroke="var(--color-muted)" strokeWidth={1} strokeDasharray="3 3" />
            {ct !== "bar" &&
              series.map((s) => (
                <circle key={s.id} cx={hoverX} cy={yAt(s.values[hover] ?? 0)} r={3.5} fill={s.color} stroke="var(--color-canvas)" strokeWidth={1.5} />
              ))}
          </>
        )}

        {labelIdxs.map((i) => (
          <text
            key={i}
            x={cx(i)}
            y={height - 6}
            textAnchor={ct === "bar" ? "middle" : i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
            fontSize="9"
            fill="var(--color-ink)"
            style={AXIS_TEXT}
          >
            {tickText(i)}
          </text>
        ))}
      </svg>

      {/* Multi-series tooltip. */}
      {hover != null && n > 0 && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[color:var(--color-border)] bg-white px-2.5 py-1.5 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)]"
          style={{ left: tipLeft, top: 6 }}
        >
          <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400">{labels[hover]}</div>
          <div className="space-y-0.5">
            {series.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5 text-[11px]">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="text-zinc-500">{s.label}</span>
                <span className="ml-auto pl-3 font-semibold tabular-nums text-zinc-900">
                  {s.format ? s.format(s.values[hover] ?? 0) : (s.values[hover] ?? 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
