"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { OrgsPayload } from "@/lib/admin/types";
import { compact, day, dollars, whole } from "@/lib/dashboard/format";
import { Kpi, Section, Table } from "@/stats/panel/ui";

import { AdminPanel } from "../admin-panel";
import { useAdminData } from "../use-admin-data";

import { CreateOrg } from "./create-org";

/** Every organization, and the form that makes one. A row opens it. */
export function OrgsPanel() {
  const router = useRouter();
  const { data, error, reload } = useAdminData<OrgsPayload>("/api/admin/organizations");
  const rows = data?.rows ?? [];

  return (
    <AdminPanel title="Organizations" ready={!!data} error={error} reload={reload}>
      {data ? (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Organizations" value={whole(rows.length)} />
            <Kpi label="Members" value={whole(rows.reduce((s, r) => s + r.members, 0))} />
            <Kpi label="Tokens saved" value={compact(rows.reduce((s, r) => s + r.tokensSaved, 0))} />
            <Kpi label="AI cost" value={dollars(rows.reduce((s, r) => s + r.costMicros, 0))} />
          </section>
          <CreateOrg plans={data.plans} />
          <Section title="Every organization">
            <div className="overflow-x-auto whitespace-nowrap">
              <Table
                head={["Name", "Members", "Plan", "Tokens saved", "Memories", "Chats", "Cost", "Created"]}
                empty="No organization yet. Create the first one above."
                onRowClick={(i) => {
                  const r = rows[i];
                  if (r) router.push(`/admin/organizations/${r.id}`);
                }}
                rows={rows.map((r) => [
                  <Link key="name" href={`/admin/organizations/${r.id}`} onClick={(e) => e.stopPropagation()} className="underline-offset-2 hover:underline">
                    {r.name}
                  </Link>,
                  whole(r.members),
                  r.plan,
                  compact(r.tokensSaved),
                  compact(r.memories),
                  compact(r.chats),
                  dollars(r.costMicros),
                  day(r.createdAt),
                ])}
              />
            </div>
          </Section>
        </>
      ) : null}
    </AdminPanel>
  );
}
