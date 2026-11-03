import { signOut } from "@/lib/auth/sign-out";
import { buttonClass } from "@/site/ui/button";

/** A Sign out button: a form posting to the sign out action, so it works before scripts load. */
export function SignOutButton({ variant = "secondary", className = "" }: { variant?: "primary" | "secondary" | "ghost"; className?: string }) {
  return (
    <form action={signOut}>
      <button type="submit" className={buttonClass(variant, className)}>
        Sign out
      </button>
    </form>
  );
}
