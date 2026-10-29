"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "./icons/interface-icons";
import { Underlined } from "./underlined";

/**
 * A dropdown in the site's own style instead of the browser's select: a
 * rounded field with its chevron set inside the right edge, and a list
 * that opens below it. Arrow keys move through the options, Enter or a
 * click picks one, and Escape or a click outside closes it.
 */
export function SelectMenu({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const show = () => {
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  };
  const pick = (option: string) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div ref={root} className="relative">
      <span id={`${id}-label`} className="text-[13px] font-medium text-neutral-500">
        {label}
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) return show();
            setActive((i) => (i + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
          } else if (event.key === "Enter" && open) {
            event.preventDefault();
            pick(options[active]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        className={`relative mt-2 flex h-11 w-full items-center rounded-xl border bg-white pr-11 pl-4 text-left text-[15px] text-neutral-950 outline-none ${open ? "border-neutral-950" : "border-neutral-200 focus-visible:border-neutral-950"}`}
      >
        <span id={`${id}-value`} className="truncate">
          {value}
        </span>
        <ChevronDownIcon size={18} className={`absolute top-1/2 right-4 -translate-y-1/2 text-neutral-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <ul role="listbox" aria-labelledby={`${id}-label`} className="absolute inset-x-0 top-full z-20 mt-2 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]">
          {options.map((option, index) => (
            <li
              key={option}
              role="option"
              aria-selected={option === value}
              onPointerEnter={() => setActive(index)}
              onClick={() => pick(option)}
              className="group flex cursor-pointer items-center justify-between px-3 py-2 text-[15px] text-neutral-800"
            >
              <Underlined on={index === active}>{option}</Underlined>
              {option === value ? <CheckIcon size={16} className="text-neutral-950" /> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
