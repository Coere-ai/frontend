"use client";

import { useActionState } from "react";

import { inviteToOrg, makeAdmin, type FormState } from "@/app/(site)/account/actions";
import { FormStatus } from "@/site/account/auth-shell";
import { buttonClass } from "@/site/ui/button";

import { Part, Row, rowButtonClass } from "./rows";

const initial: FormState = { error: null, notice: null };

const inputClass =
  "h-11 min-w-0 flex-1 rounded-full border border-neutral-200 bg-white px-4 text-[15px] text-neutral-950 placeholder:text-neutral-400 focus-visible:border-neutral-950 focus-visible:outline-none";

/**
 * For an organization's admins: invite a coworker and make a member an
 * admin. Everything else about the organization stays in Coere; these two
 * let a person in or hand over power, so they need a web session.
 */
export function Organization({ name, members }: { name: string; members: Array<{ userId: string; name: string; role: string }> }) {
  const [invite, inviteAction, inviting] = useActionState(inviteToOrg, initial);
  const [role, roleAction, promoting] = useActionState(makeAdmin, initial);
  const plain = members.filter((m) => m.role !== "admin");
  return (
    <Part title={`Organization: ${name}`} line="Invite a coworker by the username of their Coere account, and make a member an admin. The rest is in Coere.">
      <form action={inviteAction} className="flex flex-wrap gap-3">
        <input name="login" required maxLength={64} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="Username" aria-label="Username" className={inputClass} />
        <select name="role" aria-label="Role" defaultValue="member" className="h-11 rounded-full border border-neutral-200 bg-white px-4 text-[15px] text-neutral-950">
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" disabled={inviting} className={buttonClass("primary", "disabled:opacity-60")}>
          Invite
        </button>
      </form>
      <div className="mt-3">
        <FormStatus error={invite.error} notice={invite.notice} />
      </div>
      {plain.length > 0 ? (
        <form action={roleAction} className="mt-6">
          <ul className="divide-y divide-neutral-100">
            {plain.map((m) => (
              <Row key={m.userId} name={m.name} detail="Member">
                <button type="submit" name="userId" value={m.userId} disabled={promoting} className={rowButtonClass}>
                  Make admin
                </button>
              </Row>
            ))}
          </ul>
          <FormStatus error={role.error} notice={role.notice} />
        </form>
      ) : null}
    </Part>
  );
}
