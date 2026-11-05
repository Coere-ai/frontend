"use client";

import Link from "next/link";
import { Fragment, useState } from "react";

import { removeMember, setMemberAccess, setMemberRole } from "@/app/admin/organizations/member-actions";
import type { AdminResult } from "@/lib/admin/action";
import type { OrgDetailPayload, OrgMemberRow } from "@/lib/admin/types";
import { compact, day, dollars } from "@/lib/dashboard/format";
import type { OrgAccess } from "@/lib/org/access";

import { Button, fieldClass, fieldStyle } from "../controls";

import { MemberAccessEditor } from "./access-editor";

type Run = (act: () => Promise<AdminResult>) => void;

/** What one access object allows, in a few words. */
function accessWords(a: OrgAccess, role: string): string {
  const reads = role === "admin" || a.read === "all" ? "reads all" : a.read.length ? `reads ${a.read.join(", ")}` : "reads nothing";
  return `${reads}, ${a.contribute ? "adds" : "does not add"}`;
}

/**
 * The members with their roles, access and totals. The operator may make
 * the last admin a member or remove them, which no admin may; the page
 * asks first, since the organization is then left with nobody to run it.
 */
export function MemberTable({ data, run, pending }: { data: OrgDetailPayload; run: Run; pending: boolean }) {
  const [editing, setEditing] = useState<string | null>(null);
  const admins = data.members.filter((m) => m.role === "admin").length;
  const orgId = data.org.id;
  const shared = data.sections.filter((s) => data.org.sharedSections.includes(s.key));
  const lastAdmin = (m: OrgMemberRow) => m.role === "admin" && admins <= 1;

  const changeRole = (m: OrgMemberRow, to: string) => {
    if (to === "member" && lastAdmin(m) && !window.confirm("This is the organization's only admin. Make them a member anyway?")) return;
    run(() => setMemberRole(orgId, m.userId, to));
  };
  const remove = (m: OrgMemberRow) => {
    const words = lastAdmin(m) ? `${m.name} is the only admin. Remove them anyway?` : `Remove ${m.name} from the organization?`;
    if (window.confirm(words)) run(() => removeMember(orgId, m.userId));
  };

  if (data.members.length === 0) return <p className="text-[12.5px] text-[color:var(--color-ink)]">Nobody is in this organization.</p>;
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--color-border)" }}>
      <table className="w-full text-[12.5px] whitespace-nowrap">
        <thead>
          <tr style={{ background: "var(--color-canvas-soft)" }}>
            {["Member", "Role", "Access", "Sharing", "Joined", "Tokens saved", "Memories", "Cost", ""].map((h, i) => (
              <th key={i} className={`px-3 py-2 text-[11px] font-semibold tracking-[0.07em] uppercase ${i < 4 ? "text-left" : "text-right"}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.members.map((m) => (
            <Fragment key={m.userId}>
              <tr className="border-t" style={{ borderColor: "var(--color-rule-subtle)" }}>
                <td className="px-3 py-2">
                  <Link href={`/admin/users/${m.userId}`} className="underline-offset-2 hover:underline">
                    {m.name}
                  </Link>
                  {m.email && m.email !== m.name ? <span className="block text-[color:var(--color-muted)]">{m.email}</span> : null}
                </td>
                <td className="px-3 py-2">
                  <select aria-label={`Role of ${m.name}`} value={m.role} disabled={pending} onChange={(e) => changeRole(m, e.target.value)} className={`${fieldClass} min-w-[6.5rem] py-1`} style={fieldStyle}>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  {accessWords(m.effective, m.role)}
                  {m.access ? "" : " (default)"}
                </td>
                <td className="px-3 py-2">{m.shareMemory ? "On" : "Off"}</td>
                <td className="px-3 py-2 text-right">{day(m.joinedAt)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{compact(m.tokensSaved)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{compact(m.memories)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{dollars(m.costMicros)}</td>
                <td className="space-x-1.5 px-3 py-2 text-right">
                  <Button type="button" disabled={pending} onClick={() => setEditing(editing === m.userId ? null : m.userId)}>
                    {editing === m.userId ? "Close" : "Access"}
                  </Button>
                  <Button type="button" disabled={pending} onClick={() => remove(m)}>
                    Remove
                  </Button>
                </td>
              </tr>
              {editing === m.userId ? (
                <tr style={{ background: "var(--color-canvas-soft)" }}>
                  <td colSpan={9} className="px-3 py-3 whitespace-normal">
                    <MemberAccessEditor
                      value={m.effective}
                      sections={shared}
                      disabled={pending}
                      onSave={(access) => run(() => setMemberAccess(orgId, m.userId, access))}
                      onReset={() => run(() => setMemberAccess(orgId, m.userId, null))}
                    />
                  </td>
                </tr>
              ) : null}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
