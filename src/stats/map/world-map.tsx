"use client";

import { useMemo, useRef, useState } from "react";

import { regionName } from "@/lib/analytics/region-names";
import type { CountryStat, GeoRollup } from "@/lib/analytics/types";

import { countryName } from "../panel/labels";

import { bandColor, buildBands } from "./map-bands";
import { MapControls } from "./map-controls";
import { useCityPoints, useRegionPoints } from "./use-map-points";
import { useMapView } from "./use-map-view";
import { COUNTRIES, MAP_H, MAP_W } from "./world-shapes";

/**
 * The traffic map: a pannable, zoomable world with three ways to read it.
 *
 * COUNTRY mode shades each country by its total views. CITY mode drops a point
 * per city, sized by views. REGION mode sits between them, one point per
 * subdivision. They answer different questions, "which markets" against
 * "which places", and none is a better default for all three, so the mode is a
 * control rather than a decision made here.
 *
 * Every country is keyed by its ISO alpha-2 code, which is the same value the
 * edge writes into each visit, so shading a country is a map lookup with no
 * name matching in between.
 */

export type MapMode = "country" | "region" | "city";

/** The tooltip, with the wrapper's width at the moment it opened so it can
 *  stay inside the frame without reading a ref during render. */
type Hover = { label: string; sub: string; x: number; y: number; width: number };

export function WorldMap({
  geo,
  mode,
  shaded,
  className = "",
}: {
  geo: GeoRollup;
  mode: MapMode;
  /** Country shading on or off. Off leaves a plain map, which is the clearer
   *  background for city points. */
  shaded: boolean;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const { view, dragging, onPointerDown, onPointerMove, endDrag, zoomBy, reset } = useMapView(wrapRef);
  const [hover, setHover] = useState<Hover | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const byCode = useMemo(() => {
    const m = new Map<string, CountryStat>();
    for (const c of geo.countries) if (c.code) m.set(c.code.toUpperCase(), c);
    return m;
  }, [geo.countries]);
  const bands = useMemo(() => buildBands(geo.countries), [geo.countries]);
  const cityPoints = useCityPoints(geo.cities);
  const regionPoints = useRegionPoints(geo.cities);

  /** Show the tooltip at the cursor, in the wrapper's own coordinates. */
  const hoverAt = (e: React.MouseEvent, label: string, sub: string) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect) setHover({ label, sub, x: e.clientX - rect.left, y: e.clientY - rect.top, width: rect.width });
  };

  const points =
    mode === "city"
      ? cityPoints.map(({ c, x, y, r }) => ({
          key: `${c.country}-${c.region}-${c.city}`,
          x,
          y,
          r,
          label: c.city || "Unknown city",
          sub: `${c.views.toLocaleString()} views`,
        }))
      : mode === "region"
        ? regionPoints.map(({ r, x, y, radius }) => ({
            key: `${r.country}-${r.region}`,
            x,
            y,
            r: radius,
            label: regionName(r.country, r.region),
            sub: `${r.views.toLocaleString()} views in ${countryName(r.country)}`,
          }))
        : [];

  const total = geo.placedViews + geo.unplacedViews;
  const sel = selected ? byCode.get(selected) : null;

  return (
    <div className={className}>
      <div
        ref={wrapRef}
        className="relative touch-none overflow-hidden rounded-xl border select-none"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-canvas-soft)",
          cursor: dragging ? "grabbing" : "grab",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => {
          endDrag();
          setHover(null);
        }}
      >
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="block h-auto w-full">
          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
            {COUNTRIES.map((c) => {
              const views = byCode.get(c.code)?.views ?? 0;
              const shade = shaded ? bandColor(views, bands) : null;
              const isSel = selected === c.code;
              return (
                <path
                  key={c.code}
                  d={c.d}
                  fill={shade ?? "var(--color-map-land)"}
                  stroke="var(--color-map-border)"
                  // Divided by the scale so the border stays a hairline at every
                  // zoom level instead of growing into a band.
                  strokeWidth={(isSel ? 1.6 : 0.4) / view.k}
                  className="transition-[fill] duration-200"
                  style={{ cursor: views > 0 ? "pointer" : "default" }}
                  onMouseEnter={(e) => hoverAt(e, countryName(c.code), views > 0 ? `${views.toLocaleString()} views` : "No views")}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setSelected(isSel ? null : c.code)}
                />
              );
            })}

            {points.map((p) => (
              <circle
                key={p.key}
                cx={p.x}
                cy={p.y}
                r={p.r / view.k}
                fill="var(--color-chart)"
                fillOpacity={0.55}
                stroke="var(--color-chart)"
                strokeWidth={1 / view.k}
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => hoverAt(e, p.label, p.sub)}
                onMouseLeave={() => setHover(null)}
              />
            ))}
          </g>
        </svg>

        <MapControls
          showScale={shaded && bands.length > 0}
          onZoomIn={() => zoomBy(1.6)}
          onZoomOut={() => zoomBy(1 / 1.6)}
          onReset={reset}
        />

        {hover && (
          <div
            className="pointer-events-none absolute z-10 rounded-md px-2.5 py-1.5 text-[11.5px] shadow-lg"
            style={{
              left: Math.min(hover.x + 12, hover.width - 150),
              top: hover.y + 12,
              background: "var(--color-ink)",
              color: "var(--color-on-ink)",
            }}
          >
            <div className="font-semibold">{hover.label}</div>
            <div style={{ opacity: 0.75 }}>{hover.sub}</div>
          </div>
        )}

        {selected && (
          <div
            className="absolute bottom-3 left-3 rounded-lg border px-3 py-2 text-[12px]"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-ink)" }}
          >
            <b>{countryName(selected)}</b>{" "}
            {sel ? `${sel.views.toLocaleString()} views, ${sel.uniques.toLocaleString()} visitors` : "no views"}
          </div>
        )}

        {total === 0 && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <p className="max-w-[34ch] text-[12.5px]" style={{ color: "var(--color-ink)" }}>
              No located visits yet. Location is resolved at the edge, so it is empty in local development.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
