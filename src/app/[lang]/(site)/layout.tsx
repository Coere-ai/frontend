import { darkViewport } from "@/lib/seo";
import { ContactLayer } from "@/site/contact/contact-layer";
import { I18nProvider } from "@/site/i18n/client";
import { getLocale, getMessages } from "@/site/i18n/server";
import { Footer } from "@/site/footer/footer";
import { Navbar } from "@/site/nav/navbar";
import { SiteTracker } from "@/site/tracker/site-tracker";

/** Every page of the site is dark, so the browser starts dark too. */
export const viewport = darkViewport;

/**
 * Every page of the site inside the navbar and footer, with the analytics
 * beacon beside them. Every page wraps itself in DarkPage, so the ground is
 * the dark theme's near black and a short page never shows a strip of white.
 * Titles, descriptions and keywords come from the root layout and each page.
 * The navbar, its menus and the footer read their words from the page's
 * language, given here once. The contact layer turns every link that
 * writes to the team, and every Book a demo, into its pop up.
 */
export default async function SiteLayout({ children }: LayoutProps<"/[lang]">) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);
  return (
    <I18nProvider locale={locale} messages={{ chrome: messages.chrome, catalog: messages.catalog }}>
      <div className="flex min-h-dvh flex-col bg-(--background) text-neutral-950">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <SiteTracker />
        <ContactLayer />
      </div>
    </I18nProvider>
  );
}
