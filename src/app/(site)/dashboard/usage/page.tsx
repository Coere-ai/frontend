import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/user";
import { compact, dollars, whole } from "@/lib/dashboard/format";
import { readPause } from "@/lib/dashboard/paused";
import { readMonth, readTotals, thisMonth } from "@/lib/dashboard/reads";
import { KIND_NAMES, MODEL_NAMES, summarize } from "@/lib/dashboard/usage";
import { readUsageEvents } from "@/lib/dashboard/usage-reads";
import { sessionClient } from "@/lib/supabase/server";
import { DayColumns, ShareBars } from "@/site/dashboard/bars";
import { PageHeader, Panel, Row, Stat, StatGrid } from "@/site/dashboard/panel";
import { PausedNote } from "@/site/dashboard/paused-note";

export const metadata: Metadata = { title: "Usage" };

/** How far back the charts reach. */
const DAYS = 30;

/**
 * What the AI used for this account: this month, the last 30 days by day,
 * model and kind, and the running totals. It shows no limit and no meter
 * against one. Every read goes through the person's session, so they see
 * only their own rows, except whether their AI use is paused: that one
 * answer comes from the server, and only while it is true does the page say
 * so, in one line with no number.
 */
export default async function UsagePage() {
  const user = await requireUser("/dashboard/usage");
  const db = await sessionClient();
  const now = new Date();
  const from = new Date(now.getTime() - (DAYS - 1) * 86_400_000);
  const since = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())).toISOString();
  const [month, totals, events, pause] = await Promise.all([
    readMonth(db, user.id, thisMonth(now)),
    readTotals(db, user.id),
    readUsageEvents(db, user.id, since),
    readPause(user.id),
  ]);
  const s = summarize(events, from, now);
  const started = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });

  return (
    <div className="space-y-8">
      <PageHeader title="Usage" lede="Coere pays for the AI that builds your memory. This is what it used." />

      <PausedNote pause={pause} />

      <Panel title="This month" description={`Since ${started}.`}>
        <p className="text-3xl font-medium tracking-[-0.03em] text-neutral-950">{dollars(month.costMicros)}</p>
        <div className="mt-6">
          <Row label="Requests">{whole(month.requests)}</Row>
          <Row label="Input tokens">{compact(month.inputTokens)}</Row>
          <Row label="Output tokens">{compact(month.outputTokens)}</Row>
        </div>
      </Panel>

      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="Cost by day" description={`The last ${DAYS} days, ${dollars(s.total.costMicros)} in all.`}>
          <DayColumns days={s.days.map((d) => ({ key: d.key, value: d.costMicros }))} format={dollars} label="AI cost by day" />
        </Panel>
        <Panel title="Tokens by day" description={`The last ${DAYS} days, ${compact(s.total.tokens)} in all.`}>
          <DayColumns days={s.days.map((d) => ({ key: d.key, value: d.tokens }))} format={(v) => `${compact(v)} tokens`} label="Tokens by day" />
        </Panel>
        <Panel title="By model">
          <ShareBars
            empty="No AI use in the last 30 days."
            rows={s.models.map((m) => ({ key: m.key, label: MODEL_NAMES[m.key] ?? m.key, value: m.costMicros || m.tokens, note: `${dollars(m.costMicros)}, ${compact(m.tokens)} tokens` }))}
          />
        </Panel>
        <Panel title="By kind">
          <ShareBars
            empty="No AI use in the last 30 days."
            rows={s.kinds.map((k) => ({ key: k.key, label: KIND_NAMES[k.key] ?? k.key, value: k.costMicros || k.tokens, note: `${dollars(k.costMicros)}, ${whole(k.requests)} requests` }))}
          />
        </Panel>
      </div>

      <Panel title="Since you joined" description="Running totals for this account.">
        <StatGrid>
          <Stat label="Tokens saved" value={compact(totals.tokensSaved)} note="What you would have pasted by hand, less what Coere sent" />
          <Stat label="Tokens used" value={compact(totals.inputTokens + totals.outputTokens)} note={`${compact(totals.cacheReadTokens + totals.cacheWriteTokens)} more from cache`} />
          <Stat label="AI cost" value={dollars(totals.costMicros)} note={`${whole(totals.requests)} requests`} />
          <Stat label="Imports and transfers" value={whole(totals.contextImports + totals.transfers)} note={`${whole(totals.contextImports)} imports, ${whole(totals.transfers)} transfers`} />
        </StatGrid>
      </Panel>
    </div>
  );
}
