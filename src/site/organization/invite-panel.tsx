"use client";

import { useActionState } from "react";

import { inviteMember, revokeInvite, type InviteState } from "@/app/(site)/dashboard/organization/admin-actions";
import { day } from "@/lib/dashboard/format";
import type { OrgInvite } from "@/lib/org/page-data";
import { FormStatus } from "@/site/account/auth-shell";
import { Panel } from "@/site/dashboard/panel";
import { buttonClass } from "@/site/ui/button";
import { FormField, inputClass } from "@/site/ui/form-field";

import { lineClass, useOrgAction } from "./use-org-action";

const START: InviteState = { error: null, notice: null, signUp: false };

/**
 * Inviting a coworker by the email or username of their Coere account, and
 * the invites still waiting, each with Revoke. A coworker with no account
 * gets the sign up link to make one; nothing is sent for them.
 */
export function InvitePanel({ invites, signUpUrl }: { invites: OrgInvite[]; signUpUrl: string }) {
  const [state, action, sending] = useActionState(inviteMember, START);
  const { pending, line, run } = useOrgAction();

  return (
    <Panel title="Invite a coworker" description="They need a Coere account. They see the invite on their dashboard and accept it there.">
      <form action={action} noValidate className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-end">
        <FormField id="invite-login" label="Email or username">
          <input
            id="invite-login"
            name="login"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={Boolean(state.error)}
            className={`${inputClass(Boolean(state.error))} h-12`}
          />
        </FormField>
        <FormField id="invite-role" label="Role">
          <select id="invite-role" name="role" defaultValue="member" className={`${inputClass(false)} h-12 pr-10`}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </FormField>
        <button type="submit" disabled={sending} className={buttonClass("primary", "h-12 disabled:opacity-60")}>
          {sending ? "Inviting" : "Invite"}
        </button>
      </form>
      <div className="mt-3">
        <FormStatus error={state.error} notice={state.notice} />
      </div>
      {state.signUp ? (
        <div className="mt-2 rounded-2xl bg-neutral-50 p-5">
          <p className="text-[13px] text-neutral-500">Send your coworker this link to make an account, then invite them again:</p>
          <p className="mt-1 text-[15px] break-all text-neutral-950 select-all">{signUpUrl}</p>
        </div>
      ) : null}

      {invites.length > 0 ? (
        <div className="mt-8">
          <h3 className="border-b border-neutral-200 pb-3 text-[15px] font-medium text-neutral-950">Waiting</h3>
          <ul className="divide-y divide-neutral-100">
            {invites.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-[15px] text-neutral-950">{i.name}</p>
                  <p className="mt-0.5 text-[13px] text-neutral-500">{`${i.role === "admin" ? "Admin" : "Member"}, sent ${day(i.createdAt)}, open until ${day(i.expiresAt)}`}</p>
                </div>
                <button type="button" disabled={pending} onClick={() => run(() => revokeInvite(i.id))} className="shrink-0 rounded-full px-4 py-2 text-[14px] text-neutral-950 transition-colors hover:bg-neutral-100 disabled:opacity-60">
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p role="status" aria-live="polite" className={lineClass(line?.error)}>
        {line?.text ?? ""}
      </p>
    </Panel>
  );
}
