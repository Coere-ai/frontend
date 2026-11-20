"use client";

import { type CSSProperties, useEffect, useRef } from "react";
import { link } from "./pixel-matrix/gl";
import { LIQUID_PALETTES, type LiquidLinesPalette, type LiquidLinesPaletteName, shaderPalette } from "./liquid-lines/palette";
import { LIQUID_FRAG } from "./liquid-lines/shader";
import { FULL_VERT, fullTriangle, mountStage } from "./stage/stage";

export type { LiquidLinesPalette } from "./liquid-lines/palette";

export type LiquidLinesProps = {
  /** "coere" (white, Coere blue, a touch of cyan), "prism" (white with a blue and amber edge), or colors of your own. */
  palette?: LiquidLinesPaletteName | LiquidLinesPalette;
  /** The slant of the streaks in degrees, up from the horizontal. */
  angle?: number;
  /** 0 holds a still frame, 1 is the default flow. */
  speed?: number;
  /** Share of streaks, 1 the default, 0.5 sparse, 1.5 busy. */
  density?: number;
  /** How far the colored edges split from the core, 0 none and 1 the default. */
  fringe?: number;
  /** Overall light, 1 the default. */
  exposure?: number;
  /** Plays the intro once when it first starts: the streaks shoot in from off screen as the field brightens from black. Skipped under reduced motion. */
  intro?: boolean;
  className?: string;
};

/** A CSS picture of the scene for the server and the moment before WebGL starts: a few soft diagonal streaks on near black. */
function stillBackground(p: LiquidLinesPalette, angle: number): string {
  const deg = 90 - angle;
  return [
    `repeating-linear-gradient(${deg}deg, transparent 0 9%, ${p.cool}14 10%, transparent 11% 23%, #ffffff10 23.4%, transparent 24% 37%)`,
    `linear-gradient(${deg}deg, transparent 30%, ${p.glow}1f 48%, transparent 66%)`,
    p.background,
  ].join(",");
}

/**
 * Long diagonal streaks of light on near black, flowing along the
 * diagonal like a liquid: thin bright cores with a soft bloom, some
 * sharp, some out of focus, and a few wide soft bands far behind, each
 * edged with a cool and a warm tint. Drawn in one WebGL pass (see
 * liquid-lines/shader.ts).
 *
 * It shows a still CSS version on the server and until WebGL starts,
 * holds one frame under reduced motion, pauses off screen and in a hidden
 * tab, draws at a capped pixel ratio (and skips the faintest layer on a
 * phone), and frees its context when it unmounts.
 *
 * With `intro` it starts on plain black and plays the intro once per
 * mount, over about two seconds. The intro runs on the stage's clock,
 * which stops off screen and in a hidden tab, so coming back never plays
 * it again. Under reduced motion the CSS picture shows at once and the
 * settled still frame follows.
 */
export function LiquidLines({ palette = "coere", angle = 45, speed = 1, density = 1, fringe = 1, exposure = 1, intro = true, className = "" }: LiquidLinesProps) {
  const host = useRef<HTMLDivElement>(null);
  const colors = typeof palette === "string" ? LIQUID_PALETTES[palette] : palette;
  const paletteKey = JSON.stringify(colors);
  const still = stillBackground(colors, angle);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const p = shaderPalette(JSON.parse(paletteKey) as LiquidLinesPalette);
    const rad = (angle * Math.PI) / 180;
    const stop = mountStage(el, {
      // Soft light needs fewer pixels than glyphs or type: 1.5 keeps the sharp cores crisp at a little over half the cost of 2.
      cap: 1.5,
      phoneCap: 1.25,
      floor: 1,
      speed,
      stillTime: 37,
      create(gl, phone) {
        const prog = link(gl, FULL_VERT, (phone ? LIQUID_FRAG.replace("precision highp int;", "precision highp int;\n#define PHONE 1") : LIQUID_FRAG));
        const freeTriangle = fullTriangle(gl);
        gl.useProgram(prog.program);
        gl.uniform2f(prog.at("uDir"), Math.cos(rad), Math.sin(rad));
        gl.uniform1f(prog.at("uDensity"), Math.min(Math.max(density, 0), 1.7));
        gl.uniform1f(prog.at("uFringe"), Math.max(fringe, 0));
        gl.uniform1f(prog.at("uExposure"), 1.15 * Math.max(exposure, 0));
        gl.uniform3f(prog.at("uBg"), ...p.bg);
        gl.uniform3f(prog.at("uCore"), ...p.core);
        gl.uniform3f(prog.at("uCool"), ...p.cool);
        gl.uniform3f(prog.at("uAccent"), ...p.accent);
        gl.uniform3f(prog.at("uWarm"), ...p.warm);
        gl.uniform3f(prog.at("uGlow"), ...p.glow);
        return {
          draw(g, f) {
            g.uniform2f(prog.at("uRes"), g.drawingBufferWidth, g.drawingBufferHeight);
            g.uniform1f(prog.at("uDpr"), f.dpr);
            // Streaks keep their size on a laptop and grow a little finer on a small screen.
            g.uniform1f(prog.at("uScale"), Math.min(Math.max(Math.min(f.width, f.height * 1.6) / 1200, 0.72), 1.25));
            g.uniform1f(prog.at("uTime"), f.time);
            // Past 2.1 seconds the shader skips the intro; 3 keeps the number small.
            g.uniform1f(prog.at("uIntro"), intro ? Math.min(f.clock, 3) : 3);
            g.drawArrays(g.TRIANGLES, 0, 3);
          },
          dispose(g) {
            freeTriangle();
            g.deleteProgram(prog.program);
          },
        };
      },
    });
    // Without WebGL there is no canvas and no intro: show the CSS picture in place of the black the intro starts from.
    if (intro && !el.querySelector("canvas")) el.style.background = still;
    return stop;
  }, [paletteKey, angle, speed, density, fringe, exposure, intro, still]);

  // The intro starts from black, so the CSS picture waits; under reduced motion there is no intro and it shows at once (marked important to beat the inline black).
  const style = (intro ? { background: colors.background, "--liquid-still": still } : { background: still }) as CSSProperties;
  return <div ref={host} aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${intro ? "motion-reduce:[background:var(--liquid-still)]!" : ""} ${className}`} style={style} />;
}
