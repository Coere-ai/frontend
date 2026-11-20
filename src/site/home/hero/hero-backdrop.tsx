"use client";

import MicroSlats from "@/site/bits/MicroSlats";

/**
 * The hero's moving field: React Bits MicroSlats in Coere's colours, blue
 * slats on white with near black where the light catches. It is slowed and
 * softened so it stays calm, and a white wash over the left and the bottom
 * keeps the heading and paragraph readable and lets the hero fade into the
 * page.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <MicroSlats
        preset="swell"
        color="#5267f7"
        glintColor="#14110f"
        backgroundColor="#ffffff"
        slatWidth={5}
        slatHeight={16}
        gap={3}
        speed={0.3}
        contrast={1.05}
        glint={1.1}
        fog={0.35}
        perspective={0.6}
        interactive={false}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_52%_62%_at_22%_55%,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.86)_45%,rgba(255,255,255,0)_100%)] max-lg:bg-[radial-gradient(ellipse_90%_45%_at_50%_30%,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.8)_55%,rgba(255,255,255,0)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-white/0 to-white" />
    </div>
  );
}
