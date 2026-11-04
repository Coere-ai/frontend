"use client";

import Link from "next/link";

import type { UserDetailPayload } from "@/lib/admin/types";
import { ago, bytes, compact, day, dollars, whole } from "@/lib/dashboard/format";
import { Kpi, Section, Table } from "@/stats/panel/ui";

import { AdminPanel } from "../admin-panel";
import { Card } from "../controls";
import { MemoryGraph } from "../memory-graph";
import { useAdminData } from "../use-admin-data";

import { AccountActions } from "./account-actions";

/**
 * One account: its running totals, this month, its memory file, its
 * devices, what the operator can change, and its knowledge graph behind a
 * button.
 */
export function UserPanel({ id }: { id: string }) {
  const { data, error, reload } = useAdminData<UserDetailPayload>(`/api/admin/users/${id}`);
  const u = data?.user;

  return (
    <AdminPanel title={u ? (u.email ?? u.username ?? "Account") : "Account"} ready={!!data} error={error} reload={reload} control={<BackLink />}>
      {data && u ? (
        <>
          <p className="text-[12.5px] text-[color:var(--color-ink)]">
            {[u.username ? `@${u.username}` : null, u.displayName, `${u.plan} plan`, u.status, u.org ? `${u.org.role} of ${u.org.name}` : "no organization", `joined ${day(u.createdAt)}`, u.lastSeenAt ? `last seen ${ago(u.lastSeenAt)}` : "never seen"]
              .filter(Boolean)
              .join(", ")}
          </p>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Kpi label="Cost this month" value={dollars(data.month.costMicros)} />
            <Kpi label="Lifetime cost" value={dollars(data.totals.costMicros)} />
            <Kpi label="Tokens saved" value={compact(data.totals.tokensSaved)} />
            <Kpi label="Memories" value={compact(data.totals.memories)} />
            <Kpi label="Chats" value={compact(data.totals.chats)} />
            <Kpi label="Requests" value={compact(data.totals.requests)} />
            <Kpi label="Tokens used" value={compact(data.totals.tokensUsed)} />
            <Kpi label="Context imports" value={compact(data.totals.contextImports)} />
            <Kpi label="Transfers" value={compact(data.totals.transfers)} />
            <Kpi label="Memory file" value={data.memory ? bytes(data.memory.bytes) : "None"} />
          </section>
          <p className="text-[12px] text-[color:var(--color-muted)]">
            This month: {whole(data.month.requests)} requests, {compact(data.month.inputTokens)} input and {compact(data.month.outputTokens)} output tokens.
            {data.memory?.uploadedAt ? ` Memory last backed up ${ago(data.memory.uploadedAt)}.` : ""} Backup {u.memorySync ? "on" : "off"}, sensitive memories{" "}
            {u.includeSensitive ? "included" : "left out"}.
          </p>
          <AccountActions data={data} reload={reload} />
          <Section title="Devices">
            <div className="overflow-x-auto whitespace-nowrap">
              <Table
                head={["Name", "Token", "Version", "Connected", "Last used", "Revoked"]}
                empty="No device has connected."
                rows={data.devices.map((d) => [
                  d.name,
                  `…${d.hint}`,
                  d.version ?? "",
                  day(d.createdAt),
                  d.lastUsedAt ? ago(d.lastUsedAt) : "Never",
                  d.revokedAt ? `${day(d.revokedAt)}${d.revokedReason ? ` (${d.revokedReason.replace("_", " ")})` : ""}` : "",
                ])}
              />
            </div>
          </Section>
          <Card title="Knowledge graph">
            <MemoryGraph url={`/api/admin/users/${id}/memory`} what="this person's" />
          </Card>
        </>
      ) : null}
    </AdminPanel>
  );
}

function BackLink() {
  return (
    <Link href="/admin/users" className="text-[12px] text-[color:var(--color-ink)] underline-offset-2 hover:underline">
      All accounts
    </Link>
  );
}
