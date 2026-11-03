import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getUser } from "@/lib/auth/user";
import { checkConnectParams, connectPath, type ConnectRefusal } from "@/lib/connect/params";
import { logSecurityEvent } from "@/lib/security/events";
import { AuthShell } from "@/site/account/auth-shell";
import { SignOutButton } from "@/site/account/sign-out-button";
import { ButtonLink } from "@/site/ui/button";

import { ConnectCard } from "./connect-card";

export const metadata: Metadata = {
  title: "Connect Coere",
  description: "Connect the Coere extension to your account.",
  robots: { index: false, follow: false },
};

/** Why a connect link was turned away, in words a person can act on. */
const REFUSED: Record<ConnectRefusal, string> = {
  extension: "This link came from a browser extension Coere does not know. Open Coere and click Sign in to get a new link.",
  state: "This link is incomplete. Open Coere and click Sign in to get a new one.",
  challenge: "This link is incomplete. Open Coere and click Sign in to get a new one.",
};

/**
 * The page the extension opens to get a device token (docs/accounts.md
 * section 4). The address is checked before anything else, then the person
 * signs in if they need to, then they confirm.
 */
export default async function ConnectPage({ searchParams }: PageProps<"/connect">) {
  const checked = checkConnectParams(await searchParams, {
    extensionIds: process.env.COERE_EXTENSION_IDS,
    production: process.env.NODE_ENV === "production",
  });
  const user = await getUser();

  if (!checked.ok) {
    await logSecurityEvent("connect_refused", { userId: user?.id ?? null, headers: await headers() });
    return (
      <AuthShell eyebrow="Connect Coere" title="This link can't connect Coere" lede={REFUSED[checked.reason]}>
        <ButtonLink href="/" variant="secondary">
          Go home
        </ButtonLink>
      </AuthShell>
    );
  }

  const back = connectPath(checked.params);
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(back)}`);

  return (
    <AuthShell eyebrow="Connect Coere" title="Connect Coere to your account" lede="One press links Coere in this browser to your account.">
      <ConnectCard email={user.email} params={checked.params} />
      <div className="mt-6 flex justify-center">
        <SignOutButton variant="text" label="Use another account" next={`/sign-in?next=${encodeURIComponent(back)}`} />
      </div>
    </AuthShell>
  );
}
