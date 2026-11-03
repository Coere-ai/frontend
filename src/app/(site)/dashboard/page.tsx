import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/user";
import { ago, bytes, compact, dollars, plural, whole } from "@/lib/dashboard/format";
import { resolveLimits, spentShare } from "@/lib/dashboard/limits";
import { readDevices, readMemoryFile, readMonth, readPlan, readProfile, readTotals } from "@/lib/dashboard/reads";
import { sessionClient } from "@/lib/supabase/server";
import { allowedIds } from "@/site/bridge/extension-ids";
import { CoereCard } from "@/site/dashboard/coere-card";
import { ConnectFirst } from "@/site/dashboard/connect-first";
import { Meter, PageHeader, Panel, Row, Stat, StatGrid } from "@/site/dashboard/panel";
import { Underlined } from "@/site/ui/underlined";

export const metadata: Metadata = { title: "Overview" };

/** The dashboard's first page: what Coere holds for this account and what it cost this month. */
export default async function OverviewPage() {
  const user = await requireUser("/dashboard");
  const db = await sessionClient();
  const profile = await readProfile(db, user.id);
  const [plan, devices, file, month, totals] = await Promise.all([
    readPlan(db, profile?.planId ?? "free"),
    readDevices(db, user.id),
    readMemoryFile(db, user.id),
    readMonth(db, user.id),
    readTotals(db, user.id),
  ]);
  const live = devices.filter((d) => !d.revokedAt);
  const limits = resolveLimits(profile, plan);
  const covers = limits.ownMonthly ? "Your account covers" : `Your ${plan.name} plan covers`;
  const backupOn = profile?.memorySync ?? true;
  const fresh = live.length === 0 && !file;

  return (
    <div className="space-y-8">
      <PageHeader title="Overview" lede={`Signed in as ${user.email}.`} />
      {fresh ? <ConnectFirst /> : null}

      <Panel>
        <StatGrid>
          <Stat label="Memories" value={whole(file?.memories ?? 0)} note={file ? plural(file.chats, "chat") : "No backup yet"} />
          <Stat label="Tokens saved" value={compact(totals.tokensSaved)} note={plural(totals.contextImports + totals.transfers, "import or transfer", "imports and transfers")} />
          <Stat label="AI cost this month" value={dollars(month.costMicros)} note={`of ${dollars(limits.monthlyMicros)}${limits.ownMonthly ? "" : ` on ${plan.name}`}`} />
          <Stat label="Connected browsers" value={whole(live.length)} />
        </StatGrid>
      </Panel>

      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="This month" description={`${covers} ${dollars(limits.monthlyMicros)} of AI use a month. Coere pauses memory work when it is spent, until the next month.`}>
          <Meter value={spentShare(month.costMicros, limits.monthlyMicros)} label="Share of this month's limit used" />
          <div className="mt-6">
            <Row label="Spent">{dollars(month.costMicros)}</Row>
            <Row label="Requests">{whole(month.requests)}</Row>
            <Row label="Tokens">{compact(month.inputTokens + month.outputTokens)}</Row>
          </div>
          <Link href="/dashboard/usage" className="group mt-6 inline-block text-[14px] text-neutral-950">
            <Underlined>See usage by day and model</Underlined>
          </Link>
        </Panel>

        <Panel title="Memory backup" description={backupOn ? "Coere keeps a copy of your memory here, so this dashboard can show it." : "The backup is off, so coere.ai keeps no copy of your memory."}>
          <Row label="Last backup">{file ? ago(file.uploadedAt) : "None yet"}</Row>
          <Row label="Size">{file ? `${bytes(file.bytes)} of ${bytes(plan.storageLimitBytes)}` : "None"}</Row>
          <Row label="Sections">{whole(file?.sections ?? 0)}</Row>
          <Link href={backupOn ? "/dashboard/memory" : "/dashboard/settings"} className="group mt-6 inline-block text-[14px] text-neutral-950">
            <Underlined>{backupOn ? "Open your memory" : "Turn the backup on in Settings"}</Underlined>
          </Link>
        </Panel>
      </div>

      <CoereCard allowedIds={allowedIds(process.env.COERE_EXTENSION_IDS)} userId={user.id} backupOn={backupOn} />

      <Panel
        title="Connected browsers"
        description="Each Chrome where Coere is connected to this account."
        actions={
          <Link href="/dashboard/account" className="group text-[14px] text-neutral-950">
            <Underlined>Manage</Underlined>
          </Link>
        }
      >
        {live.length === 0 ? (
          <p className="text-[15px] text-neutral-500">None yet. Coere connects itself when you install it and press Connect Coere.</p>
        ) : (
          live.slice(0, 4).map((d) => (
            <Row key={d.id} label={d.name}>
              {d.lastUsedAt ? `Used ${ago(d.lastUsedAt)}` : `Connected ${ago(d.createdAt)}`}
            </Row>
          ))
        )}
      </Panel>
    </div>
  );
}
