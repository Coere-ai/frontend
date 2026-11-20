/**
 * The home page's shared look, so every part below the hero reads as one
 * design with it: one card style (white, a hairline ring and a soft blue
 * tinted shadow), one large radius and one rhythm of space between parts.
 * Each piece carries its dark look too, for a page in the dark theme (see
 * DarkPage): flat glass a few shades over the near black, a fine light
 * ring and no shadow.
 */

/** The space above and below each part of the page. */
export const SECTION_Y = "py-24 md:py-32";

/** A soft white card, the base of every panel. */
export const SOFT_CARD =
  "rounded-[28px] bg-white ring-1 ring-neutral-950/[0.06] shadow-[0_1px_2px_rgba(20,17,15,0.04),0_28px_70px_-34px_rgba(23,27,77,0.28)] dark:bg-white/[0.045] dark:shadow-none dark:ring-white/10";

/** The pale field some parts sit on, a shade off white with the same radius. */
export const SOFT_FIELD = "rounded-[28px] bg-[#f5f6fb] ring-1 ring-neutral-950/[0.04] dark:bg-white/[0.025] dark:ring-white/[0.08]";

/** A part's title, in the hero heading's heavy, tight weight but smaller. */
export const SECTION_TITLE = "text-4xl font-semibold tracking-[-0.04em] text-neutral-950 text-balance md:text-[3.25rem] md:leading-[1.04] dark:text-white";
