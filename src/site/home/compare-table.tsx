"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type CSSProperties } from "react";
import { backgrounds } from "@/site/content/backgrounds";
import { compareTables, type CompareTable as Table, type Mark } from "@/site/content/compare";
import { Container } from "@/site/ui/container";
import { CheckIcon, CloseIcon } from "@/site/ui/icons/interface-icons";
import { SizedPhoto } from "@/site/ui/sized-photo";

/** A half filled circle, for "partly". */
const Half = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <circle cx="9" cy="9" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M9 2a7 7 0 0 0 0 14z" fill="currentColor" />
  </svg>
);

/** One mark as a symbol in its colour: white on Coere's card, green, amber or red elsewhere. */
function Cell({ mark, coere = false }: { mark: Mark; coere?: boolean }) {
  const look = coere ? "text-white" : mark === "yes" ? "text-emerald-500" : mark === "part" ? "text-amber-500" : "text-red-400";
  return (
    <span className={`inline-grid h-6 w-6 place-items-center ${look}`}>
      {mark === "yes" ? <CheckIcon size={22} strokeWidth={2.4} /> : mark === "part" ? <Half /> : <CloseIcon size={18} strokeWidth={2.4} />}
      <span className="sr-only">{mark === "yes" ? "Yes" : mark === "part" ? "Partly, or by hand" : "No"}</span>
    </span>
  );
}

/**
 * Where a cell sits. Every cell is placed by hand, so Coere's card can span
 * its column underneath them. On a phone the board scrolls sideways and the
 * points stay pinned on white; on a wide screen they need neither.
 */
const at = (row: number, col: number): CSSProperties => ({ gridRow: row, gridColumn: col });

/**
 * One product's comparison as a grid: the points down the left, Coere's
 * column as a card of Coere's own artwork running the full height, and the
 * other products to its right, every column the same width. It keeps table
 * semantics for screen readers.
 */
function Board({ table }: { table: Table }) {
  const rows = table.rows.length;
  const cols = table.others.length + 1;
  return (
    <div role="table" aria-label={`${table.coere} compared with ${table.others.join(", ")}`} className="grid min-w-[600px] md:min-w-0" style={{ gridTemplateColumns: `minmax(170px, 1.6fr) repeat(${cols}, minmax(0, 1fr))` }}>
      {/* Coere's card, behind its column. */}
      <div aria-hidden="true" className="relative isolate -my-3 overflow-hidden rounded-[28px] bg-neutral-950 shadow-[0_30px_80px_-30px_rgba(63,76,235,0.65)]" style={{ gridRow: `1 / span ${rows + 1}`, gridColumn: 2 }}>
        <SizedPhoto src={backgrounds.flow.src} alt="" fill sizes="240px" className="-z-10 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-700/30 via-neutral-950/20 to-brand-700/40" />
      </div>

      <div role="row" className="contents">
        <span role="columnheader" className="sticky left-0 z-10 bg-white md:static md:bg-transparent" style={at(1, 1)} />
        <span role="columnheader" className="relative z-10 grid place-items-center px-3 pt-6 pb-5 text-center text-[15px] font-medium text-white md:text-[17px]" style={at(1, 2)}>
          {table.coere}
        </span>
        {table.others.map((name, i) => (
          <span key={name} role="columnheader" className="grid place-items-center px-3 pt-6 pb-5 text-center text-[13px] text-neutral-500 md:text-[15px]" style={at(1, i + 3)}>
            {name}
          </span>
        ))}
      </div>

      {table.rows.map((row, r) => (
        <div key={row.name} role="row" className="contents">
          <span role="rowheader" className="sticky left-0 z-10 border-t border-neutral-100 bg-white py-5 pr-6 md:static md:bg-transparent" style={at(r + 2, 1)}>
            <span className="block text-[15px] font-medium tracking-[-0.01em] text-neutral-950 md:text-[17px]">{row.name}</span>
            <span className="mt-1 hidden text-[14px] leading-snug text-neutral-500 sm:block">{row.detail}</span>
          </span>
          {row.marks.map((mark, i) => (
            <span key={i} role="cell" className={`relative z-10 grid place-items-center border-t py-5 ${i === 0 ? "border-white/15" : "border-neutral-100"}`} style={at(r + 2, i + 2)}>
              <Cell mark={mark} coere={i === 0} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * How Coere compares: one board per product, picked from a row of pills,
 * against the products people use for the same job, with ChatGPT and
 * Claude's own memory as the baseline. Every board is in the page, so all
 * of them can be read and found; the ones not picked stay hidden until
 * their pill is.
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
        <div className="relative mx-auto mt-14 max-w-6xl overflow-x-auto py-3">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={table.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <Board table={table} />
            </motion.div>
          </AnimatePresence>
          {compareTables
            .filter((t) => t.key !== table.key)
            .map((t) => (
              <div key={t.key} hidden>
                <Board table={t} />
              </div>
            ))}
        </div>
      </Container>
    </section>
  );
}
