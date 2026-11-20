"use client";

import Link from "next/link";
import { useState, type FocusEvent } from "react";
import GlassSurface from "@/site/bits/GlassSurface";
import { navTabs, startHref, startLabel } from "@/site/content/navigation";
import { CloseIcon, MenuIcon } from "@/site/ui/icons/interface-icons";
import { SoftLink } from "@/site/ui/soft-button";
import { AccountLink } from "./account-link";
import { BrandLockup } from "./brand-lockup";
import { LanguageMenu } from "./language-menu";
import { MegaPanel, MenuBackdrop } from "./mega-panel";
import { MobileMenu } from "./mobile-menu";
import { NavTab } from "./nav-tab";
import { NAV_BAR_HEIGHT } from "./nav-space";
import { useMenu } from "./use-menu";
import { useNavTone } from "./use-nav-tone";

/**
 * The navbar: a floating bar of glass with soft square corners, inset from
 * the page edges and stuck to the top, so what scrolls under it bends at
 * its rim. The brand and the tabs sit on the left; the language, Log in and
 * Start for free on the right. A light white tint inside the glass keeps
 * the words readable over white pages and over the hero's animation. On a
 * dark page, which every page of the site now is, the glass turns dark and
 * the words white (see use-nav-tone).
 */
export function Navbar() {
  const menu = useMenu();
  const tone = useNavTone();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Focus leaving the whole header closes the menu, for keyboard users.
  function onBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) menu.close();
  }

  return (
    <header data-tone={tone} className="group/nav sticky top-0 z-50 px-3 pt-3 sm:px-4 md:px-6" onMouseLeave={() => menu.hide()} onBlur={onBlur}>
      <div className="relative mx-auto max-w-[1392px]">
        <GlassSurface
          width="100%"
          height={NAV_BAR_HEIGHT}
          borderRadius={18}
          backgroundOpacity={0.62}
          saturation={1.5}
          brightness={52}
          opacity={0.9}
          blur={10}
          displace={0.5}
          distortionScale={-80}
          redOffset={0}
          greenOffset={2}
          blueOffset={4}
          // A fine light edge and a soft drop shadow in place of the glass's own grey inner rim.
          className={
            tone === "dark"
              ? "bg-[rgba(14,14,28,0.5)]! shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),inset_0_1px_0_rgba(255,255,255,0.18),0_12px_32px_-14px_rgba(0,0,0,0.6)]! transition-[background-color,box-shadow] duration-300"
              : "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.75),inset_0_1px_0_rgba(255,255,255,0.9),0_0_0_1px_rgba(20,17,15,0.06),0_12px_32px_-14px_rgba(20,17,15,0.2)]! transition-[background-color,box-shadow] duration-300"
          }
        >
          <div className="flex w-full items-center justify-between gap-4 pr-1 pl-3">
            <div className="flex items-center gap-6 xl:gap-8">
              <Link href="/" aria-label="Coere home" onMouseEnter={() => menu.hide(0)} className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500">
                <BrandLockup />
              </Link>
              <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
                {navTabs.map((tab) => (
                  <NavTab key={tab.id} label={tab.label} href={tab.href} active={menu.open === tab.id} onOpen={() => menu.show(tab.id)} />
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-1" onMouseEnter={() => menu.hide(0)}>
              {/* Wrapped, because the links' own display classes would beat "hidden". */}
              <span className="hidden lg:flex lg:items-center lg:gap-1">
                <LanguageMenu />
                <AccountLink variant="nav" />
              </span>
              <span className="hidden sm:block">
                <SoftLink href={startHref} className="ml-1">
                  {startLabel}
                </SoftLink>
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className="grid h-10 w-10 place-items-center rounded-[10px] text-neutral-950 transition-colors hover:bg-neutral-950/[0.05] group-data-[tone=dark]/nav:text-white group-data-[tone=dark]/nav:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-brand-500 lg:hidden"
              >
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </GlassSurface>

        <MegaPanel open={menu.open} onEnter={menu.cancel} onLeave={() => menu.hide()} onNavigate={menu.close} />
      </div>
      <MenuBackdrop visible={menu.open !== null} onClose={menu.close} />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
