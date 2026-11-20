import { notFound } from "next/navigation";
import { rootMetadata, rootViewport } from "@/site/root/root-metadata";
import { RootDocument } from "@/site/root/root-document";
import { hasLocale, locales } from "@/site/i18n/locales";
import "../globals.css";

export const metadata = rootMetadata;
export const viewport = rootViewport;

/** One static copy of every page per language; any other first segment is not a language. */
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/**
 * The site's root layout. English pages are served here through a rewrite
 * (src/site/i18n/routing.ts), so /pricing and /es/pricing both arrive with
 * their language, which sets <html lang>.
 */
export default async function SiteRootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <RootDocument lang={lang}>{children}</RootDocument>;
}
