"use client";

import { useEffect, useRef } from "react";
import { link } from "./pixel-matrix/gl";
import { cellPixels, fieldUnit } from "./dither-wave/grid";
import { DITHER_WAVE_FRAG } from "./dither-wave/shader";
import { hexToRgb } from "./stage/math";
import { FULL_VERT, fullTriangle, mountStage } from "./stage/stage";

/** Dither Wave's colors, as hex. */
export type DitherWaveColors = {
  /** The near black behind the bands. */
  background: string;
  /** The blue of a band's thin, scattered edge. */
  deep: string;
  /** The blue of a band's full body. */
  blue: string;
  /** The color of each band's bright core. */
  core: string;
};

/** Coere's own: white cores in Coere blue, running from deep at the edges to bright in the body, on the site's near black. */
export const COERE_DITHER: DitherWaveColors = { background: "#0b0a12", deep: "#2f3ee6", blue: "#5b70ff", core: "#ffffff" };

export type DitherWaveProps = {
  /** One dither pixel in CSS pixels; it is snapped to whole device pixels. */
  pixelSize?: number;
  /** 0 holds a still frame, 1 is the default drift. */
  speed?: number;
  /** Band size, 1 the default, larger for wider bands. */
  scale?: number;
  /** Overall light, 1 the default. */
  gain?: number;
  colors?: DitherWaveColors;
  className?: string;
};

/** A CSS picture of the scene for the server and the moment before WebGL starts: two soft blue ribbons on near black. */
function stillBackground(c: DitherWaveColors): string {
  return [
    `linear-gradient(115deg, transparent 52%, ${c.deep}33 60%, ${c.blue}40 64%, transparent 72%)`,
    `linear-gradient(105deg, transparent 74%, ${c.deep}26 80%, transparent 86%)`,
    c.background,
  ].join(",");
}

/**
 * Flowing bands of a wave field, drawn in a crisp ordered dither of small
 * square pixels: white and dense at each band's core, thinning into
 * scattered blue pixels at its edges, near black between. The bands bend
 * into slow S curves, swell, thin and drift. Drawn in one WebGL pass (see
 * dither-wave/shader.ts).
 *
 * Every dither pixel is a whole number of device pixels and the canvas is
 * never smoothed when the browser scales it, so the squares stay sharp at
 * any pixel ratio. It shows a still CSS version on the server and until
 * WebGL starts, holds one frame under reduced motion, pauses off screen
 * and in a hidden tab, draws at a capped pixel ratio that steps down on a
 * slow device, and frees its context when it unmounts.
 */
export function DitherWave({ pixelSize = 2.5, speed = 1, scale = 1, gain = 1, colors = COERE_DITHER, className = "" }: DitherWaveProps) {
  const host = useRef<HTMLDivElement>(null);
  const colorKey = JSON.stringify(colors);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const c = JSON.parse(colorKey) as DitherWaveColors;
    return mountStage(el, {
      // Flat squares need no extra pixels for softness: drawing at the screen's own ratio up to 2 keeps them exact on most screens.
      cap: 2,
      phoneCap: 2,
      floor: 1,
      speed,
      stillTime: 14,
      create(gl) {
        const prog = link(gl, FULL_VERT, DITHER_WAVE_FRAG);
        const freeTriangle = fullTriangle(gl);
        gl.useProgram(prog.program);
        gl.uniform3f(prog.at("uBg"), ...hexToRgb(c.background));
        gl.uniform3f(prog.at("uDeep"), ...hexToRgb(c.deep));
        gl.uniform3f(prog.at("uMid"), ...hexToRgb(c.blue));
        gl.uniform3f(prog.at("uCore"), ...hexToRgb(c.core));
        gl.uniform1f(prog.at("uGain"), Math.max(gain, 0));
        return {
          draw(g, f) {
            g.uniform2f(prog.at("uRes"), g.drawingBufferWidth, g.drawingBufferHeight);
            g.uniform1f(prog.at("uDpr"), f.dpr);
            g.uniform1f(prog.at("uCell"), cellPixels(pixelSize, f.dpr));
            g.uniform1f(prog.at("uUnit"), fieldUnit(f.width, f.height, scale));
            g.uniform1f(prog.at("uTime"), f.time);
            g.drawArrays(g.TRIANGLES, 0, 3);
          },
          dispose(g) {
            freeTriangle();
            g.deleteProgram(prog.program);
          },
        };
      },
    });
  }, [colorKey, pixelSize, speed, scale, gain]);

  // A canvas drawn under the screen's ratio is scaled up by the browser; pixelated keeps its squares hard.
  return <div ref={host} aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden [&>canvas]:[image-rendering:pixelated] ${className}`} style={{ background: stillBackground(colors) }} />;
}
