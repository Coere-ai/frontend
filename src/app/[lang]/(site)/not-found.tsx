import type { Metadata } from "next";
import { ButtonLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";
import { DarkPage } from "@/site/ui/page-theme";

/** The 404's own title, so a missing page never borrows the home page's. Next adds noindex to every 404 by itself. */
export const metadata: Metadata = {
  title: "Page not found",
  description: "This page isn't on the Coere site. Coere is the AI memory layer you own, across every AI.",
  robots: { index: false, follow: true },
};

/** The new site's 404, inside its navbar and footer, with the ways back in, dark like every page. */
export default function NotFound() {
  return (
    <DarkPage>
      <section className="py-32 md:py-44">
        <Container className="text-center">
          <p className="text-sm font-medium text-neutral-500 dark:text-white/60">404</p>
          <h1 className="mt-4 text-5xl font-medium tracking-[-0.05em] text-neutral-950 dark:text-white md:text-7xl">This page isn&apos;t here.</h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-neutral-500 dark:text-white/65">It may have moved, or the address may be off by a letter.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/">Go home</ButtonLink>
            <ButtonLink href="/products/connect" variant="secondary">
              Coere Connect
            </ButtonLink>
            <ButtonLink href="/resources" variant="secondary">
              Developer docs
            </ButtonLink>
          </div>
        </Container>
      </section>
    </DarkPage>
  );
}
