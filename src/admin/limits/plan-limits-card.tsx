"use client";

import { useState } from "react";

import { savePlanLimits } from "@/app/admin/limits/actions";
import { fieldName, LIMIT_KINDS, type LimitKind } from "@/lib/admin/limit-input";
import { dollarField } from "@/lib/admin/money";
import type { PlanRow } from "@/lib/admin/types";

import { Button, Card, fieldClass, fieldStyle, Label, Status } from "../controls";
import { useAction } from "../use-action";

const FIELD_LABELS: Record<LimitKind, string> = { daily: "Daily, $", first_build: "First build, $", monthly: "Monthly, $", lifetime: "Lifetime, $" };

const saved = (plan: PlanRow): Record<LimitKind, number | null> => ({
  daily: plan.dailyLimitMicros,
  first_build: plan.firstBuildLimitMicros,
  monthly: plan.monthlyLimitMicros,
  lifetime: plan.lifetimeLimitMicros,
});

/**
 * One plan's four limits in dollars and cents. The daily limit may be blank,
 * meaning off, and the lifetime limit blank, meaning none; the first build
 * and monthly limits must be amounts. The card says whether what
 * is typed is saved, and the form starts again from the saved values after
 * each save, so what it shows is what applies.
 */
export function PlanLimitsCard({ plan, reload }: { plan: PlanRow; reload: () => void }) {
  const { run, pending, message } = useAction(reload);
  const [dirty, setDirty] = useState(false);
  const values = saved(plan);
  const key = LIMIT_KINDS.map((k) => values[k]).join(":");

  const save = (fd: FormData) =>
    run(async () => {
      const result = await savePlanLimits(plan.id, fd);
      if (result.ok) setDirty(false);
      return result;
    });

  return (
    <Card title={`${plan.name} plan`}>
      <form key={key} action={save} onChange={() => setDirty(true)} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {LIMIT_KINDS.map((kind) => (
            <div key={kind}>
              <Label htmlFor={`${plan.id}-${kind}`}>{FIELD_LABELS[kind]}</Label>
              <input
                id={`${plan.id}-${kind}`}
                name={fieldName(kind)}
                inputMode="decimal"
                required={kind === "first_build" || kind === "monthly"}
                defaultValue={dollarField(values[kind])}
                placeholder={kind === "lifetime" ? "None" : kind === "daily" ? "Off" : undefined}
                className={fieldClass}
                style={fieldStyle}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button strong disabled={pending || !dirty}>
            Save
          </Button>
          <span className="text-[12px] text-[color:var(--color-muted)]">{pending ? "Saving" : dirty ? "Not saved yet" : "Saved"}</span>
        </div>
      </form>
      <Status text={message} />
    </Card>
  );
}
