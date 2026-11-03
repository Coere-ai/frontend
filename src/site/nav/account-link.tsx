"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import { SIGNED_IN_COOKIE } from "@/lib/supabase/cookie-options";
import { buttonClass } from "@/site/ui/button";

/**
 * The navbar's Sign in button, which says Dashboard once this browser is
 * signed in.
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
  return (
    <Link href={signedIn ? "/dashboard" : "/sign-in"} onClick={onNavigate} className={buttonClass(variant, className)}>
      {signedIn ? "Dashboard" : "Sign in"}
    </Link>
  );
}
