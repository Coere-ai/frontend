import { signOut } from "@/lib/auth/sign-out";
import { buttonClass } from "@/site/ui/button";
import { Underlined } from "@/site/ui/underlined";

import { textButtonClass } from "./auth-shell";

/**
 * A Sign out button: a form posting to the sign out action, so it works
 * before scripts load. `next` is where to go after, home by default. The
 * "text" look is the quiet one used under a card.
 */
export function SignOutButton({
  variant = "secondary",
  className = "",
  next,
  label = "Sign out",
}: {
  variant?: "primary" | "secondary" | "ghost" | "text";
  className?: string;
  next?: string;
  label?: string;
}) {
  return (
    <form action={signOut}>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {variant === "text" ? (
        <button type="submit" className={`${textButtonClass} ${className}`}>
          <Underlined>{label}</Underlined>
        </button>
      ) : (
        <button type="submit" className={buttonClass(variant, className)}>
          {label}
        </button>
      )}
    </form>
  );
}
