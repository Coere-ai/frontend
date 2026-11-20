import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { docsSeo } from "@/site/content/seo";
import { docPage } from "@/site/content/docs";
import { DocView } from "@/site/docs/doc-view";
import { EnglishOnly } from "@/site/i18n/english-only";

export const metadata: Metadata = pageMetadata({ ...docsSeo, path: "/resources" });

/** Resources opens on the docs' introduction. */
export default function ResourcesPage() {
  const page = docPage("overview");
  return page ? (
    <EnglishOnly>
      <DocView page={page} />
    </EnglishOnly>
  ) : null;
}
