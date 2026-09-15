"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "@/components/logo";
import { navLinks } from "@/lib/site";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-ink-900/6 bg-white/85 backdrop-blur-xl"
          : "border-transparent"
      }`}
    >
      {/* Three equal tracks keep the links optically centered on the page. */}
      <nav
        aria-label="Main"
        className="mx-auto grid h-16 w-full max-w-[86rem] grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8"
      >
        <a
          href="#what-we-do"
          aria-label="Coere home"
          className="justify-self-start rounded-md text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
        >
          <Logo />
        </a>

        <div className="hidden items-center gap-9 justify-self-center md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-ink-900/65 transition-colors hover:text-ink-900"
            >
              {link.label}
            </a>
          ))}
        </div>
        <span className="md:hidden" />

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="grid h-10 w-10 place-items-center justify-self-end rounded-xl border border-ink-900/10 text-ink-900/70 md:hidden"
        >
          <span className="sr-only">Toggle menu</span>
          <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
            <path
              d={menuOpen ? "M5 5l10 10M15 5 5 15" : "M3 6h14M3 13h14"}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden border-t border-ink-900/6 bg-white/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-5 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-2 py-2.5 text-sm text-ink-900/70"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
