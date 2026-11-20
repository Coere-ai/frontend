import type { Metadata } from "next";

import "@/stats/stats.css";

/**
 * The operator's panel. It sits outside the (site) group, so it has no navbar
 * or footer and the tracking beacon never mounts here. The `.stats` wrapper
 * scopes the panel's colour tokens, so nothing in stats.css reaches a public
 * page.
 */
export const metadata: Metadata = {
  title: "Admin",
  // Never index it, never follow anything on it, never keep a cached copy.
  robots: { index: false, follow: false, nocache: true, noarchive: true, googleBot: { index: false, follow: false } },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="stats min-h-dvh">{children}</div>;
}
