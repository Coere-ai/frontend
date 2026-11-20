"use client";

import MicroSlats from "@/site/bits/MicroSlats";

/** The hero's near black, which the page's overscroll colour matches too. */
export const HERO_INK = "#0b0a12";

/**
 * The hero's moving field: React Bits MicroSlats exactly as its demo sets
 * it up (the swell preset, 10 by 25 px slats, a 3 px gap, the cursor
 * stirring the water and the slats rolling in from the horizon on load),
 * with only its colours changed: Coere blue slats with white glints on
 * near black instead of violet on black. A soft dark shade behind the
 * words keeps the heading and paragraph readable.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: HERO_INK }}>
      <MicroSlats color="#5267f7" glintColor="#ffffff" backgroundColor={HERO_INK} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,18,0.3),rgba(11,10,18,0.66)_22%,rgba(11,10,18,0.58)_62%,rgba(11,10,18,0.2))] lg:bg-[radial-gradient(ellipse_52%_72%_at_22%_56%,rgba(11,10,18,0.74),rgba(11,10,18,0.36)_55%,rgba(11,10,18,0)_85%)]" />
      {/* The slats fade into the page's near black at the hero's foot, so the next section follows with no hard edge. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(to_bottom,rgba(11,10,18,0),#0b0a12)] md:h-72" />
    </div>
  );
}
