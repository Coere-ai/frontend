"use client";

import { revokeAllDevices, setLimits, setPassword, setPlan, setStatus } from "@/app/admin/users/actions";
import { PASSWORD_MAX, PASSWORD_MIN } from "@/lib/auth/identity";
import { dollarField } from "@/lib/admin/money";
import { fieldName, LIMIT_KINDS, type LimitKind } from "@/lib/admin/limit-input";
import type { PlanRow, UserDetailPayload } from "@/lib/admin/types";
import { dollars } from "@/lib/dashboard/format";

import { Button, Card, fieldClass, fieldStyle, Label, Status } from "../controls";
import { useAction } from "../use-action";

import { SpendCard } from "./spend-card";

const LABELS: Record<LimitKind, string> = { daily: "Daily, $", first_build: "First build, $", monthly: "Monthly, $", lifetime: "Lifetime, $" };

/** The account's own value for a limit, and the plan's, which applies while the account's is blank. */
function limitsOf(user: UserDetailPayload["user"], plan: PlanRow | undefined): Record<LimitKind, { own: number | null; plan: number | null | undefined }> {
  return {
    daily: { own: user.dailyLimitMicros, plan: plan?.dailyLimitMicros },
    first_build: { own: user.firstBuildLimitMicros, plan: plan?.firstBuildLimitMicros },
    monthly: { own: user.monthlyLimitMicros, plan: plan?.monthlyLimitMicros },
    lifetime: { own: user.lifetimeLimitMicros, plan: plan?.lifetimeLimitMicros },
  };
}

/** What a blank field means: the plan's value, "off" for a daily limit the plan does not set, "none" for a lifetime limit. */
function planPlaceholder(kind: LimitKind, fromPlan: number | null | undefined): string {
  if (fromPlan === undefined) return "Plan's";
  if (fromPlan === null) return kind === "daily" ? "Off (plan)" : "None (plan)";
  return `${dollarField(fromPlan)} (plan)`;
}

/**
 * What the operator changes on one account. The limits show the plan's
 * own as placeholders, so a blank field says what applies, and the
 * spend sits beside them. The person never sees any of the limits; only
 * the admin panel shows them.
 */
export function AccountActions({ data, reload }: { data: UserDetailPayload; reload: () => void }) {
  const { user, plans } = data;
  const { run, pending, message } = useAction(reload);
  const plan = plans.find((p) => p.id === user.plan);
  const limits = limitsOf(user, plan);
  const suspended = user.status === "suspended";

  return (
    // Plan and Access stack in one column beside Dollar limits, each card as tall as its own content.
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <div className="grid gap-4">
        <Card title="Plan">
          <form action={(fd) => run(() => setPlan(user.id, fd))} className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="plan">Plan</Label>
              <select id="plan" name="plan" defaultValue={user.plan} className={fieldClass} style={fieldStyle}>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({dollars(p.monthlyLimitMicros)} a month)
                  </option>
                ))}
              </select>
            </div>
            <Button strong disabled={pending}>
              Save
            </Button>
          </form>
        </Card>
        <Card title="Access">
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={pending} onClick={() => run(() => setStatus(user.id, suspended ? "active" : "suspended"))}>
              {suspended ? "Restore the account" : "Suspend the account"}
            </Button>
            <Button
              type="button"
              disabled={pending || user.devices === 0}
              onClick={() => {
                if (window.confirm("Revoke every device on this account? Each one has to connect again.")) run(() => revokeAllDevices(user.id));
              }}
            >
              Revoke every device
            </Button>
          </div>
          <p className="mt-3 text-[12px] text-[color:var(--color-ink)]">
            {suspended ? "Suspended: every request from this account is refused." : `Active, with ${user.devices} live ${user.devices === 1 ? "device" : "devices"}.`}
          </p>
        </Card>
        <Card title="Set a new password">
          <form
            action={(fd) => {
              if (window.confirm(`Set a new password for ${user.username ?? "this account"}? Their old one stops working.`)) run(() => setPassword(user.id, fd));
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1">
              <Label htmlFor="new-password">New password</Label>
              <input id="new-password" name="password" type="text" autoComplete="off" spellCheck={false} minLength={PASSWORD_MIN} maxLength={PASSWORD_MAX} placeholder={`At least ${PASSWORD_MIN} characters`} className={fieldClass} style={fieldStyle} />
            </div>
            <Button strong disabled={pending}>
              Set password
            </Button>
          </form>
          <p className="mt-3 text-[12px] text-[color:var(--color-ink)]">
            For a person who forgot theirs and wrote to the contact email. Nothing is emailed: tell them the password yourself, then they change it on their account page.
          </p>
        </Card>
      </div>

      <Card title="Dollar limits">
        <form action={(fd) => run(() => setLimits(user.id, fd))} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {LIMIT_KINDS.map((kind) => {
              const { own, plan: fromPlan } = limits[kind];
              return (
                <div key={kind}>
                  <Label htmlFor={`limit-${kind}`}>{LABELS[kind]}</Label>
                  <input
                    id={`limit-${kind}`}
                    name={fieldName(kind)}
                    inputMode="decimal"
                    defaultValue={dollarField(own)}
                    placeholder={planPlaceholder(kind, fromPlan)}
                    className={fieldClass}
                    style={fieldStyle}
                  />
                </div>
              );
            })}
          </div>
          <p className="text-[12px] text-[color:var(--color-ink)]">
            Spent {dollars(user.monthCostMicros)} this month and {dollars(user.lifetimeCostMicros)} in all. Leave a field blank for the plan&apos;s limit; a value here overrides
            the plan&apos;s. Until the free first build finishes, the first build allowance applies in place of the monthly and daily limits; after it, the month counts only
            spend after the build. A daily limit is off unless set here or on the plan. The person never sees any of them.
          </p>
          <Button strong disabled={pending}>
            Save limits
          </Button>
        </form>
      </Card>

      <SpendCard data={data} pending={pending} run={run} />
      <div className="lg:col-span-2">
        <Status text={message} />
      </div>
    </div>
  );
}
