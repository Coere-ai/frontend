"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { compareTables, type CompareTable as Table, type Mark } from "@/site/content/compare";
import { Container } from "@/site/ui/container";
import { CheckIcon, CloseIcon } from "@/site/ui/icons/interface-icons";

/** A half filled circle, for "partly". */
const Half = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M7 1.5a5.5 5.5 0 0 0 0 11z" fill="currentColor" />
  </svg>
);

/**
 * One mark, in a soft circle of its own colour so a row reads at a glance:
 * green for yes, amber for partly, red for no. Coere's own yes is solid blue,
 * to keep its column apart. Each says its word to a screen reader.
 */
function Cell({ mark, coere = false }: { mark: Mark; coere?: boolean }) {
  const look =
    mark === "yes"
      ? coere
        ? "bg-brand-500 text-white"
        : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
      : mark === "part"
        ? "bg-amber-50 text-amber-500 ring-1 ring-amber-200"
        : "bg-red-50 text-red-500 ring-1 ring-red-100";
  return (
    <span className={`inline-grid h-7 w-7 place-items-center rounded-full ${look}`}>
      {mark === "yes" ? <CheckIcon size={15} /> : mark === "part" ? <Half /> : <CloseIcon size={13} />}
      <span className="sr-only">{mark === "yes" ? "Yes" : mark === "part" ? "Partly, or by hand" : "No"}</span>
    </span>
  );
}

const TABLE = "w-full min-w-[620px] border-collapse text-left md:min-w-[820px]";

/** What goes inside one product's table: its caption, the products across the top and a row per point. */
function Contents({ table }: { table: Table }) {
  return (
    <>
      <caption className="sr-only">{`${table.coere} compared with ${table.others.join(", ")}`}</caption>
      <thead>
        <tr>
          <th scope="col" className="sticky left-0 z-10 w-[160px] bg-white px-4 pt-8 pb-5 md:w-[30%] md:px-8" />
          <th scope="col" className="rounded-t-2xl bg-brand-50 px-4 pt-8 pb-5 text-center">
            <span className="block text-[14px] font-medium text-brand-600 md:text-[16px]">{table.coere}</span>
          </th>
          {table.others.map((name) => (
            <th key={name} scope="col" className="px-3 pt-8 pb-5 text-center align-top text-[13px] font-medium text-neutral-500 md:px-4 md:text-[15px]">
              {name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row, r) => (
          <tr key={row.name} className="border-t border-neutral-100">
            <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-5 font-normal md:px-8">
              <span className="block text-[14px] font-medium text-neutral-950 md:text-[16px]">{row.name}</span>
              <span className="mt-0.5 hidden text-[14px] leading-snug text-neutral-500 sm:block">{row.detail}</span>
            </th>
            {row.marks.map((mark, i) => (
              <td key={i} className={`px-4 py-5 text-center ${i === 0 ? `bg-brand-50 ${r === table.rows.length - 1 ? "rounded-b-2xl" : ""}` : ""}`}>
                <Cell mark={mark} coere={i === 0} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </>
  );
}

/**
 * How Coere compares: one table per product, picked from a row of pills,
 * against the products people use for the same job, with ChatGPT and
 * Claude's own memory as the baseline.
 * Every table is in the page, so all of them can be read and found; the
 * ones not picked are hidden until their pill is.
 */
export function CompareTable({ id = "compare" }: { id?: string }) {
  const [picked, setPicked] = useState(compareTables[0].key);
  const table = compareTables.find((t) => t.key === picked) ?? compareTables[0];

  return (
    <section id={id} className="scroll-mt-24 pb-28 md:pb-36">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[15px] font-medium text-brand-500">How Coere compares</p>
          <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-[3.5rem] md:leading-[1.04]">One memory that knows you everywhere</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">Each AI remembers only what you told it. Coere knows you on day one, in every AI, and acts on it.</p>
        </div>

        <div role="tablist" aria-label="Compare a product" className="mx-auto mt-12 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-neutral-100 p-1.5">
          {compareTables.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={t.key === table.key}
              onClick={() => setPicked(t.key)}
              className={`h-11 shrink-0 rounded-full px-5 text-[15px] transition-colors ${t.key === table.key ? "bg-neutral-950 text-white" : "text-neutral-700 hover:text-neutral-950"}`}
            >
              <span className="sm:hidden">{t.label.replace("Coere ", "")}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* relative: the marks' screen reader words are absolutely placed, and must stay inside this scroller, not widen the page on a phone. */}
        <div className="relative mt-10 overflow-x-auto rounded-3xl bg-white ring-1 ring-neutral-200 shadow-[0_40px_100px_-50px_rgba(0,0,0,0.3)]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.table key={table.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className={TABLE}>
              <Contents table={table} />
            </motion.table>
          </AnimatePresence>
          {compareTables
            .filter((t) => t.key !== table.key)
            .map((t) => (
              <table key={t.key} hidden className={TABLE}>
                <Contents table={t} />
              </table>
            ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-neutral-500">
          <span className="inline-flex items-center gap-2"><Cell mark="yes" /> Yes</span>
          <span className="inline-flex items-center gap-2"><Cell mark="part" /> Partly, or by hand</span>
          <span className="inline-flex items-center gap-2"><Cell mark="no" /> No</span>
          <span>From each product&apos;s public features, November 2026.</span>
        </div>
      </Container>
    </section>
  );
}
