"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";

export type PillTab<K extends string> = { key: K; label: ReactNode };

/** The id of the tab for `key` in the pills with this `id`. */
export const tabId = (id: string, key: string) => `${id}-tab-${key}`;

const SIZES = {
  md: { row: "p-1.5", tab: "h-11 px-5 text-[15px]" },
  sm: { row: "p-1", tab: "h-9 px-4 text-[14px]" },
};

/**
 * The site's row of pills on light grey, the picked one solid black, as
 * tabs: the picked pill is the one in the tab order, and the arrow keys,
 * Home and End move the pick, so a keyboard and a screen reader get the
 * same switch the mouse does. With `id`, each tab is `<id>-tab-<key>` and
 * controls the part with the id `<id>-panel`, which the caller gives
 * role="tabpanel" and labels with the picked tab (`tabId`).
 */
export function PillTabs<K extends string>({ label, tabs, picked, onPick, id, size = "md", className = "" }: { label: string; tabs: PillTab<K>[]; picked: K; onPick: (key: K) => void; id?: string; size?: keyof typeof SIZES; className?: string }) {
  const row = useRef<HTMLDivElement>(null);
  const look = SIZES[size];

  function onKeyDown(event: KeyboardEvent) {
    const at = tabs.findIndex((t) => t.key === picked);
    const to = event.key === "ArrowRight" ? at + 1 : event.key === "ArrowLeft" ? at - 1 : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
    if (to === null) return;
    event.preventDefault();
    const next = (to + tabs.length) % tabs.length;
    onPick(tabs[next].key);
    row.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }

  return (
    <div ref={row} role="tablist" aria-label={label} onKeyDown={onKeyDown} className={`mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-neutral-100 ${look.row} ${className}`}>
      {tabs.map((t) => {
        const on = t.key === picked;
        return (
          <button
            key={t.key}
            id={id ? tabId(id, t.key) : undefined}
            type="button"
            role="tab"
            aria-selected={on}
            aria-controls={id ? `${id}-panel` : undefined}
            tabIndex={on ? 0 : -1}
            onClick={() => onPick(t.key)}
            className={`shrink-0 rounded-full transition-colors ${look.tab} ${on ? "bg-neutral-950 text-white" : "text-neutral-700 hover:text-neutral-950"}`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
