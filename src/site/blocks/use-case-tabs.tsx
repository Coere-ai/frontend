"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowLink } from "@/site/ui/arrow-link";
import { CheckList } from "./check-list";

export type UseCase = { key: string; label: string; title: string; text: string; checks?: string[]; href?: string; linkLabel?: string; visual: ReactNode };

/**
 * One use case at a time, picked from a row of pills: the words on the
 * left, its demo on the right. Only the picked case's demo is mounted, so a
 * page of films loads one at a time.
 *
 * Each case's key is also an anchor: a link to #import scrolls here and
 * opens that case, until a pill is clicked.
 */
export function UseCaseTabs({ cases }: { cases: UseCase[] }) {
  const [picked, setPicked] = useState<string | null>(null);
  const hash = useSyncExternalStore(onHashChange, () => window.location.hash.slice(1), () => "");
  const active = cases.find((c) => c.key === (picked ?? hash)) ?? cases[0];

  return (
    <div>
      {cases.map((c) => (
        <span key={c.key} id={c.key} aria-hidden="true" className="block scroll-mt-32" />
      ))}
      <div role="tablist" aria-label="Use cases" className="mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-neutral-100 p-1.5">
        {cases.map((c) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            aria-selected={c.key === active.key}
            onClick={() => setPicked(c.key)}
            className={`h-11 shrink-0 rounded-full px-5 text-[15px] transition-colors ${c.key === active.key ? "bg-neutral-950 text-white" : "text-neutral-700 hover:text-neutral-950"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Every case's words are in the page, so all of them can be read and found; only the picked one shows, and only its demo is mounted. */}
      {cases.map((c) => {
        const on = c.key === active.key;
        return (
          <div key={c.key} role="tabpanel" aria-label={c.label} hidden={!on} className="mt-16 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-20">
            <div>
              <h3 className="text-3xl font-medium tracking-[-0.03em] text-neutral-950 text-balance">{c.title}</h3>
              <p className="mt-4 text-[17px] leading-relaxed text-neutral-600">{c.text}</p>
              {c.checks ? <CheckList items={c.checks} className="mt-7" /> : null}
              {c.href ? <ArrowLink href={c.href} className="mt-7 text-neutral-950">{c.linkLabel ?? "Learn more"}</ArrowLink> : null}
            </div>
            {on ? <div className="overflow-hidden rounded-2xl border border-neutral-200">{c.visual}</div> : null}
          </div>
        );
      })}
    </div>
  );
}

function onHashChange(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}
