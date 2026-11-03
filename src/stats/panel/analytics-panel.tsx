"use client";

import { useState } from "react";

import type { Audience, SiteAnalytics } from "@/lib/analytics/types";

import { formatDuration } from "../charts/format";
import { RefreshButton } from "../charts/refresh-button";

import { ReferrersSection, UsageSection } from "./audience-sections";
import { GeoSection } from "./geo-section";
import { pct } from "./labels";
import { PagePicker } from "./page-picker";
import { ReadingSection } from "./reading-section";
import { ScopeBar } from "./scope-bar";
import { TrafficSection } from "./traffic-section";
import { Kpi, Segmented } from "./ui";
import { usePageScope } from "./use-page-scope";
import { POLL_MS, useSiteAnalytics } from "./use-site-analytics";

// Site analytics panel
//
// What the public site is doing: views and how they trend, how long people
// read, which pages and which parts of them, where they are, what they use and
// how they found us. Everything here is a reading, not a control.
//
// Two filters apply to every number at once. Audience splits people from
// crawlers. Page scopes the whole panel to one page, which is where the
// section-by-section reading lives.

const DEFAULT_DAYS = 30;

export function AnalyticsPanel() {
  // People by default: a view count that silently includes Googlebot is
  // answering a different question.
  const [audience, setAudience] = useState<Audience>("human");
  const [page, setPage] = usePageScope();
  const { data, hourly, loading, error, reload } = useSiteAnalytics(DEFAULT_DAYS, audience, page);

  if (loading && !data) {
    return <p className="p-6 text-[13px] text-[color:var(--color-ink)]">Loading site analytics…</p>;
  }
  if (error && !data) {
    return (
      <div className="p-6">
        <p className="text-[13px] font-medium text-[color:var(--color-ink)]">{error}</p>
        <RefreshButton onRefresh={reload} intervalSec={POLL_MS / 1000} />
      </div>
    );
  }
  if (!data) return null;

  // The numbers on screen belong to the previous choice until the new ones
  // land. Dim them, so nobody reads the site's totals as one page's.
  const stale = data.scope !== page;

  return (
    <div className="space-y-8 p-1">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-[color:var(--color-ink)]">Site analytics</h2>
        <div className="flex flex-wrap items-center gap-2">
          <PagePicker value={page} options={data.pageOptions} onChange={setPage} />
          <Segmented
            value={audience}
            onChange={(v) => setAudience(v as Audience)}
            options={[
              { value: "human", label: "People" },
              { value: "bot", label: "Crawlers" },
              { value: "all", label: "Everything" },
            ]}
          />
          <RefreshButton onRefresh={reload} intervalSec={POLL_MS / 1000} />
        </div>
      </header>

      {page && <ScopeBar page={page} options={data.pageOptions} onClear={() => setPage(null)} />}

      <div
        className="space-y-8 transition-opacity"
        style={{ opacity: stale ? 0.45 : 1 }}
        aria-busy={stale}
      >
        <Headline data={data} />
        <TrafficSection data={data} hourly={hourly} />
        <ReadingSection data={data} onPick={setPage} />
        <GeoSection geo={data.geo} />
        <UsageSection data={data} />
        <ReferrersSection data={data} />
      </div>
    </div>
  );
}

/**
 * The headline tiles. Scoped to one page, conversion rate gives way to scroll
 * depth: most pages have no call to action, and "0%" on a docs page would read as
 * a failure when it is simply the wrong question for that page.
 */
function Headline({ data }: { data: SiteAnalytics }) {
  const { totals, last24h } = data;
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <Kpi label="Total views" value={data.lifetimeViews.toLocaleString()} />
      <Kpi label="Views, last 24h" value={last24h.views.toLocaleString()} />
      <Kpi label="Unique visitors" value={totals.uniqueVisitors.toLocaleString()} />
      <Kpi label="Average time" value={formatDuration(totals.avgSeconds)} />
      {data.scope ? (
        <Kpi label="Scroll depth" value={`${totals.avgScroll}%`} />
      ) : (
        <Kpi label="Conversion rate" value={pct(totals.conversionRate)} />
      )}
    </section>
  );
}
