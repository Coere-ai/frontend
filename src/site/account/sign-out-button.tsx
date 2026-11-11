import { signOut } from "@/lib/auth/sign-out";
import { buttonClass } from "@/site/ui/button";
import { Underlined } from "@/site/ui/underlined";

import { textButtonClass } from "./auth-shell";
import { SignOutForm } from "./sign-out-form";

/**
 * A Sign out button: a form posting to the sign out action, so it works
 * before scripts load. `next` is where to go after, home by default. The
 * "text" look is the quiet one used under a card. With `coere`, Coere in
 * this browser is asked to disconnect first (sign-out-form.tsx); a button
 * that only signs in again as the same person, or picks another account to
 * connect, leaves it.
 */
export function SignOutButton({
  variant = "secondary",
  className = "",
  next,
  label = "Sign out",
  coere = false,
}: {
  variant?: "primary" | "secondary" | "ghost" | "text";
  className?: string;
  next?: string;
  label?: string;
  coere?: boolean;
}) {
  const button =
    variant === "text" ? (
      <button type="submit" className={`${textButtonClass} ${className}`}>
        <Underlined>{label}</Underlined>
      </button>
    ) : (
      <button type="submit" className={buttonClass(variant, className)}>
        {label}
      </button>
    );
  if (coere) return <SignOutForm next={next}>{button}</SignOutForm>;
  return (
    <form action={signOut}>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {button}
    </form>
  );
}
