import type { Metadata } from "next";
import { docPage } from "@/site/content/docs";
import { DocView } from "@/site/docs/doc-view";

export const metadata: Metadata = {
  title: "Developer docs",
  description: "How to use the Coere API, MCP server and SDKs.",
};

/** Resources opens on the docs' introduction. */
export default function ResourcesPage() {
  const page = docPage("overview");
  return page ? <DocView page={page} /> : null;
}
