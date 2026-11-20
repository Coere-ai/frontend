"use client";

import Link from "@/site/i18n/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import { SIGNED_IN_COOKIE } from "@/lib/supabase/cookie-options";
import { SignOutForm } from "@/site/account/sign-out-form";
import { buttonClass } from "@/site/ui/button";
import { useMessages } from "@/site/i18n/client";

/**
 * The navbar's Log in link, which says Dashboard once this browser is
 * signed in, with a plain Sign out beside it (the owner's report of
 * 2026-11-11: signing out was hard to find). Sign out signs Coere in this
 * browser out too (sign-out-form.tsx).
 *
 * Public pages are static, so the server cannot know who is looking. It
 * always renders Log in, and after hydration this reads the
 * `coere_signed_in` hint cookie. The hint grants nothing; a stale one only
 * means the dashboard asks the person to sign in.
 */

const HINT = new RegExp(`(?:^|;\\s*)${SIGNED_IN_COOKIE}=1(?:;|$)`);

/** Signing in or out in another tab shows when this one comes back into view. */
function subscribe(onChange: () => void): () => void {
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

const readHint = () => HINT.test(document.cookie);
const serverHint = () => false;

/** The glass navbar's quiet text button, squarer than the site's pills to match the bar. */
const NAV_LOOK =
  "inline-flex h-10 items-center justify-center rounded-[10px] px-3 text-[14px] font-medium whitespace-nowrap text-neutral-800 transition-colors hover:bg-neutral-950/[0.05] group-data-[tone=dark]/nav:text-white/85 group-data-[tone=dark]/nav:hover:bg-white/10 group-data-[tone=dark]/nav:hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";

/** The same, full width and taller, under Start for free in the phone menu: dark glass with a light line. */
const PANEL_LOOK =
  "inline-flex h-[52px] w-full items-center justify-center rounded-[14px] bg-white/[0.06] text-[16px] font-medium text-white ring-1 ring-white/20 transition-colors hover:bg-white/10 hover:ring-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";

const LOOKS = { nav: NAV_LOOK, panel: PANEL_LOOK };

export function AccountLink({ variant, className = "", onNavigate }: { variant: "secondary" | "ghost" | "nav" | "panel"; className?: string; onNavigate?: () => void }) {
  // Read for its re-render: a sign in or out ends in a navigation, and each render reads the cookie again.
  usePathname();
  const signedIn = useSyncExternalStore(subscribe, readHint, serverHint);
  const t = useMessages("chrome").nav;
  const look = variant === "nav" || variant === "panel" ? `${LOOKS[variant]} ${className}` : buttonClass(variant, className);
  const link = (
    <Link href={signedIn ? "/dashboard" : "/sign-in"} onClick={onNavigate} className={look}>
      {signedIn ? t.dashboard : t.logIn}
    </Link>
  );
  if (!signedIn) return link;
  return (
    <>
      {link}
      <SignOutForm next="/sign-in">
        <button type="submit" onClick={onNavigate} className={look}>
          {t.signOut}
        </button>
      </SignOutForm>
    </>
  );
}
