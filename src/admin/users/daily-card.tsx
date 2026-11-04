"use client";

import { resetFirstBuild } from "@/app/admin/users/actions";
import type { UserDetailPayload } from "@/lib/admin/types";
import { day, dollars } from "@/lib/dashboard/format";

import { Button, Card } from "../controls";

/**
 * The account's hidden daily limit: whether its free first build is used,
 * what it has spent against the limit in force, and a way to give the first
 * build back. The person never sees any of this; when the limit is reached,
 * the extension shows its usual limit message and tries again each hour.
 */
export function DailyCard({ data, pending, run }: { data: UserDetailPayload; pending: boolean; run: (act: () => ReturnType<typeof resetFirstBuild>) => void }) {
  const { user, day: today } = data;
  const reached = today.spentMicros >= today.limitMicros;
  const spent = `${dollars(today.spentMicros)} of ${dollars(today.limitMicros)}`;

  return (
    <Card title="Daily AI limit">
      <p className="text-[12.5px] text-[color:var(--color-ink)]">
        {today.firstBuildDone
          ? `Free first build used${user.firstBuildAt ? ` (finished ${day(user.firstBuildAt)})` : ""}. Today, UTC: ${spent}${reached ? ", paused until midnight UTC" : ""}.`
          : `Free first build not finished yet. The daily limit waits for it; until then the first build may spend ${spent}${reached ? ", and it is paused" : ""}.`}
      </p>
      <div className="mt-3">
        <Button
          type="button"
          disabled={pending}
          onClick={() => {
            if (window.confirm("Give this account its free first build again? The daily limit waits until its next memory build finishes.")) run(() => resetFirstBuild(user.id));
          }}
        >
          Reset the free first build
        </Button>
      </div>
    </Card>
  );
}
