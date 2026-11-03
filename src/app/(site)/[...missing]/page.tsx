import type { Metadata } from "next";
import { notFound } from "next/navigation";

/** The 404's own title, so a missing page never borrows the home page's. Next adds noindex to every 404. */
export const metadata: Metadata = {
  title: "Page not found",
  description: "This page isn't on the Coere site. Coere is the AI memory layer you own, across every AI.",
  robots: { index: false, follow: true },
};

/**
 * Catches every address the new site doesn't have, so its 404 renders inside
 * the new site's layout instead of falling through to the bare default.
 */
export default function Missing() {
  notFound();
}
