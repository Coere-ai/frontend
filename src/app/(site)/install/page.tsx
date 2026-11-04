import type { Metadata } from "next";
import { hiddenPage } from "@/lib/seo";
import { ComingSoon } from "@/site/blocks/coming-soon";

export const metadata: Metadata = {
  title: "Install Coere",
  description: "Coere is coming soon to the Chrome Web Store.",
  // A holding page until the extension is listed, so kept out of search.
  ...hiddenPage,
};

// Static, with the launch moment read through a tagged cache. Saving it in
// /admin/launch expires both pages; this hour is only a floor.
export const revalidate = 3600;

/** Where every Install button leads until Coere is in the Chrome Web Store. */
export default function InstallPage() {
  return <ComingSoon product="connect" />;
}
