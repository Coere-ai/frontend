"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { deleteOrganization } from "@/app/admin/organizations/actions";
import { addMember, revokeInvite } from "@/app/admin/organizations/member-actions";
import type { OrgDetailPayload } from "@/lib/admin/types";
import { compact, day, dollars, whole } from "@/lib/dashboard/format";
import { Kpi, Section, Table } from "@/stats/panel/ui";

import { AdminPanel } from "../admin-panel";
import { Button, Card, fieldClass, fieldStyle, Label, Status } from "../controls";
import { MemoryGraph } from "../memory-graph";
import { useAction } from "../use-action";
import { useAdminData } from "../use-admin-data";

import { MemberTable } from "./member-table";
import { OrgSettings } from "./org-settings";

/**
 * One organization: its totals, members, settings, open invites and graph,
 * and everything the operator changes on it. Every action reloads the
 * page's data, so the tables follow.
 */
export function OrgPanel({ id }: { id: string }) {
  const router = useRouter();
  const { data, error, reload } = useAdminData<OrgDetailPayload>(`/api/admin/organizations/${id}`);
  const { run, pending, message } = useAction(reload);

  const remove = () => {
    if (!data || !window.confirm(`Delete ${data.org.name}? Its shared graph goes too. Members keep their own accounts and memory.`)) return;
    run(async () => {
      const r = await deleteOrganization(id);
      if (r.ok) router.push("/admin/organizations");
      return r;
    });
  };

  return (
    <AdminPanel title={data?.org.name ?? "Organization"} ready={!!data} error={error} reload={reload} control={<BackLink />}>
      {data ? (
        <>
          <p className="text-[12.5px] text-[color:var(--color-ink)]">
            {data.org.slug}, {data.org.plan} plan, made {day(data.org.createdAt)}.
          </p>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Kpi label="Members" value={whole(data.totals.members || data.members.length)} />
            <Kpi label="Tokens saved" value={compact(data.totals.tokensSaved)} />
            <Kpi label="Memories" value={compact(data.totals.memories)} />
            <Kpi label="Chats" value={compact(data.totals.chats)} />
            <Kpi label="AI cost" value={dollars(data.totals.costMicros)} />
          </section>
          <Status text={message} />
          <Section title="Members">
            <MemberTable data={data} run={run} pending={pending} />
          </Section>
          <Card title="Add a member or admin">
            <form action={(fd) => run(() => addMember(id, fd))} className="grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
              <div>
                <Label htmlFor="add-login">Account</Label>
                <input id="add-login" name="login" required placeholder="Email or username of an account" autoComplete="off" className={fieldClass} style={fieldStyle} />
              </div>
              <div>
                <Label htmlFor="add-role">Role</Label>
                <select id="add-role" name="role" defaultValue="member" className={fieldClass} style={fieldStyle}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button strong disabled={pending}>
                Add
              </Button>
            </form>
          </Card>
          <OrgSettings key={`${data.org.name}${data.org.plan}${data.org.sharedSections.join()}`} data={data} run={run} pending={pending} />
          <Section title="Open invites">
            <Table
              head={["Invited", "Role", "Sent", "Expires", ""]}
              empty="No invite is waiting."
              rows={data.invites.map((i) => [
                i.name,
                i.role,
                day(i.createdAt),
                day(i.expiresAt),
                <Button key="revoke" type="button" disabled={pending} onClick={() => run(() => revokeInvite(id, i.id))}>
                  Revoke
                </Button>,
              ])}
            />
          </Section>
          <Card title="Shared knowledge graph">
            <MemoryGraph url={`/api/admin/organizations/${id}/memory`} what="this organization's" />
          </Card>
          <Card title="Delete the organization">
            <p className="mb-3 text-[12.5px] text-[color:var(--color-ink)]">
              Deleting removes its shared graph, members list and invites. Every member keeps their own account and memory.
            </p>
            <Button type="button" disabled={pending} onClick={remove}>
              Delete {data.org.name}
            </Button>
          </Card>
        </>
      ) : null}
    </AdminPanel>
  );
}

function BackLink() {
  return (
    <Link href="/admin/organizations" className="text-[12px] text-[color:var(--color-ink)] underline-offset-2 hover:underline">
      All organizations
    </Link>
  );
}
