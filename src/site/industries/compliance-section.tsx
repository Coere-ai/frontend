import type { IndustryCompliance } from "@/site/content/compliance";
import { inPlaceToday } from "@/site/content/compliance";
import { SECTION_Y } from "@/site/home/look";
import { ArrowLink } from "@/site/ui/arrow-link";
import { Container } from "@/site/ui/container";

/**
 * The standards Coere will meet before it handles a field's data, each with
 * why it matters there, then what is in place today. Coere holds none of
 * these yet, and the note under the heading says so. Dark glass on the
 * industry page's near black.
 */
export function ComplianceSection({ field, compliance }: { field: string; compliance: IndustryCompliance }) {
  return (
    <section id="compliance" aria-labelledby="compliance-title" className={`scroll-mt-24 ${SECTION_Y}`}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 id="compliance-title" className="text-4xl font-semibold tracking-[-0.04em] text-white text-balance md:text-[3.25rem] md:leading-[1.04]">
              Compliance for {field}
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/65 text-balance">What Coere will meet before it handles {compliance.holder} data.</p>
            <p className="mt-6 max-w-md border-l border-brand-400/70 pl-4 text-[15px] leading-relaxed text-white/55">
              Coere is pre launch. It is not yet audited against these standards, and it will meet them before it works with {field} teams.
            </p>
          </div>

          <ol className="overflow-hidden rounded-[28px] bg-white/[0.045] ring-1 ring-white/10">
            {compliance.standards.map((standard, index) => (
              <li key={standard.name} className="grid gap-3 border-white/10 px-6 py-6 not-first:border-t sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:px-8 md:grid-cols-[2.5rem_minmax(0,15rem)_minmax(0,1fr)] md:gap-6 md:py-7">
                <span aria-hidden="true" className="font-mono text-[13px] leading-7 text-brand-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg leading-7 font-semibold tracking-[-0.01em] text-white">{standard.name}</h3>
                  {standard.where ? <p className="mt-1 text-[13px] leading-snug text-brand-300">{standard.where}</p> : null}
                </div>
                <p className="text-[15px] leading-relaxed text-white/65 sm:col-start-2 md:col-start-auto">{standard.why}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 rounded-[28px] bg-white/[0.025] px-6 py-8 ring-1 ring-white/[0.08] sm:px-8 md:mt-12 md:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
            <h3 className="text-xl font-semibold tracking-[-0.02em] text-white">In place today</h3>
            <ArrowLink href="/privacy">Read the privacy policy</ArrowLink>
          </div>
          <ul className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-5">
            {inPlaceToday.map((fact) => (
              <li key={fact} className="border-t border-brand-400/70 pt-4 text-[15px] leading-relaxed text-white/65">
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
