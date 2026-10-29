"use client";

import Link from "next/link";
import { useEffect, useState, type FocusEvent } from "react";
import { contactHref, navTabs } from "@/site/content/navigation";
import { Brand } from "@/site/ui/brand";
import { ButtonLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";
import { CloseIcon, MenuIcon } from "@/site/ui/icons/interface-icons";
import { MegaPanel, MenuBackdrop } from "./mega-panel";
import { MobileMenu } from "./mobile-menu";
import { NavTab } from "./nav-tab";
import { useMenu } from "./use-menu";

/**
 * The white navbar: the brand on the left, the tabs centered on the page, and
 * Talk to Us on the right. Three equal grid tracks keep the tabs truly
 * centered whatever the brand and button widths are.
 */
export function Navbar() {
  const menu = useMenu();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Focus leaving the whole header closes the menu, for keyboard users.
  function onBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) menu.close();
  }

  const lined = scrolled || menu.open !== null || mobileOpen;

  return (
    <header className="sticky top-0 z-50 bg-white" onMouseLeave={() => menu.hide()} onBlur={onBlur}>
      <div className={`border-b transition-colors duration-300 ${lined ? "border-neutral-200" : "border-transparent"}`}>
        <Container className="grid h-[72px] grid-cols-[1fr_auto_1fr] items-center">
          <Link href="/" aria-label="Coere home" onMouseEnter={() => menu.hide(0)} className="justify-self-start rounded-md">
            <Brand />
          </Link>

          <nav aria-label="Main" className="hidden items-center lg:flex">
            {navTabs.map((tab) => (
              <NavTab
                key={tab.id}
                label={tab.label}
                href={tab.href}
                active={menu.open === tab.id}
                onOpen={() => menu.show(tab.id)}
              />
            ))}
          </nav>

          <div className="col-start-3 flex items-center gap-2 justify-self-end" onMouseEnter={() => menu.hide(0)}>
            {/* Wrapped, because the button's own display class would beat "hidden". */}
            <span className="hidden lg:block">
              <ButtonLink href={contactHref}>Talk to Us</ButtonLink>
            </span>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="grid h-11 w-11 place-items-center rounded-full text-neutral-950 lg:hidden"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </Container>
      </div>

      <MegaPanel open={menu.open} onEnter={menu.cancel} onLeave={() => menu.hide()} onNavigate={menu.close} />
      <MenuBackdrop visible={menu.open !== null} onClose={menu.close} />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
