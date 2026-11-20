import { darkViewport } from "@/lib/seo";
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
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col bg-(--background) text-neutral-950">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <SiteTracker />
    </div>
  );
}
