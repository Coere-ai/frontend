import { contactHref, contactLabel } from "@/site/content/navigation";
import { ButtonLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";

/**
 * The last word on a page: one line and a way to reach the founders, on a
 * flat pale panel in the home page's card style. On a dark page the panel
 * is plain glass with a fine light border and the main button Coere blue,
 * as on About.
 */
export function ClosingCta({
  title = "Your memory belongs to you.",
  text = "Talk to the founders about Coere for you, your team or your app.",
  primary = { href: contactHref, label: contactLabel },
}: {
  title?: string;
  text?: string;
  /** The main button: the waitlist, or a page's own (Solutions books a demo). */
  primary?: { href: string; label: string };
}) {
  return (
    <section className="pt-8 pb-24 md:pt-12 md:pb-32">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[28px] bg-[#f5f6fb] px-6 py-20 text-center ring-1 ring-neutral-950/[0.04] md:py-28 dark:bg-white/[0.03] dark:ring-white/10">
          <h2 className="mx-auto max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-neutral-950 text-balance md:text-7xl dark:text-white">{title}</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-600 dark:text-white/65">{text}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href={primary.href} className="dark:bg-brand-500 dark:shadow-[0_6px_14px_-8px_rgba(82,103,247,0.45)] dark:hover:bg-brand-600 dark:focus-visible:outline-white">
              {primary.label}
            </ButtonLink>
            <ButtonLink href="/demo" variant="secondary" className="dark:border-white/20 dark:bg-white/10 dark:text-white dark:backdrop-blur-md dark:hover:border-white/20 dark:hover:bg-white/15 dark:focus-visible:outline-white">
              Watch the demo
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
