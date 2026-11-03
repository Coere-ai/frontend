import type { Metadata } from "next";

import { getUser } from "@/lib/auth/user";
import { SignOutButton } from "@/site/account/sign-out-button";
import { DashboardRail } from "@/site/dashboard/rail";
import { Container } from "@/site/ui/container";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Coere dashboard" },
  robots: { index: false, follow: false },
};

/**
 * The frame of every dashboard page: the sections on the left (a row on a
 * phone) and the page beside them. Each page checks the session itself;
 * this only reads it to show whose dashboard it is.
 */
export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await getUser();
  return (
    <section className="pt-8 pb-24 md:pt-12">
      <Container>
        <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <DashboardRail />
            {user ? (
              <div className="mt-8 hidden border-t border-neutral-100 pt-6 lg:block">
                <p className="truncate px-4 text-[13px] text-neutral-500" title={user.email}>
                  {user.email}
                </p>
                <SignOutButton variant="text" className="mt-2 ml-4" />
              </div>
            ) : null}
          </aside>
          <div className="mt-8 min-w-0 lg:mt-0">{children}</div>
        </div>
      </Container>
    </section>
  );
}
