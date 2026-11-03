"use client";

import { acceptInvite, declineInvite } from "@/app/(site)/dashboard/organization/member-actions";
import { day } from "@/lib/dashboard/format";
import type { MyInvite } from "@/lib/org/my-invites";
import { Panel } from "@/site/dashboard/panel";
import { buttonClass } from "@/site/ui/button";

import { lineClass, useOrgAction } from "./use-org-action";

/** The person's pending invites, each with Accept and Decline. */
export function MyInvites({ invites }: { invites: MyInvite[] }) {
  const { pending, line, run } = useOrgAction();
  return (
    <Panel title="Invites" description="Joining shares your memory's shared sections with the organization. You can turn sharing off at any time.">
      <ul className="divide-y divide-neutral-100">
        {invites.map((i) => (
          <li key={i.id} className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-[15px] font-medium text-neutral-950">{i.orgName}</p>
              <p className="mt-0.5 text-[13px] text-neutral-500">
                {[`As ${i.role === "admin" ? "an admin" : "a member"}`, i.invitedBy ? `invited by ${i.invitedBy}` : null, `open until ${day(i.expiresAt)}`].filter(Boolean).join(", ")}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" disabled={pending} onClick={() => run(() => acceptInvite(i.id))} className={buttonClass("primary", "disabled:opacity-60")}>
                Accept
              </button>
              <button type="button" disabled={pending} onClick={() => run(() => declineInvite(i.id))} className={buttonClass("secondary", "disabled:opacity-60")}>
                Decline
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p role="status" aria-live="polite" className={lineClass(line?.error)}>
        {line?.text ?? ""}
      </p>
    </Panel>
  );
}
