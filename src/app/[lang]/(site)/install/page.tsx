import type { Metadata } from "next";
import { hiddenPage } from "@/lib/seo";
import { ComingSoon } from "@/site/blocks/coming-soon";
import { getMessages } from "@/site/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { launch } = await getMessages();
  return {
    title: launch.connect.metaTitle,
    description: launch.connect.metaDescription,
    // A holding page until the extension is listed, so kept out of search.
    ...hiddenPage,
  };
}

// Static, with the launch moment read through a tagged cache. Saving it in
// /admin/launch expires both pages; this hour is only a floor.
export const revalidate = 3600;

/** Where every Install button leads until Coere is in the Chrome Web Store. */
export default function InstallPage() {
  return <ComingSoon product="connect" />;
}
