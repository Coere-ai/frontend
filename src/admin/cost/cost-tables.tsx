"use client";

import Link from "next/link";
import { useState } from "react";

import { ACCOUNT_SORTS, sortAccounts, type AccountSort, type AccountUsage, type ModelUsage, type TokenCounts } from "@/lib/admin/cost";
import { compact, dollars, whole } from "@/lib/dashboard/format";
import { MODEL_NAMES } from "@/lib/dashboard/usage";
import { Section, Segmented, Table } from "@/stats/panel/ui";

/** A model as the operator reads it. "" is a batch charged its reservation, which names no model. */
const modelName = (m: string) => (m === "" ? "Charged reservations" : (MODEL_NAMES[m] ?? m));

/** The token and money columns both tables share, in the order of their heads. */
const countCells = (c: TokenCounts) => [whole(c.requests), compact(c.inputTokens), compact(c.outputTokens), compact(c.cacheWriteTokens), compact(c.cacheReadTokens), dollars(c.costMicros)];

/** Each model's requests, the four token counts and cost over the range, then every model together. */
export function ModelTable({ title, models, total }: { title: string; models: ModelUsage[]; total: TokenCounts }) {
  const rows: React.ReactNode[][] = models.map((m) => [modelName(m.model), ...countCells(m)]);
  if (rows.length) rows.push([<strong key="t">Total</strong>, ...countCells(total).map((v, i) => <strong key={i}>{v}</strong>)]);
  return (
    <Section title={title}>
      <div className="overflow-x-auto whitespace-nowrap">
        <Table head={["Model", "Requests", "Input", "Output", "Cache write", "Cache read", "Cost"]} rows={rows} empty="No AI use in this range." />
      </div>
    </Section>
  );
}

/** Today's spend against the account's limit: the daily one, or the free first build's allowance while it runs. */
function todayCell(a: AccountUsage) {
  const over = a.todayMicros >= a.dailyLimitMicros;
  const text = `${dollars(a.todayMicros)} of ${dollars(a.dailyLimitMicros)}`;
  const label = a.firstBuildDone ? text : `First build: ${text}`;
  return over ? <strong key="today">{label}, paused</strong> : label;
}

/** The range's heaviest accounts, sorted by cost, tokens or requests. */
export function AccountTable({ title, accounts }: { title: string; accounts: AccountUsage[] }) {
  const [sort, setSort] = useState<AccountSort>("cost");
  const shown = sortAccounts(accounts, sort);
  return (
    <Section title={title} control={<Segmented value={sort} onChange={(v) => setSort(v as AccountSort)} options={ACCOUNT_SORTS.map((s) => ({ ...s }))} />}>
      <div className="overflow-x-auto whitespace-nowrap">
        <Table
          head={["Account", "Requests", "Tokens", "Cost", "Today"]}
          empty="No account used AI in this range."
          rows={shown.map((a) => [
            <Link key="a" href={`/admin/users/${a.id}`} className="underline-offset-2 hover:underline">
              {a.email ?? "No email"}
            </Link>,
            whole(a.requests),
            compact(a.tokens),
            dollars(a.costMicros),
            todayCell(a),
          ])}
        />
      </div>
      <p className="mt-2 text-[12px] text-[color:var(--color-muted)]">Tokens are input plus output. Today is the UTC day; before an account&apos;s first memory build finishes, its first build allowance applies instead of the daily limit.</p>
    </Section>
  );
}
