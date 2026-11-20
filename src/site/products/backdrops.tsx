"use client";

import GradientASCII from "@/site/bits/GradientAscii";
import Iridescence from "@/site/bits/Iridescence";

/**
 * Coere Connect's backdrop: Iridescence turned to Coere blue and white.
 * The tint pulls the shader's own rainbow toward blue, the brightness
 * pushes most of it to white, and a white wash on the left keeps the
 * words readable. It runs at half resolution, since the hero's beam is a
 * second canvas on the same screen.
 */
export function ConnectBackdrop() {
  return (
    <div className="absolute inset-0 bg-white">
      <Iridescence color={[0.36, 0.44, 1]} brightness={1.9} saturation={0.55} contrast={0.85} hueShift={-0.2} speed={0.35} amplitude={0.06} stir={0.3} sheen={0.2} clickSwirl={false} opacity={0.7} resolution={0.5} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/30 to-white/80 lg:bg-gradient-to-r lg:from-white/90 lg:via-white/55 lg:to-white/10" />
    </div>
  );
}

/**
 * Coere Forge's backdrop: GradientASCII in near black, Coere blue and
 * white, on its rising shape, so a horizon of glyphs glows up from the
 * foot of the hero behind the code. A dark wash on the left keeps the
 * words readable.
 */
export function ForgeBackdrop() {
  return (
    <div className="absolute inset-0 bg-[#14110f]">
      {/* Wider than the hero and shifted right on wide screens, so the dome of glyphs rises under the code. */}
      <div className="absolute inset-y-0 -right-[20%] -left-[20%] lg:-right-[25%] lg:left-[18%]">
        <GradientASCII colors={["#14110f", "#3f4ceb", "#5267f7", "#ffffff"]} shape="rise" scale={0.5} cellSize={14} glyphOpacity={0.9} glow={0.35} flow={0.35} speed={0.7} grain={0.05} scrambleRadius={0.08} clickEffect="none" intro={false} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#14110f]/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#14110f]/80 lg:via-[#14110f]/30 lg:to-transparent" />
    </div>
  );
}
