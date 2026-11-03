import { Footer } from "@/site/footer/footer";
import { Navbar } from "@/site/nav/navbar";
import { SiteTracker } from "@/site/tracker/site-tracker";

/**
 * Every page of the site inside the navbar and footer, with the analytics
 * beacon beside them. Titles, descriptions and keywords come from the root
 * layout and each page.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-neutral-950">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <SiteTracker />
    </div>
  );
}
