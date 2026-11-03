import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/user";
import { compact, dollars, whole } from "@/lib/dashboard/format";
import { resolveLimits, spentShare } from "@/lib/dashboard/limits";
import { readMonth, readPlan, readProfile, readTotals, thisMonth } from "@/lib/dashboard/reads";
import { KIND_NAMES, MODEL_NAMES, summarize } from "@/lib/dashboard/usage";
import { readUsageEvents } from "@/lib/dashboard/usage-reads";
import { sessionClient } from "@/lib/supabase/server";
import { DayColumns, ShareBars } from "@/site/dashboard/bars";
import { Meter, PageHeader, Panel, Row, Stat, StatGrid } from "@/site/dashboard/panel";

export const metadata: Metadata = { title: "Usage" };

/** How far back the charts reach. */
const DAYS = 30;

/**
 * This month against the monthly limit, the lifetime spend against the
 * lifetime limit when there is one, the last 30 days by day, model and kind,
 * and the account's running totals. The limits are the person's own when
 * the operator set them, else the plan's. Every read goes through the
 * person's session, so they see only their own rows.
 */
export default async function UsagePage() {
  const user = await requireUser("/dashboard/usage");
  const db = await sessionClient();
  const now = new Date();
  const from = new Date(now.getTime() - (DAYS - 1) * 86_400_000);
  const since = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())).toISOString();
  const profile = await readProfile(db, user.id);
  const [plan, month, totals, events] = await Promise.all([
    readPlan(db, profile?.planId ?? "free"),
    readMonth(db, user.id, thisMonth(now)),
    readTotals(db, user.id),
    readUsageEvents(db, user.id, since),
  ]);
  const s = summarize(events, from, now);
  const resets = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
  const limits = resolveLimits(profile, plan);
  const used = spentShare(month.costMicros, limits.monthlyMicros);
  const lifetime = limits.lifetimeMicros;
  const lifeUsed = lifetime === null ? 0 : spentShare(totals.costMicros, lifetime);

  return (
    <div className="space-y-8">
      <PageHeader title="Usage" lede="Coere pays for the AI that builds your memory, up to your monthly limit. This is what it used." />

      <Panel title="This month" description={`The limit starts again on ${resets}.`}>
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-3xl font-medium tracking-[-0.03em] text-neutral-950">{dollars(month.costMicros)}</p>
          <p className="text-[14px] text-neutral-500">
            {used}% of {dollars(limits.monthlyMicros)}
            {limits.ownMonthly ? "" : ` on ${plan.name}`}
          </p>
        </div>
        <div className="mt-4">
          <Meter value={used} label="Share of this month's limit used" />
        </div>
        <div className="mt-6">
          <Row label="Requests">{whole(month.requests)}</Row>
          <Row label="Input tokens">{compact(month.inputTokens)}</Row>
          <Row label="Output tokens">{compact(month.outputTokens)}</Row>
        </div>
      </Panel>

      {lifetime === null ? null : (
        <Panel title="Lifetime limit" description="Everything Coere has spent on AI for you since you joined. When it reaches the limit, memory work pauses until the limit is raised.">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-3xl font-medium tracking-[-0.03em] text-neutral-950">{dollars(totals.costMicros)}</p>
            <p className="text-[14px] text-neutral-500">
              {lifeUsed}% of {dollars(lifetime)} in all
            </p>
          </div>
          <div className="mt-4">
            <Meter value={lifeUsed} label="Share of the lifetime limit used" />
          </div>
        </Panel>
      )}

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
