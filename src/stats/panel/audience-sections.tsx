import { referrerLabel, referrerMeaning } from "@/lib/analytics/referrers";
import type { SiteAnalytics } from "@/lib/analytics/types";

import { BrowserGlyph } from "../glyphs/browser-glyphs";
import { DeviceGlyph, PlatformGlyph } from "../glyphs/platform-glyphs";
import { HorizontalBarChart } from "../charts/horizontal-bar-chart";

import { Breakdown } from "./breakdown";
import { isKnown } from "./labels";
import { PREVIEW_ROWS } from "./place-block";
import { EmptyCard, Framed, Section, Table } from "./ui";

/** Device, browser and operating system, side by side. */
export function UsageSection({ data }: { data: SiteAnalytics }) {
  return (
    <Section title="What they use">
      <div className="grid gap-6 lg:grid-cols-3">
        <Breakdown
          title="Device"
          rows={data.devices.filter(isKnown)}
          glyph={(k) => <DeviceGlyph name={k} />}
          format={(k) => (k === "" ? "Unknown" : k[0]!.toUpperCase() + k.slice(1))}
        />
        <Breakdown
          title="Browser"
          rows={data.browsers.filter(isKnown)}
          glyph={(k) => <BrowserGlyph name={k} />}
        />
        <Breakdown
          title="Operating system"
          rows={data.operatingSystems.filter(isKnown)}
          glyph={(k) => <PlatformGlyph name={k} />}
        />
      </div>
    </Section>
  );
}

/**
 * How people found the site.
 *
 * A column of bare hosts ("t.co", "lnkd.in") and one row called "Direct" is not
 * an answer: nobody browses t.co, and "Direct" reads as a gap in the data when
 * it is the opposite. So each row is named after the thing the person was
 * actually using, and says in words what it means.
 */
export function ReferrersSection({ data }: { data: SiteAnalytics }) {
  const referrers = data.referrers.slice(0, PREVIEW_ROWS);
  return (
    <Section title="How they found the site">
      {referrers.length === 0 ? (
        <EmptyCard>No visits recorded yet.</EmptyCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Framed>
            <HorizontalBarChart
              height={Math.max(160, referrers.length * 34 + 40)}
              labelWidth="11rem"
              series={referrers.map((r) => ({
                id: r.key || "direct",
                label: referrerLabel(r.key),
                color: "var(--color-chart)",
                values: [r.views],
              }))}
            />
          </Framed>
          <Table
            head={["Source", "What it means", "Views", "Visitors"]}
            empty="No visits recorded yet."
            rows={referrers.map((r) => [
              <span key="s" className="font-medium">
                {referrerLabel(r.key)}
              </span>,
              <span key="m">{referrerMeaning(r.key)}</span>,
              r.views.toLocaleString(),
              r.uniques.toLocaleString(),
            ])}
          />
        </div>
      )}
    </Section>
  );
}
