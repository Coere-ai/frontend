import type { Metadata } from "next";
import { getMessages } from "@/site/i18n/server";
import { ButtonLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";
import { DarkPage } from "@/site/ui/page-theme";

/** The 404's own title, so a missing page never borrows the home page's. Next adds noindex to every 404 by itself. */
export async function generateMetadata(): Promise<Metadata> {
  const t = (await getMessages()).chrome.notFound;
  return { title: t.title, description: t.description, robots: { index: false, follow: true } };
}

/** The new site's 404, inside its navbar and footer, with the ways back in, dark like every page, in the address's language. */
export default async function NotFound() {
  const t = (await getMessages()).chrome.notFound;
  return (
    <DarkPage>
      <section className="py-32 md:py-44">
        <Container className="text-center">
          <p className="text-sm font-medium text-neutral-500 dark:text-white/60">404</p>
          <h1 className="mt-4 text-5xl font-medium tracking-[-0.05em] text-neutral-950 dark:text-white md:text-7xl">{t.heading}</h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-neutral-500 dark:text-white/65">{t.line}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/">{t.home}</ButtonLink>
            <ButtonLink href="/products/connect" variant="secondary">
              Coere Connect
            </ButtonLink>
            <ButtonLink href="/resources" variant="secondary">
              {t.docs}
            </ButtonLink>
          </div>
        </Container>
      </section>
    </DarkPage>
  );
}
