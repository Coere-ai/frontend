import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/user";
import { compact, dollars, whole } from "@/lib/dashboard/format";
import { readMembership } from "@/lib/org/membership";
import { readMyInvites } from "@/lib/org/my-invites";
import { readOrgPage } from "@/lib/org/page-data";
import { sectionChoices } from "@/lib/org/sections";
import { siteConfig } from "@/lib/site";
import { supabaseConfigured } from "@/lib/supabase";
import { demoHref, demoLabel } from "@/site/content/navigation";
import { PageHeader, Panel, Stat, StatGrid, Wash } from "@/site/dashboard/panel";
import { MemoryExplorer } from "@/site/memory/memory-explorer";
import { InvitePanel } from "@/site/organization/invite-panel";
import { MemberList } from "@/site/organization/member-list";
import { MyInvites } from "@/site/organization/my-invites";
import { MySharing } from "@/site/organization/my-sharing";
import { OrgSettings } from "@/site/organization/org-settings";
import { ButtonLink } from "@/site/ui/button";

export const metadata: Metadata = { title: "Organization" };

/**
 * The person's organization (docs/accounts.md 14.3): its totals, the
 * shared knowledge graph with who brought each memory, its members, and
 * for admins the invites and settings. With no organization, the invites
 * waiting for this person. Membership is read for the signed in person
 * first; every other read is scoped to that organization.
 */
export default async function OrganizationPage() {
  const user = await requireUser("/dashboard/organization");
  const membership = supabaseConfigured() ? await readMembership(user.id).catch(() => null) : null;

  if (!membership) {
    const invites = supabaseConfigured() ? await readMyInvites(user.id) : [];
    return (
      <div className="space-y-8">
        <PageHeader title="Organization" lede="A company and its people reading from one shared knowledge graph." />
        {invites.length > 0 ? <MyInvites invites={invites} /> : null}
        <Wash>
          <p className="text-xl font-medium tracking-[-0.02em] text-neutral-950">{invites.length > 0 ? "Not in an organization yet" : "You are not in an organization"}</p>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-neutral-500">
            Your organization&apos;s admin adds you by your email ({user.email}) or your username. The invite shows here. If your company has no organization on Coere yet, talk to us.
          </p>
          <div className="mt-6">
            <ButtonLink href={demoHref} variant="secondary">
              {demoLabel}
            </ButtonLink>
          </div>
        </Wash>
      </div>
    );
  }

  const data = await readOrgPage(membership);
  if (!data) return <PageHeader title="Organization" lede="Your organization could not be read. Reload the page in a minute." />;
  const admin = membership.role === "admin";
  const choices = sectionChoices(data.view?.sections ?? [], data.sharedSections);
  const names = Object.fromEntries(data.members.map((m) => [m.userId, m.name]));
  const me = data.members.find((m) => m.userId === user.id);

  return (
    <div className="space-y-8">
      <PageHeader title={data.name} lede={`You are ${admin ? "an admin" : "a member"}. Everyone here reads one shared graph built from what members share.`} />
      <Panel>
        <StatGrid>
          <Stat label="Tokens saved" value={compact(data.totals.tokensSaved)} />
          <Stat label="Memories" value={whole(data.totals.memories)} note={`from ${whole(data.totals.chats)} chats`} />
          <Stat label="AI cost this month" value={dollars(data.totals.monthCostMicros)} note={`${dollars(data.totals.costMicros)} in all`} />
          <Stat label="Members" value={whole(data.totals.members)} />
        </StatGrid>
      </Panel>

      <section className="space-y-4">
        <h2 className="text-xl font-medium tracking-[-0.02em] text-neutral-950">Shared knowledge graph</h2>
        {data.view && data.view.facts.length + data.view.sources.length > 0 ? (
          <MemoryExplorer view={data.view} center={data.name} names={names} />
        ) : (
          <Wash>
            <p className="text-[15px] leading-relaxed text-neutral-500">
              Nothing shared yet. When members back up their memory with sharing on, their {data.sharedSections.join(", ")} memories come together here.
            </p>
          </Wash>
        )}
      </section>

      <MemberList members={data.members} me={user.id} admin={admin} sections={choices.filter((c) => data.sharedSections.includes(c.key))} />
      {admin ? <InvitePanel invites={data.invites} signUpUrl={`${siteConfig.url}/sign-up`} /> : null}
      <MySharing orgName={data.name} shareMemory={me?.shareMemory ?? true} contributeAllowed={me?.effective.contribute ?? true} shared={choices.filter((c) => data.sharedSections.includes(c.key)).map((c) => c.name)} />
      {admin ? <OrgSettings name={data.name} shared={data.sharedSections} defaultAccess={data.defaultAccess} choices={choices} /> : null}
    </div>
  );
}
