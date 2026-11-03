import type { Faq } from "@/site/content/faqs";
import { ArrowLink } from "@/site/ui/arrow-link";
import { Container } from "@/site/ui/container";

/**
 * Questions and their answers, all open: the heading on the left, each
 * question under a thin rule on the right, like the accordion lists, but
 * with nothing to click open. The same words go into the page's FAQPage
 * data (faqGraph), so what search engines read is what people see.
 */
export function FaqSection({ faqs, title = "Questions, answered", line, id = "faq" }: { faqs: Faq[]; title?: string; line?: string; id?: string }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-neutral-100 py-28 md:py-32">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[15px] font-medium text-brand-500">FAQ</p>
          <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-5xl md:leading-[1.05]">{title}</h2>
          {line ? <p className="mt-5 max-w-md text-lg leading-relaxed text-neutral-600">{line}</p> : null}
        </div>
        <ul>
          {faqs.map((faq) => (
            <li key={faq.q} className="border-t border-neutral-300 py-7 last:border-b">
              <h3 className="text-[22px] font-medium tracking-[-0.025em] text-neutral-950 text-balance">{faq.q}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-neutral-600">{faq.a}</p>
              {faq.link ? <ArrowLink href={faq.link.href} className="mt-4 text-neutral-950">{faq.link.label}</ArrowLink> : null}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
