import type { Metadata } from "next";
import { hiddenPage } from "@/lib/seo";
import { ComingSoon } from "@/site/blocks/coming-soon";

export const metadata: Metadata = {
  title: "Try Coere for Teams",
  description: "Coere for Teams is coming soon, with a free week to try it.",
  // A holding page until the free week opens, so kept out of search.
  ...hiddenPage,
};

// Static, with the launch moment read through a tagged cache. Saving it in
// /admin/launch expires both pages; this hour is only a floor.
export const revalidate = 3600;

/** Where Try it free leads until Coere for Teams opens. */
export default function TryTeamsPage() {
  return <ComingSoon product="teams" />;
}
