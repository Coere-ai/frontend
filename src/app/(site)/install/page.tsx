import type { Metadata } from "next";
import { hiddenPage } from "@/lib/seo";
import { ComingSoon } from "@/site/blocks/coming-soon";

export const metadata: Metadata = {
  title: "Install Coere",
  description: "Coere is coming soon to the Chrome Web Store.",
  // A holding page until the extension is listed, so kept out of search.
  ...hiddenPage,
};

/** Where every Install button leads until Coere is in the Chrome Web Store. */
export default function InstallPage() {
  return <ComingSoon />;
}
