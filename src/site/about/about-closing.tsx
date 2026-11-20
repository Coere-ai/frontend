import Link from "next/link";
import { contactHref, contactLabel } from "@/site/content/navigation";
import { Container } from "@/site/ui/container";

const BUTTON = "inline-flex h-12 items-center justify-center rounded-full px-6 text-[15px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

/**
 * The About page's last word, on the dark page: one line and a way to reach
 * the founders, on a plain glass panel with a fine light border.
 */
export function AboutClosing({ title, text }: { title: string; text: string }) {
  return (
    <section className="pt-8 pb-24 md:pt-12 md:pb-32">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[28px] bg-white/[0.03] px-6 py-20 text-center ring-1 ring-white/10 md:py-28">
          <h2 className="mx-auto max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-white text-balance md:text-7xl">{title}</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/65">{text}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href={contactHref} className={`${BUTTON} bg-brand-500 text-white shadow-[0_12px_30px_-12px_rgba(82,103,247,0.9)] hover:bg-brand-600 focus-visible:outline-white`}>
              {contactLabel}
            </Link>
            <Link href="/#demo" className={`${BUTTON} bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md hover:bg-white/15 focus-visible:outline-white`}>
              Watch the demo
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
