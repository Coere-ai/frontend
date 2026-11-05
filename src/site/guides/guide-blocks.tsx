import Link from "next/link";
import type { ReactNode } from "react";
import { CheckList } from "@/site/blocks/check-list";
import { Stage } from "@/site/blocks/stage";
import type { Background } from "@/site/content/backgrounds";
import { contactHref, contactLabel } from "@/site/content/navigation";
import type { Film } from "@/site/content/films";
import type { Step, Way } from "@/site/content/guides";
import { ArrowLink } from "@/site/ui/arrow-link";
import { ButtonLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";
import { FilmFrame } from "@/site/ui/film-frame";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { Underlined } from "@/site/ui/underlined";

/**
 * The parts the guide pages are made of, each in the site's own type and
 * spacing: a direct answer beside a short list, a numbered workflow over
 * its live film, ways side by side, a plain table, what works today, and
 * links on to the rest of the site.
 */

const H2 = "text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-5xl md:leading-[1.05]";

/** The question the page answers, answered in a few paragraphs, with something to look at beside it. */
export function AnswerSection({ title, paragraphs, aside, tint = false }: { title: string; paragraphs: string[]; aside: ReactNode; tint?: boolean }) {
  return (
    <section className={`py-28 md:py-32 ${tint ? "bg-neutral-50" : ""}`}>
      <Container className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <h2 className={H2}>{title}</h2>
          {paragraphs.map((p) => (
            <p key={p} className="mt-5 text-lg leading-relaxed text-neutral-600">
              {p}
            </p>
          ))}
        </div>
        <div className={`rounded-[28px] p-8 md:p-12 ${tint ? "bg-white" : "bg-neutral-50"}`}>{aside}</div>
      </Container>
    </section>
  );
}

/** A workflow as numbered steps, four to a row on wide screens. */
export function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, i) => (
        <li key={step.title}>
          <span className="inline-grid h-9 w-9 place-items-center rounded-full bg-neutral-950 text-[15px] font-medium text-white tabular-nums">{i + 1}</span>
          <h3 className="mt-5 text-[22px] font-medium tracking-[-0.02em] text-neutral-950">{step.title}</h3>
          <p className="mt-2.5 text-[15px] leading-relaxed text-neutral-600">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}

/** How to do it: the steps, then the whole thing playing live on Coere's own code. */
export function WorkflowSection({ id = "how", title, line, steps, film, background, link }: { id?: string; title: string; line: string; steps: Step[]; film: Film; background: Background; link?: { href: string; label: string } }) {
  return (
    <section id={id} className="scroll-mt-24 py-28 md:py-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className={H2}>{title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">{line}</p>
          {link ? <ArrowLink href={link.href} className="mt-6 text-neutral-950">{link.label}</ArrowLink> : null}
        </div>
        <div className="mt-16">
          <StepList steps={steps} />
        </div>
        <Stage background={background} className="mt-16">
          <div aria-hidden="true" className="absolute inset-0 bg-neutral-950/45" />
          <div className="relative p-6 md:p-12">
            <FilmFrame film={film} />
          </div>
        </Stage>
      </Container>
    </section>
  );
}

/** Several ways to do one thing, side by side, each with where to read more. */
export function WaysSection({ title, line, ways }: { title: string; line: string; ways: Way[] }) {
  return (
    <section className="bg-neutral-50 py-28 md:py-32">
      <Container>
        <div className="max-w-3xl">
          <h2 className={H2}>{title}</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">{line}</p>
        </div>
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {ways.map((way, i) => (
            <li key={way.name} className={`flex flex-col rounded-3xl p-8 ring-1 ${i === ways.length - 1 ? "bg-brand-50 ring-brand-200" : "bg-white ring-neutral-200"}`}>
              <span className="text-[13px] font-medium text-neutral-500 tabular-nums">Way {i + 1}</span>
              <h3 className="mt-2 text-2xl font-medium tracking-[-0.03em] text-neutral-950">{way.name}</h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-neutral-600">{way.text}</p>
              {way.link ? (
                way.link.external ? (
                  <a href={way.link.href} target="_blank" rel="noopener noreferrer" className="group mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-neutral-950">
                    {way.link.label}
                    <ArrowRightIcon size={16} className="-rotate-45 transition-transform group-hover:translate-x-0.5" />
                  </a>
                ) : (
                  <ArrowLink href={way.link.href} className="mt-6 text-neutral-950">{way.link.label}</ArrowLink>
                )
              ) : null}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/** A plain table of words, Coere's column last and tinted, in the style of How Coere compares. */
export function WordsTable({ caption, columns, rows, note }: { caption: string; columns: string[]; rows: { name: string; cells: string[] }[]; note: string }) {
  const last = columns.length - 1;
  return (
    <section className="py-28 md:py-32">
      <Container>
        <div className="relative overflow-x-auto rounded-3xl bg-white ring-1 ring-neutral-200 shadow-[0_40px_100px_-50px_rgba(0,0,0,0.3)]">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="px-4 pt-8 text-left text-2xl font-medium tracking-[-0.03em] text-neutral-950 md:px-8">{caption}</caption>
            <thead>
              <tr>
                <th scope="col" className="w-[22%] px-4 pt-6 pb-4 md:px-8">
                  <span className="sr-only">What</span>
                </th>
                {columns.map((name, i) => (
                  <th key={name} scope="col" className={`px-4 pt-6 pb-4 text-[14px] font-medium md:text-[15px] ${i === last ? "rounded-t-2xl bg-brand-50 text-brand-600" : "text-neutral-500"}`}>
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={row.name} className="border-t border-neutral-100">
                  <th scope="row" className="px-4 py-5 text-[15px] font-medium text-neutral-950 md:px-8">{row.name}</th>
                  {row.cells.map((cell, i) => (
                    <td key={i} className={`px-4 py-5 text-[15px] leading-snug ${i === last ? `bg-brand-50 text-neutral-950 ${r === rows.length - 1 ? "rounded-b-2xl" : ""}` : "text-neutral-600"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-center text-[13px] text-neutral-500">{note}</p>
      </Container>
    </section>
  );
}

/** What works today, said plainly, with how to get it. */
export function TodaySection({ title, items, status }: { title: string; items: string[]; status: string }) {
  const half = Math.ceil(items.length / 2);
  return (
    <section className="border-t border-neutral-100 bg-neutral-50 py-28 md:py-32">
      <Container className="grid gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div>
          <h2 className={H2}>{title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-neutral-600">{status}</p>
          <div className="mt-8">
            <ButtonLink href={contactHref}>{contactLabel}</ButtonLink>
          </div>
        </div>
        <div className="grid gap-6 self-center sm:grid-cols-2">
          <CheckList items={items.slice(0, half)} />
          <CheckList items={items.slice(half)} />
        </div>
      </Container>
    </section>
  );
}

/** Where to go next: cards for the pages that carry on from this one. */
export function RelatedSection({ links }: { links: { href: string; kind: string; name: string }[] }) {
  return (
    <section className="border-t border-neutral-100 py-24">
      <Container>
        <h2 className="text-sm font-medium text-neutral-500">Read next</h2>
        <ul className="mt-6 grid gap-6 md:grid-cols-3">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="group flex h-full flex-col rounded-3xl bg-white p-6 ring-1 ring-neutral-200">
                <span className="text-[13px] font-medium text-neutral-500">{link.kind}</span>
                <span className="mt-1 text-2xl font-medium tracking-[-0.03em] text-neutral-950">
                  <Underlined big>{link.name}</Underlined>
                </span>
                <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-neutral-950">
                  Read
                  <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
