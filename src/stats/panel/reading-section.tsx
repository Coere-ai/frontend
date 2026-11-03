import type { SiteAnalytics } from "@/lib/analytics/types";

import { SectionsRead } from "../sections/sections-read";

import { PagesOverview } from "./pages-overview";
import { SectionRanking } from "./section-ranking";
import { EmptyCard, Section } from "./ui";

/**
 * What they read.
 *
 * Site-wide, that is a list of pages to choose from. For one page, it is the
 * page broken into its sections: which ones held readers, how far down they
 * got, and a live preview of each.
 */
export function ReadingSection({
  data,
  onPick,
}: {
  data: SiteAnalytics;
  onPick: (path: string) => void;
}) {
  if (!data.scope) {
    return (
      <Section title="What they read">
        <PagesOverview pages={data.pages} onPick={onPick} />
      </Section>
    );
  }

  return (
    <Section title="What they read on this page">
      {data.sections.length === 0 ? (
        <EmptyCard>
          No section readings for this page in this range yet. Sections are found from the
          page&apos;s own section blocks, so they appear here after its next visit.
        </EmptyCard>
      ) : (
        <div className="space-y-8">
          <SectionRanking sections={data.sections} />
          <SectionsRead path={data.scope} sections={data.sections} />
        </div>
      )}
    </Section>
  );
}
