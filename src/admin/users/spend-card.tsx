"use client";

import { resetFirstBuild } from "@/app/admin/users/actions";
import { limitsInForce } from "@/lib/admin/limits-in-force";
import type { UserDetailPayload } from "@/lib/admin/types";
import { day, dollars } from "@/lib/dashboard/format";

import { Button, Card } from "../controls";

/**
 * The account's spend limits as the gate reads them: whether its free first
 * build is used, each limit in force with what it has spent against it, and
 * a way to give the first build back. The person never sees a limit; their
 * dashboard says only that their AI use is paused, while it is.
 */
export function SpendCard({ data, pending, run }: { data: UserDetailPayload; pending: boolean; run: (act: () => ReturnType<typeof resetFirstBuild>) => void }) {
  const { user, spend } = data;
  const lines = limitsInForce(spend);
  const daily = spend.dailyLimitMicros === null ? "Daily limit: off." : "";

  return (
    <Card title="AI limits">
      <p className="text-[12.5px] text-[color:var(--color-ink)]">
        {spend.firstBuildDone
          ? `Free first build used${user.firstBuildAt ? ` (finished ${day(user.firstBuildAt)})` : ""}. The month counts only spend after it. ${daily}`
          : "Free first build not finished yet. Until it is, the first build allowance applies in place of the monthly and daily limits."}
      </p>
      <ul className="mt-2 space-y-1 text-[12.5px] text-[color:var(--color-ink)]">
        {lines.map((l) => (
          <li key={l.label}>
            {l.label}: {dollars(l.spentMicros)} of {dollars(l.limitMicros)}
            {l.reached ? <strong>, paused</strong> : null}
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <Button
          type="button"
          disabled={pending}
          onClick={() => {
            if (window.confirm("Give this account its free first build again? The first build allowance applies again, and the monthly limit waits until its next memory build finishes.")) run(() => resetFirstBuild(user.id));
          }}
        >
          Reset the free first build
        </Button>
      </div>
    </Card>
  );
}
