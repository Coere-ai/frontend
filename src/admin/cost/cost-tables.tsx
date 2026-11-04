"use client";

import Link from "next/link";
import { useState } from "react";

import { ACCOUNT_SORTS, sortAccounts, type AccountSort, type AccountUsage, type ModelUsage, type TokenCounts } from "@/lib/admin/cost";
import { limitsInForce, paused } from "@/lib/admin/limits-in-force";
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

/** The account's limits in force, each with its spend: the first build allowance while it runs, else the month (and the day when set). */
function limitsCell(a: AccountUsage) {
  const label = limitsInForce(a.spend)
    .map((l) => `${l.label}: ${dollars(l.spentMicros)} of ${dollars(l.limitMicros)}`)
    .join(", ");
  return paused(a.spend) ? <strong key="limits">{label}, paused</strong> : label;
}

/** The range's heaviest accounts, sorted by cost, tokens or requests. */
export function AccountTable({ title, accounts }: { title: string; accounts: AccountUsage[] }) {
  const [sort, setSort] = useState<AccountSort>("cost");
  const shown = sortAccounts(accounts, sort);
  return (
    <Section title={title} control={<Segmented value={sort} onChange={(v) => setSort(v as AccountSort)} options={ACCOUNT_SORTS.map((s) => ({ ...s }))} />}>
      <div className="overflow-x-auto whitespace-nowrap">
        <Table
          head={["Account", "Requests", "Tokens", "Cost", "Limits"]}
          empty="No account used AI in this range."
          rows={shown.map((a) => [
            <Link key="a" href={`/admin/users/${a.id}`} className="underline-offset-2 hover:underline">
              {a.email ?? "No email"}
            </Link>,
            whole(a.requests),
            compact(a.tokens),
            dollars(a.costMicros),
            limitsCell(a),
          ])}
        />
      </div>
      <p className="mt-2 text-[12px] text-[color:var(--color-muted)]">
        Tokens are input plus output. Before an account&apos;s first memory build finishes, its first build allowance applies in place of the monthly limit; after it, the month
        (UTC) counts only spend after the build. Today shows only for an account with a daily limit.
      </p>
    </Section>
  );
}
