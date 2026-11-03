"use client";

import { useState } from "react";

import { changeRole, removeMember, setMemberAccess } from "@/app/(site)/dashboard/organization/admin-actions";
import { compact, day, whole } from "@/lib/dashboard/format";
import type { OrgAccess } from "@/lib/org/access";
import type { OrgMember } from "@/lib/org/page-data";
import { Panel } from "@/site/dashboard/panel";

import { AccessEditor } from "./access-editor";
import { lineClass, useOrgAction } from "./use-org-action";

/** Access in a few words, as the member list shows it. */
function accessWords(a: OrgAccess, role: string, names: Map<string, string>): string {
  const reads = role === "admin" || a.read === "all" ? "Reads everything" : a.read.length === 0 ? "Reads nothing" : `Reads ${a.read.map((k) => names.get(k) ?? k).join(", ")}`;
  return `${reads}${a.contribute ? "" : ", does not add to the graph"}`;
}

const quiet = "rounded-full px-3 py-1.5 text-[13px] text-neutral-950 transition-colors hover:bg-neutral-100 disabled:opacity-60";

/**
 * The organization's members with their role, when they joined, the tokens
 * they saved and the memories they share. An admin also changes roles and
 * access, and removes members.
 */
export function MemberList({ members, me, admin, sections }: { members: OrgMember[]; me: string; admin: boolean; sections: Array<{ key: string; name: string }> }) {
  const { pending, line, run } = useOrgAction();
  const [open, setOpen] = useState<string | null>(null);
  const names = new Map(sections.map((s) => [s.key, s.name]));

  return (
    <Panel title="Members" description={`${whole(members.length)} ${members.length === 1 ? "person" : "people"}. Admins run the organization; members add to the graph and read it.`}>
      <ul className="divide-y divide-neutral-100">
        {members.map((m) => (
          <li key={m.userId} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-[15px] text-neutral-950">
                  <span className="truncate font-medium">{m.name}</span>
                  {m.userId === me ? <span className="text-[13px] text-neutral-500">You</span> : null}
                  <span className={`rounded-full px-2.5 py-0.5 text-[12px] ${m.role === "admin" ? "bg-brand-50 text-brand-600" : "bg-neutral-100 text-neutral-600"}`}>{m.role === "admin" ? "Admin" : "Member"}</span>
                </p>
                <p className="mt-1 text-[13px] text-neutral-500">
                  {[m.email, `Joined ${day(m.joinedAt)}`, `${compact(m.tokensSaved)} tokens saved`, `${whole(m.memoriesShared)} memories shared`, m.shareMemory ? null : "Sharing off"].filter(Boolean).join(". ")}
                </p>
                {admin ? <p className="mt-0.5 text-[13px] text-neutral-500">{accessWords(m.effective, m.role, names)}</p> : null}
              </div>
              {admin ? (
                <div className="flex flex-wrap gap-1">
                  <button type="button" disabled={pending} className={quiet} onClick={() => run(() => changeRole(m.userId, m.role === "admin" ? "member" : "admin"))}>
                    {m.role === "admin" ? "Make member" : "Make admin"}
                  </button>
                  <button type="button" disabled={pending} aria-expanded={open === m.userId} className={quiet} onClick={() => setOpen(open === m.userId ? null : m.userId)}>
                    Access
                  </button>
                  {m.userId !== me ? (
                    <button type="button" disabled={pending} className={quiet} onClick={() => run(() => removeMember(m.userId), `Remove ${m.name}? Their memory leaves the shared graph.`)}>
                      Remove
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            {admin && open === m.userId ? (
              <div className="mt-4 rounded-2xl bg-neutral-50 p-5">
                <AccessEditor
                  value={m.effective}
                  sections={sections}
                  disabled={pending}
                  onSave={(access) => run(() => setMemberAccess(m.userId, access))}
                  onReset={m.access ? () => run(() => setMemberAccess(m.userId, null)) : undefined}
                />
                {m.role === "admin" ? <p className="mt-4 text-[13px] text-neutral-500">Admins always read every shared section.</p> : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <p role="status" aria-live="polite" className={lineClass(line?.error)}>
        {line?.text ?? ""}
      </p>
    </Panel>
  );
}
