import type { Metadata } from "next";

import { listDevices } from "@/lib/account/devices";
import { requireUser, signedInJustNow } from "@/lib/auth/user";
import { readMembership } from "@/lib/org/membership";
import { readOrgPage } from "@/lib/org/page-data";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { DeviceRow } from "@/lib/v1/devices-body";
import { SignOutButton } from "@/site/account/sign-out-button";
import { Backup } from "@/site/account/web/backup";
import { Browsers } from "@/site/account/web/browsers";
import { DeleteAccount } from "@/site/account/web/delete-account";
import { Organization } from "@/site/account/web/organization";
import { Password } from "@/site/account/web/password";
import { Profile } from "@/site/account/web/profile";
import { Part } from "@/site/account/web/rows";
import { ButtonLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";

export const metadata: Metadata = {
  title: "Your account",
  description: "Your profile, how you sign in, your browsers, your memory backup and your account on coere.ai.",
  robots: { index: false, follow: false },
};

/**
 * /account: the steps a device token may not take (docs/accounts.md 7),
 * signed in on coere.ai, and how the person signs in (3.1). It sets the
 * display name, changes the username and the password, signs this browser out,
 * lists and revokes the browsers Coere is connected in, turns the memory
 * backup on, lets an admin invite someone or make an admin, and deletes
 * the account. It needs no Coere, so it
 * works from a phone when a laptop is lost. Everything else stays in the
 * dashboard, which is Coere's own Console.
 */
export default async function AccountPage() {
  const user = await requireUser("/account");
  const ready = supabaseConfigured();
  const [devices, profile, membership, fresh] = await Promise.all([
    ready ? listDevices(user.id).catch((): DeviceRow[] => []) : Promise.resolve<DeviceRow[]>([]),
    ready ? supabase().from("profiles").select("username, display_name, memory_sync, include_sensitive").eq("id", user.id).maybeSingle().then((r) => r.data) : Promise.resolve(null),
    ready ? readMembership(user.id).catch(() => null) : Promise.resolve(null),
    signedInJustNow(),
  ]);
  const username = (profile?.username as string | null | undefined) ?? null;
  const org = membership?.role === "admin" ? await readOrgPage(membership).catch(() => null) : null;

  return (
    <section className="bg-white pt-16 pb-28 md:pt-24 md:pb-36">
      <Container>
        <div className="mx-auto max-w-[720px]">
          <h1 className="text-[2rem] leading-[1.1] font-medium tracking-[-0.04em] text-neutral-950 md:text-[2.5rem]">Your account</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-neutral-500">
            Signed in as <span className="text-neutral-950 break-all">{username ?? "your account"}</span>. Your dashboard runs inside Coere; these steps are here so they work from any browser.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/dashboard" variant="secondary">
              Open the dashboard
            </ButtonLink>
          </div>
          <div className="mt-14 space-y-14">
            <Profile displayName={(profile?.display_name as string | null) ?? null} username={username} />
            <Password />
            <Part title="Sign out" line="Sign out of coere.ai in this browser. Coere stays connected here; to sign it out too, revoke this browser below.">
              <SignOutButton variant="secondary" />
            </Part>
            <Browsers devices={devices} />
            <Backup sync={Boolean(profile?.memory_sync)} includeSensitive={Boolean(profile?.include_sensitive)} />
            {org ? <Organization name={org.name} members={org.members.map((m) => ({ userId: m.userId, name: m.name, role: m.role }))} /> : null}
            <DeleteAccount username={username ?? ""} fresh={fresh} signInAgain={<SignOutButton variant="secondary" label="Sign in again" next="/sign-in?next=%2Faccount" />} />
          </div>
        </div>
      </Container>
    </section>
  );
}
