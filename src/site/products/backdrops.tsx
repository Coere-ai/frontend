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
 * Coere Forge's backdrop: GradientASCII in white, Coere blue and near
 * black, on its rising shape, as a horizon along the foot of the hero.
 * The hero leaves room for it (`footRoom`), so the words stay on white.
 */
export function ForgeBackdrop() {
  return (
    <div className="absolute inset-0 bg-white">
      {/* A horizon along the foot of the hero, under the code and below the words, fading in from white. */}
      <div className="absolute inset-x-0 bottom-0 h-[50%] [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_80%,transparent)]">
        <GradientASCII colors={["#14110f", "#3f4ceb", "#5267f7", "#ffffff"]} shape="rise" lightMode scale={1.45} cellSize={14} flow={0.35} speed={0.7} grain={0.04} scrambleRadius={0.08} clickEffect="none" />
      </div>
    </div>
  );
}
