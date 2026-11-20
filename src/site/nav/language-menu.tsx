"use client";

import { motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconProps } from "@/site/ui/icons/icon";
import { CheckIcon, ChevronDownIcon } from "@/site/ui/icons/interface-icons";

/**
 * The languages the site is written in. Only English exists today, so the
 * menu lists only English. A new language adds a row here with the path its
 * pages live under, and the menu offers it.
 */
export const languages = [{ code: "en", label: "English", href: "/" }] as const;

type Language = (typeof languages)[number];

const GlobeIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5s1.1-6.1 3.4-8.5Z" />
  </Icon>
);

/**
 * The navbar's language picker: a globe and the language's name, opening a
 * small menu of the languages above with the current one checked. Escape, a
 * click outside or a scroll closes it. The menu is drawn on the page's body
 * under the button, since the glass bar clips whatever overflows it.
 */
export function LanguageMenu({ current = languages[0] }: { current?: Language }) {
  const [place, setPlace] = useState<{ top: number; right: number } | null>(null);
  const open = place !== null;
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();

  function toggle() {
    const box = button.current?.getBoundingClientRect();
    setPlace(open || !box ? null : { top: box.bottom + 8, right: Math.max(12, window.innerWidth - box.right) });
  }
  const close = () => setPlace(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menu.current?.contains(target) && !button.current?.contains(target)) close();
    };
    const onScroll = () => close();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      close();
      button.current?.focus();
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // The checked language takes focus, as a menu's first stop.
    menu.current?.querySelector<HTMLElement>("[aria-checked='true']")?.focus();
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Language: ${current.label}`}
        onClick={toggle}
        className="flex h-10 items-center gap-1.5 rounded-[10px] px-2.5 text-[14px] font-medium text-neutral-800 transition-colors hover:bg-neutral-950/[0.05] group-data-[tone=dark]/nav:text-white/85 group-data-[tone=dark]/nav:hover:bg-white/10 group-data-[tone=dark]/nav:hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        <GlobeIcon size={17} />
        {current.label}
        <ChevronDownIcon size={14} className={`text-neutral-500 transition-transform group-data-[tone=dark]/nav:text-white/60 ${open ? "rotate-180" : ""}`} />
      </button>
      {/* Only while open, so the server and the first client render agree. */}
      {place
        ? createPortal(
            <motion.div
              ref={menu}
              id={menuId}
              style={{ top: place.top, right: place.right }}
              role="menu"
              aria-label="Language"
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.16 }}
              className="fixed z-[60] w-48 origin-top-right rounded-2xl border border-neutral-200/80 bg-white p-1.5 shadow-[0_20px_50px_-20px_rgba(20,17,15,0.3)]"
            >
              {languages.map((language) => (
                <a
                  key={language.code}
                  href={language.href}
                  role="menuitemradio"
                  aria-checked={language.code === current.code}
                  lang={language.code}
                  onClick={(event) => {
                    // The page is already in this language, so picking it only closes the menu.
                    if (language.code === current.code) event.preventDefault();
                    close();
                  }}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[14px] text-neutral-900 outline-none hover:bg-neutral-100 focus-visible:bg-neutral-100"
                >
                  {language.label}
                  {language.code === current.code ? <CheckIcon size={16} className="text-brand-500" /> : null}
                </a>
              ))}
            </motion.div>,
            document.body,
          )
        : null}
    </div>
  );
}
