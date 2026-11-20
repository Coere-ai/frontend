import { rootMetadata, rootViewport } from "@/site/root/root-metadata";
import { RootDocument } from "@/site/root/root-document";
import "../globals.css";

export const metadata = rootMetadata;
export const viewport = rootViewport;

/**
 * The root layout of the pages outside the site: the admin panel, the
 * dashboard and the welcome page. They are in English and have no navbar
 * or footer, so they sit outside app/[lang].
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
