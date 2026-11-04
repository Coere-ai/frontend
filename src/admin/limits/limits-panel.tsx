"use client";

import { clearOverrides, setDailyForAllPlans } from "@/app/admin/limits/actions";
import { LIMIT_KINDS, type LimitKind } from "@/lib/admin/limit-input";
import { dollarField } from "@/lib/admin/money";
import type { LimitsPayload } from "@/lib/admin/types";
import { whole } from "@/lib/dashboard/format";
import { Table } from "@/stats/panel/ui";

import { AdminPanel } from "../admin-panel";
import { Button, Card, fieldClass, fieldStyle, Label, Status } from "../controls";
import { useAction } from "../use-action";
import { useAdminData } from "../use-admin-data";

import { PlanLimitsCard } from "./plan-limits-card";

export const LIMIT_NAMES: Record<LimitKind, string> = {
  daily: "Daily limit",
  first_build: "First build allowance",
  monthly: "Monthly limit",
  lifetime: "Lifetime limit",
};

/**
 * The global spend limits. Every account follows its plan's limits unless
 * the operator gave it its own on its page under Users, which then wins.
 * The daily limit applies once an account's free first memory build has
 * finished; until then the first build allowance does. Neither is ever
 * shown to the person.
 */
export function LimitsPanel() {
  const { data, error, reload } = useAdminData<LimitsPayload>("/api/admin/limits");
  return (
    <AdminPanel title="Limits" ready={!!data} error={error} reload={reload}>
      {data ? (
        <>
          <p className="max-w-[720px] text-[12.5px] text-[color:var(--color-ink)]">
            These limits apply to every account on a plan. An account&apos;s own value, set on its page under Users, overrides its plan&apos;s. The daily limit starts once an
            account&apos;s free first memory build has finished, counted per UTC day; until then the first build allowance applies instead. The monthly and lifetime limits always
            apply. People never see the daily limit or the allowance: when one is reached, the extension shows its usual limit message and tries again each hour.
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <EveryPlanCard data={data} reload={reload} />
            <OverridesCard data={data} reload={reload} />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {data.plans.map((plan) => (
              <PlanLimitsCard key={plan.id} plan={plan} reload={reload} />
            ))}
          </div>
        </>
      ) : null}
    </AdminPanel>
  );
}

/** One daily limit for every plan at once, the global default. */
function EveryPlanCard({ data, reload }: { data: LimitsPayload; reload: () => void }) {
  const { run, pending, message } = useAction(reload);
  const values = [...new Set(data.plans.map((p) => p.dailyLimitMicros))];
  const shared = values.length === 1 ? (values[0] ?? null) : null;
  return (
    <Card title="Daily limit for everyone">
      <form key={String(shared)} action={(fd) => run(() => setDailyForAllPlans(fd))} className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="daily-all">Every plan, $ a day</Label>
          <input id="daily-all" name="daily" inputMode="decimal" required defaultValue={dollarField(shared)} placeholder="Plans differ" className={fieldClass} style={fieldStyle} />
        </div>
        <Button strong disabled={pending}>
          Set on every plan
        </Button>
      </form>
      <p className="mt-2 text-[12px] text-[color:var(--color-ink)]">
        {whole(data.firstBuildsUsed)} of {whole(data.accounts)} accounts have finished their free first build, so the daily limit applies to them. {whole(data.overrides.daily)}{" "}
        {data.overrides.daily === 1 ? "account has" : "accounts have"} a daily limit of its own, which this does not change.
      </p>
      <Status text={message} />
    </Card>
  );
}

/** How many accounts override each limit, and a way to clear them all. */
function OverridesCard({ data, reload }: { data: LimitsPayload; reload: () => void }) {
  const { run, pending, message } = useAction(reload);
  const clear = (kind: LimitKind) => {
    const n = data.overrides[kind];
    const what = LIMIT_NAMES[kind].toLowerCase();
    if (window.confirm(`Clear the ${what} on ${n} ${n === 1 ? "account" : "accounts"}? Each then follows its plan's ${what}.`)) run(() => clearOverrides(kind, true));
  };
  return (
    <Card title="Accounts with their own limits">
      <Table
        head={["Limit", "Accounts", ""]}
        empty="No limits."
        rows={LIMIT_KINDS.map((kind) => [
          LIMIT_NAMES[kind],
          whole(data.overrides[kind]),
          <Button key="clear" type="button" disabled={pending || data.overrides[kind] === 0} onClick={() => clear(kind)}>
            Clear all
          </Button>,
        ])}
      />
      <Status text={message} />
    </Card>
  );
}
