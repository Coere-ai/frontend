"use client";

import { useState } from "react";

import { regionName } from "@/lib/analytics/region-names";
import type { GeoRollup } from "@/lib/analytics/types";

import { WorldMap, type MapMode } from "../map/world-map";
import { formatDuration } from "../charts/format";

import { Flagged } from "./flagged";
import { countryName, flagEmoji, isKnown, pct } from "./labels";
import { PREVIEW_ROWS, PlaceBlock, type PlaceRow } from "./place-block";
import { Section, Segmented, Table } from "./ui";

/**
 * Where people are: the map with a list that follows its mode, then countries,
 * regions and cities as bars beside tables. The same place read at three
 * resolutions, in that order. Rows nothing could identify are left out.
 */
export function GeoSection({ geo }: { geo: GeoRollup }) {
  const [mode, setMode] = useState<MapMode>("country");
  const [shaded, setShaded] = useState(true);

  const countries = geo.countries
    .filter((c) => isKnown({ code: c.code, label: c.label }))
    .sort((a, b) => b.views - a.views);
  const regions = geo.regions
    .filter((r) => r.code !== "" && r.label !== "Unknown")
    .sort((a, b) => b.views - a.views);
  const cities = geo.cities
    .filter((c) => c.city && c.city !== "Unknown")
    .sort((a, b) => b.views - a.views);

  const countryRows: PlaceRow[] = countries.slice(0, PREVIEW_ROWS).map((c) => ({
    id: c.code,
    barLabel: `${flagEmoji(c.code)} ${countryName(c.code)}`.trim(),
    views: c.views,
    cells: [
      <Flagged key="c" country={c.code}>{countryName(c.code)}</Flagged>,
      c.views.toLocaleString(),
      c.uniques.toLocaleString(),
      formatDuration(c.avgSeconds),
    ],
  }));
  const regionRows: PlaceRow[] = regions.map((r) => ({
    id: `${r.country}-${r.code}`,
    barLabel: `${flagEmoji(r.country)} ${regionName(r.country, r.code)}`.trim(),
    views: r.views,
    cells: [
      regionName(r.country, r.code),
      <Flagged key="c" country={r.country}>{countryName(r.country)}</Flagged>,
      r.views.toLocaleString(),
      formatDuration(r.avgSeconds),
    ],
  }));
  const cityRows: PlaceRow[] = cities.map((c) => ({
    id: `${c.country}-${c.region}-${c.city}`,
    barLabel: `${flagEmoji(c.country)} ${c.city}`.trim(),
    views: c.views,
    cells: [
      <Flagged key="c" country={c.country}>{c.city}</Flagged>,
      // The region rather than the country: the flag already says which
      // country, and two Springfields are told apart by the state.
      c.region ? regionName(c.country, c.region) : countryName(c.country),
      c.views.toLocaleString(),
      formatDuration(c.avgSeconds),
    ],
  }));

  // The list beside the map follows the map's own mode, so the two never
  // describe different things at the same time.
  const side = {
    country: {
      head: ["Country", "Views", "Share"],
      empty: "No located visits yet.",
      rows: countries.slice(0, PREVIEW_ROWS).map((c) => [
        <Flagged key="c" country={c.code} strong>{countryName(c.code)}</Flagged>,
        c.views.toLocaleString(),
        pct(c.share),
      ]),
    },
    region: {
      head: ["Region", "Views", "Visitors"],
      empty: "No regional data yet.",
      rows: regions.slice(0, PREVIEW_ROWS).map((r) => [
        <Flagged key="c" country={r.country} strong>{regionName(r.country, r.code)}</Flagged>,
        r.views.toLocaleString(),
        r.uniques.toLocaleString(),
      ]),
    },
    city: {
      head: ["City", "Views", "Visitors"],
      empty: "No located visits yet.",
      rows: cities.slice(0, PREVIEW_ROWS).map((c) => [
        <Flagged key="c" country={c.country} strong>{c.city}</Flagged>,
        c.views.toLocaleString(),
        c.uniques.toLocaleString(),
      ]),
    },
  }[mode];

  return (
    <Section
      title="Where people are"
      control={
        <div className="flex items-center gap-2">
          <Segmented
            value={mode}
            onChange={(v) => setMode(v as MapMode)}
            options={[
              { value: "country", label: "Country" },
              { value: "region", label: "Region" },
              { value: "city", label: "City" },
            ]}
          />
          {/* Filled when on, to match the Segmented control beside it. */}
          <button
            type="button"
            onClick={() => setShaded((v) => !v)}
            aria-pressed={shaded}
            className="rounded-md border px-2.5 py-1 text-[11.5px] transition-colors"
            style={{
              background: shaded ? "var(--color-accent)" : "transparent",
              borderColor: shaded ? "var(--color-accent)" : "var(--color-border)",
              color: shaded ? "#fff" : "var(--color-ink)",
            }}
          >
            Shading
          </button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <WorldMap geo={geo} mode={mode} shaded={shaded} />
        <Table head={side.head} rows={side.rows} empty={side.empty} />
      </div>

      <div className="mt-8 space-y-8">
        <PlaceBlock
          title="Countries"
          head={["Country", "Views", "Visitors", "Avg time"]}
          rows={countryRows}
          empty="No located visits yet."
        />
        <PlaceBlock
          title="Regions"
          head={["Region", "Country", "Views", "Avg time"]}
          rows={regionRows}
          empty="No regional data yet."
          expandable
        />
        <PlaceBlock
          title="Cities"
          head={["City", "Region", "Views", "Avg time"]}
          rows={cityRows}
          empty="No city data yet."
          expandable
        />
      </div>
    </Section>
  );
}
