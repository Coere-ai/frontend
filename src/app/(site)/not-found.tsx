import { ButtonLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";

/** The new site's 404, inside its navbar and footer. */
export default function NotFound() {
  return (
    <section className="py-32 md:py-44">
      <Container className="text-center">
        <p className="text-sm font-medium text-neutral-500">404</p>
        <h1 className="mt-4 text-5xl font-medium tracking-[-0.05em] text-neutral-950 md:text-7xl">This page isn&apos;t here.</h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-neutral-500">It may have moved, or the address may be off by a letter.</p>
        <div className="mt-10 flex justify-center">
          <ButtonLink href="/">Go home</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
