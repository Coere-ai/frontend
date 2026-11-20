"use client";

import GradientASCII from "@/site/bits/GradientAscii";
import Iridescence from "@/site/bits/Iridescence";

/**
 * Coere Connect's backdrop: React Bits Iridescence with every setting at
 * the demo's own default, only its tint moved to Coere blue, so the folds
 * run from deep Coere blue to white. A soft white glow sits only behind the
 * words, so the copy reads without washing out the rest.
 */
export function ConnectBackdrop() {
  return (
    <div className="absolute inset-0 bg-white">
      <Iridescence color={CONNECT_TINT} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_45%_at_50%_30%,rgba(255,255,255,0.78),rgba(255,255,255,0.45)_55%,transparent_80%)] lg:bg-[radial-gradient(ellipse_42%_55%_at_22%_52%,rgba(255,255,255,0.8),rgba(255,255,255,0.45)_55%,transparent_82%)]" />
    </div>
  );
}

/** The tint Iridescence multiplies over its colours: the demo's violet and cyan fold into Coere blue, and its whites stay white. */
const CONNECT_TINT: [number, number, number] = [0.36, 0.48, 1];

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
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,18,0.25),rgba(11,10,18,0.72)_30%,rgba(11,10,18,0.6)_60%,rgba(11,10,18,0.2))] lg:bg-[radial-gradient(ellipse_58%_95%_at_16%_52%,rgba(11,10,18,0.88),rgba(11,10,18,0.6)_55%,transparent_88%)]" />
    </div>
  );
}
