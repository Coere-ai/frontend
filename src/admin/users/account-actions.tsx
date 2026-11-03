"use client";

import { revokeAllDevices, setLimits, setPlan, setStatus } from "@/app/admin/users/actions";
import { dollarField } from "@/lib/admin/money";
import type { PlanRow, UserDetailPayload } from "@/lib/admin/types";
import { dollars } from "@/lib/dashboard/format";

import { Button, Card, fieldClass, fieldStyle, Label, Status } from "../controls";
import { useAction } from "../use-action";

/**
 * What the operator changes on one account. The limits show the plan's
 * own as placeholders, so a blank field says what applies, and the
 * lifetime spend sits beside them, since that is what the lifetime limit
 * is checked against.
 */
export function AccountActions({ user, plans, reload }: { user: UserDetailPayload["user"]; plans: PlanRow[]; reload: () => void }) {
  const { run, pending, message } = useAction(reload);
  const plan = plans.find((p) => p.id === user.plan);
  const suspended = user.status === "suspended";

  return (
    <div className="grid gap-4 lg:grid-cols-3">
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

      <Card title="Dollar limits">
        <form action={(fd) => run(() => setLimits(user.id, fd))} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="monthly">Monthly, $</Label>
              <input
                id="monthly"
                name="monthly"
                inputMode="decimal"
                defaultValue={dollarField(user.monthlyLimitMicros)}
                placeholder={plan ? `${dollarField(plan.monthlyLimitMicros)} (plan)` : "Plan's"}
                className={fieldClass}
                style={fieldStyle}
              />
            </div>
            <div>
              <Label htmlFor="lifetime">Lifetime, $</Label>
              <input
                id="lifetime"
                name="lifetime"
                inputMode="decimal"
                defaultValue={dollarField(user.lifetimeLimitMicros)}
                placeholder={plan?.lifetimeLimitMicros != null ? `${dollarField(plan.lifetimeLimitMicros)} (plan)` : "None (plan)"}
                className={fieldClass}
                style={fieldStyle}
              />
            </div>
          </div>
          <p className="text-[12px] text-[color:var(--color-ink)]">
            Spent {dollars(user.monthCostMicros)} this month and {dollars(user.lifetimeCostMicros)} in all. Leave a field blank for the plan&apos;s limit.
          </p>
          <Button strong disabled={pending}>
            Save limits
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
      <div className="lg:col-span-3">
        <Status text={message} />
      </div>
    </div>
  );
}
