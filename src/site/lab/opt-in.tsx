import { setLabOptIn } from "@/app/[lang]/(site)/lab/actions";
import { buttonClass } from "@/site/ui/button";

/** The early user opt in, changeable at any time, so a student who liked their Coere case can say so later. */
export function OptIn({ on }: { on: boolean }) {
  return (
    <form action={setLabOptIn} className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
      <p className="max-w-[48ch] text-[15px] text-white/70">
        {on ? "You are on the list of early Coere Connect users after the study." : "Want to keep using Coere Connect after the study? Join the early users."}
      </p>
      <input type="hidden" name="on" value={on ? "off" : "on"} />
      <button type="submit" className={buttonClass("secondary")}>
        {on ? "Take me off the list" : "Count me in"}
      </button>
    </form>
  );
}
