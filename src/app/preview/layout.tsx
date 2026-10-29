import type { Metadata } from "next";
import { requirePass } from "@/lib/access/server";
import { Footer } from "@/site/footer/footer";
import { Navbar } from "@/site/nav/navbar";

/**
 * The new site's frame. Visitors reach these routes only through the proxy's
 * rewrite, and requirePass turns anyone without a pass away here too. Nothing
 * here may be indexed while the site is private.
 */
export const metadata: Metadata = {
  // absolute, so the root layout's own "| Coere" template doesn't wrap it a second time.
  title: { absolute: "Coere | Own your memory", template: "%s | Coere" },
  description: "Coere is the memory layer you own, across every AI.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function PreviewLayout({ children }: LayoutProps<"/preview">) {
  await requirePass();
  return (
    <div className="flex min-h-dvh flex-col bg-white text-neutral-950">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
