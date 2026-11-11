"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import { SIGNED_IN_COOKIE } from "@/lib/supabase/cookie-options";
import { SignOutForm } from "@/site/account/sign-out-form";
import { buttonClass } from "@/site/ui/button";

/**
 * The navbar's Sign in button, which says Dashboard once this browser is
 * signed in, with a plain Sign out beside it (the owner's report of
 * 2026-11-11: signing out was hard to find). Sign out signs Coere in this
 * browser out too (sign-out-form.tsx).
 *
 * Public pages are static, so the server cannot know who is looking. It
 * always renders Sign in, and after hydration this reads the
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

export function AccountLink({ variant, className = "", onNavigate }: { variant: "secondary" | "ghost"; className?: string; onNavigate?: () => void }) {
  // Read for its re-render: a sign in or out ends in a navigation, and each render reads the cookie again.
  usePathname();
  const signedIn = useSyncExternalStore(subscribe, readHint, serverHint);
  const link = (
    <Link href={signedIn ? "/dashboard" : "/sign-in"} onClick={onNavigate} className={buttonClass(variant, className)}>
      {signedIn ? "Dashboard" : "Sign in"}
    </Link>
  );
  if (!signedIn) return link;
  return (
    <>
      {link}
      <SignOutForm next="/sign-in">
        <button type="submit" onClick={onNavigate} className={buttonClass(variant, className)}>
          Sign out
        </button>
      </SignOutForm>
    </>
  );
}
