import type { Faq } from "@/site/content/faqs";
import { ArrowLink } from "@/site/ui/arrow-link";
import { Container } from "@/site/ui/container";

/** The two looks: thin rules between questions, or each question on a soft card (the home page). */
const looks = {
  rules: {
    section: "border-t border-neutral-100 py-28 md:py-32",
    label: "text-[15px] font-medium text-brand-500",
    title: "mt-3 text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-5xl md:leading-[1.05]",
    list: "",
    item: "border-t border-neutral-300 py-7 last:border-b",
    question: "text-[22px] font-medium tracking-[-0.025em] text-neutral-950 text-balance",
  },
  soft: {
    section: "py-24 md:py-32",
    label: "inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-[13px] font-medium text-brand-600 ring-1 ring-brand-100",
    title: "mt-5 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 text-balance md:text-[3.25rem] md:leading-[1.04]",
    list: "space-y-3",
    item: "rounded-[22px] bg-[#f5f6fb] px-6 py-6 ring-1 ring-neutral-950/[0.04] md:px-8 md:py-7",
    question: "text-[20px] font-semibold tracking-[-0.025em] text-neutral-950 text-balance",
  },
};

/**
 * Questions and their answers, all open: the heading on the left, each
 * question on the right under a thin rule or on a soft card, like the
 * accordion lists, but with nothing to click open. The same words go into
 * the page's FAQPage data (faqGraph), so what search engines read is what
 * people see.
 */
export function FaqSection({ faqs, title = "Questions, answered", line, id = "faq", look = "rules" }: { faqs: Faq[]; title?: string; line?: string; id?: string; look?: keyof typeof looks }) {
  const style = looks[look];
  return (
    <section id={id} className={`scroll-mt-24 ${style.section}`}>
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className={style.label}>FAQ</p>
          <h2 className={style.title}>{title}</h2>
          {line ? <p className="mt-5 max-w-md text-lg leading-relaxed text-neutral-600">{line}</p> : null}
        </div>
        <ul className={style.list}>
          {faqs.map((faq) => (
            <li key={faq.q} className={style.item}>
              <h3 className={style.question}>{faq.q}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-neutral-600">{faq.a}</p>
              {faq.link ? <ArrowLink href={faq.link.href} className="mt-4 text-neutral-950">{faq.link.label}</ArrowLink> : null}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
