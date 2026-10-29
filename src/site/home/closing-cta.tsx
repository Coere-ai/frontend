import { contactHref } from "@/site/content/navigation";
import { ButtonLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";

/** The last word on a page: one line, and a way to reach the founders. */
export function ClosingCta({
  title = "Your memory belongs to you.",
  text = "Talk to the founders about Coere for you, your team or your app.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="border-t border-neutral-100 py-28 md:py-36">
      <Container className="text-center">
        <h2 className="mx-auto max-w-4xl text-5xl font-medium tracking-[-0.05em] text-neutral-950 text-balance md:text-7xl">{title}</h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-500">{text}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href={contactHref}>Talk to Us</ButtonLink>
          <ButtonLink href="/#demo" variant="secondary">
            Watch the demo
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
