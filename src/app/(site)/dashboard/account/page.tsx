import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/user";
import { day } from "@/lib/dashboard/format";
import { readDevices, readMemoryFile, readPlan, readProfile } from "@/lib/dashboard/reads";
import { sessionClient } from "@/lib/supabase/server";
import { DeleteAccount, MemoryCopy } from "@/site/dashboard/account/danger-zone";
import { DeviceList } from "@/site/dashboard/account/device-list";
import { PasswordForm, UsernameForm } from "@/site/dashboard/account/sign-in-forms";
import { PageHeader, Panel, Row } from "@/site/dashboard/panel";

export const metadata: Metadata = { title: "Account" };

/** Who the person is, how they sign in, which browsers are connected, and their data in and out. */
export default async function AccountPage() {
  const user = await requireUser("/dashboard/account");
  const db = await sessionClient();
  const [profile, devices, file] = await Promise.all([readProfile(db, user.id), readDevices(db, user.id), readMemoryFile(db, user.id)]);
  const plan = await readPlan(db, profile?.planId ?? "free");

  return (
    <div className="space-y-8">
      <PageHeader title="Account" />
      <Panel title="Your account">
        <Row label="Email">{user.email}</Row>
        <Row label="Username">{profile?.username ?? "None yet"}</Row>
        <Row label="Plan">{plan.name}</Row>
        <Row label="Member since">{day(profile?.createdAt) || "Today"}</Row>
      </Panel>
      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="Username" description="Sign in with your username and password instead of your email.">
          <UsernameForm current={profile?.username ?? null} />
        </Panel>
        <Panel title="Password" description="Optional. Without one, you sign in with a code sent to your email.">
          <PasswordForm />
        </Panel>
      </div>
      <Panel title="Connected browsers" description="Each Chrome where Coere uses this account. Revoke one you no longer use.">
        <DeviceList devices={devices} />
      </Panel>
      <Panel title="Your data" description="Download the stored .coere file, which opens in Coere on any computer, or delete it from coere.ai.">
        <MemoryCopy hasCopy={Boolean(file)} />
      </Panel>
      <Panel title="Delete account">
        <DeleteAccount email={user.email} />
      </Panel>
    </div>
  );
}
