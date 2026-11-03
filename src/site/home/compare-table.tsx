"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { compareTables, type Mark } from "@/site/content/compare";
import { Container } from "@/site/ui/container";
import { CheckIcon } from "@/site/ui/icons/interface-icons";

/** One mark, drawn so it reads at a glance and to a screen reader. */
function Cell({ mark, coere = false }: { mark: Mark; coere?: boolean }) {
  if (mark === "yes")
    return (
      <span className={`inline-grid h-7 w-7 place-items-center rounded-full ${coere ? "bg-brand-500 text-white" : "bg-neutral-950 text-white"}`}>
        <CheckIcon size={15} />
        <span className="sr-only">Yes</span>
      </span>
    );
  if (mark === "part")
    return (
      <span className="inline-block h-[18px] w-[18px] rounded-full border-2 border-neutral-400 bg-[linear-gradient(90deg,var(--color-neutral-400)_50%,transparent_50%)]">
        <span className="sr-only">Partly, or by hand</span>
      </span>
    );
  return (
    <span className="inline-block h-0.5 w-4 rounded-full bg-neutral-300">
      <span className="sr-only">No</span>
    </span>
  );
}

/**
 * How Coere compares: one table per product, picked from a row of pills,
 * against the products people use for the same job, with ChatGPT and
 * Claude's own memory as the baseline. Coere's column carries its price.
 */
export function CompareTable() {
  const [picked, setPicked] = useState(compareTables[0].key);
  const table = compareTables.find((t) => t.key === picked) ?? compareTables[0];

  return (
    <section id="compare" className="scroll-mt-24 pb-28 md:pb-36">
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

        <div className="mt-10 overflow-x-auto rounded-3xl bg-white ring-1 ring-neutral-200 shadow-[0_40px_100px_-50px_rgba(0,0,0,0.3)]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.table
              key={table.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full min-w-[620px] border-collapse text-left md:min-w-[820px]"
            >
              <caption className="sr-only">{`${table.coere} compared with ${table.others.join(", ")}`}</caption>
              <thead>
                <tr>
                  <th scope="col" className="sticky left-0 z-10 w-[160px] bg-white px-4 pt-8 pb-5 md:w-[30%] md:px-8" />
                  <th scope="col" className="rounded-t-2xl bg-brand-50 px-4 pt-8 pb-5 text-center">
                    <span className="block text-[14px] font-medium text-brand-600 md:text-[16px]">{table.coere}</span>
                    <span className="mt-1.5 inline-block rounded-full bg-white px-2.5 py-0.5 text-[12px] font-medium text-brand-600 ring-1 ring-brand-200">{table.price}</span>
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
            </motion.table>
          </AnimatePresence>
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
