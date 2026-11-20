"use client";

import GradientASCII from "@/site/bits/GradientAscii";
import { DitherWave } from "@/site/art/dither-wave";

/**
 * Coere Connect's backdrop: Dither Wave full bleed behind the whole hero,
 * its bands of square pixels in Coere blue and white on near black. A soft
 * dark shade sits only behind the words, from the left on a laptop and
 * from the top on a phone, which stacks them, so the copy reads while the
 * bands stay bright round it.
 */
export function ConnectBackdrop() {
  return (
    <div className="absolute inset-0 bg-[#0b0a12]">
      <DitherWave />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,18,0.5),rgba(11,10,18,0.8)_20%,rgba(11,10,18,0.76)_68%,rgba(11,10,18,0.3)_86%,transparent)] lg:bg-[radial-gradient(ellipse_42%_56%_at_20%_52%,rgba(11,10,18,0.94),rgba(11,10,18,0.8)_45%,rgba(11,10,18,0.5)_65%,transparent_88%)]" />
    </div>
  );
}

/**
 * Coere Forge's backdrop: React Bits GradientASCII as the demo draws it,
 * full bleed behind the whole hero: its horizon of light over a dark curve,
 * at the demo's own cell size, density, glow, flicker, flow and grain,
 * with the colours moved from cyan to Coere blue and white. A soft dark
 * shade from the left keeps the words readable; a phone, which stacks the
 * words, gets it from the top.
 */
export function ForgeBackdrop() {
  return (
    <div className="absolute inset-0 bg-[#0b0a12]">
      <GradientASCII colors={["#2b3be0", "#f6f8ff", "#bcc5ff", "#6b7dfa"]} shape="horizon" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,18,0.6),rgba(11,10,18,0.82)_25%,rgba(11,10,18,0.78)_65%,rgba(11,10,18,0.35))] lg:bg-[radial-gradient(ellipse_58%_95%_at_16%_52%,rgba(11,10,18,0.88),rgba(11,10,18,0.6)_55%,transparent_88%)]" />
    </div>
  );
}
