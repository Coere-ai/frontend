import { spentLimit, type Spend } from "@/lib/v1/spend";

/**
 * Whether the person's AI use is paused, and until when (docs/accounts.md 7,
 * 8.10). The dashboard never shows a limit, a plan limit or a meter against
 * one: only while a limit is reached does it say so, in one plain line. The
 * rule is the gate's own (spentLimit), so the page cannot say paused when
 * the extension is not, or the other way round. Pure, so a test pins it.
 *
 * - `month`: the monthly limit, which starts again on the first of the month.
 * - `day`: a daily limit the operator set, which starts again at UTC midnight.
 * - `contact`: the lifetime limit or the first build allowance, which only
 *   the operator lifts.
 */
export type Pause = "month" | "day" | "contact";

export function pauseOf(s: Spend | null | undefined): Pause | null {
  if (!s) return null;
  const spent = spentLimit(s);
  if (spent === "monthly") return "month";
  if (spent === "daily") return "day";
  return spent === null ? null : "contact";
}

/** The one line the dashboard shows for each pause. `contact` ends with a link to the contact email. */
export const PAUSE_LINES: Record<Pause, string> = {
  month: "Your AI use is paused until next month.",
  day: "Your AI use is paused until tomorrow.",
  contact: "Your AI use is paused. Contact us to continue.",
};
