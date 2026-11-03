import type { Metadata } from "next";
import { hiddenPage } from "@/lib/seo";
import { ComingSoon } from "@/site/blocks/coming-soon";

export const metadata: Metadata = {
  title: "Try Coere for Teams",
  description: "Coere for Teams is coming soon, with a free week to try it.",
  // A holding page until the free week opens, so kept out of search.
  ...hiddenPage,
};

/** Where Try it free leads until Coere for Teams opens. */
export default function TryTeamsPage() {
  return <ComingSoon eyebrow="Coere Solutions" title="Coere for Teams is coming soon" line="The free week opens soon. Until then, see Coere at work in the demo." />;
}
