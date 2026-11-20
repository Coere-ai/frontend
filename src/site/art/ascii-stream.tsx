"use client";

import { useEffect, useRef } from "react";
import { buildGlyphAtlas } from "./ascii-tiles/glyphs";
import { type AsciiStreamPalette, COERE_STREAM_PALETTE, streamShaderPalette } from "./ascii-stream/palette";
import { STREAM_FRAG } from "./ascii-stream/shader";
import { link } from "./pixel-matrix/gl";
import { FULL_VERT, fullTriangle, mountStage } from "./stage/stage";

export type { AsciiStreamPalette } from "./ascii-stream/palette";

/** The glyphs that flow along the ribbons. */
const STREAM_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Pixels per glyph in the atlas, as ascii-tiles/glyphs.ts draws it. */
const ATLAS_SIDE = 64;

export type AsciiStreamProps = {
  /** Colors of your own; Coere's blues by default. */
  palette?: AsciiStreamPalette;
  /** Where the seam's bright middle sits, from 0 to 1 across and down the box. */
  seamX?: number;
  seamY?: number;
  /** How far the brightest ribbons climb at the edges, as a share of the box's height. */
  reach?: number;
  /** Glyph size in CSS pixels. */
  cell?: number;
  /** 0 holds a still frame, 1 is the default flow. */
  speed?: number;
  /** Overall light, 1 the default. */
  exposure?: number;
  className?: string;
};

/** A CSS picture for the server and the moment before WebGL starts: the seam's line and glow on the background. */
function stillBackground(p: AsciiStreamPalette, seamX: number, seamY: number): string {
  const at = `${seamX * 100}% ${seamY * 100}%`;
  return [
    `radial-gradient(ellipse 30% 1.2px at ${at}, ${p.core}, transparent)`,
    `radial-gradient(ellipse 45% 0.6px at ${at}, ${p.line}aa, transparent)`,
    `radial-gradient(ellipse 22% 6% at ${at}, ${p.ribbon}55, transparent 70%)`,
    `radial-gradient(ellipse 55% 18% at ${at}, ${p.deep}33, transparent 70%)`,
    p.background,
  ].join(",");
}

/**
 * Ribbons of light that fan out from a bright horizontal seam toward both
 * edges, meeting at the middle like light through a lens, with streams of
 * small glyphs flowing along them and through the seam. Drawn in one
 * WebGL pass (see ascii-stream/shader.ts).
 *
 * It shows a still CSS version on the server and until WebGL starts,
 * holds one frame under reduced motion, pauses off screen and in a hidden
 * tab, draws at a capped pixel ratio (lower on a phone), and frees its
 * context when it unmounts. It never takes a click.
 */
export function AsciiStream({ palette = COERE_STREAM_PALETTE, seamX = 0.5, seamY = 0.5, reach = 0.42, cell = 8, speed = 1, exposure = 1, className = "" }: AsciiStreamProps) {
  const host = useRef<HTMLDivElement>(null);
  const paletteKey = JSON.stringify(palette);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const p = streamShaderPalette(JSON.parse(paletteKey) as AsciiStreamPalette);
    return mountStage(el, {
      cap: 1.5,
      phoneCap: 1.5,
      floor: 1,
      speed,
      stillTime: 30,
      create(gl, phone) {
        const atlas = buildGlyphAtlas(STREAM_GLYPHS);
        const prog = link(gl, FULL_VERT, phone ? STREAM_FRAG.replace("precision highp int;", "precision highp int;\n#define PHONE 1") : STREAM_FRAG);
        const freeTriangle = fullTriangle(gl);

        const glyphTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, glyphTex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.useProgram(prog.program);
        gl.uniform1i(prog.at("uGlyphs"), 0);
        gl.uniform1f(prog.at("uCount"), atlas.count);
        gl.uniform2f(prog.at("uSeam"), seamX, seamY);
        gl.uniform1f(prog.at("uReach"), reach);
        gl.uniform1f(prog.at("uCell"), Math.max(cell, 4));
        gl.uniform1f(prog.at("uExposure"), 1.45 * Math.max(exposure, 0));
        gl.uniform3f(prog.at("uBg"), ...p.background);
        gl.uniform3f(prog.at("uDeep"), ...p.deep);
        gl.uniform3f(prog.at("uRibbon"), ...p.ribbon);
        gl.uniform3f(prog.at("uBright"), ...p.bright);
        gl.uniform3f(prog.at("uCore"), ...p.core);
        gl.uniform3f(prog.at("uLine"), ...p.line);
        return {
          draw(g, f) {
            g.uniform2f(prog.at("uRes"), g.drawingBufferWidth, g.drawingBufferHeight);
            g.uniform1f(prog.at("uDpr"), f.dpr);
            g.uniform1f(prog.at("uTime"), f.time);
            // The atlas level whose glyphs are as large as a cell on screen, so they stay sharp without shimmering.
            g.uniform1f(prog.at("uLod"), Math.max(Math.log2(ATLAS_SIDE / (Math.max(cell, 4) * f.dpr)), 0));
            g.activeTexture(g.TEXTURE0);
            g.bindTexture(g.TEXTURE_2D, glyphTex);
            g.drawArrays(g.TRIANGLES, 0, 3);
          },
          dispose(g) {
            freeTriangle();
            g.deleteTexture(glyphTex);
            g.deleteProgram(prog.program);
          },
        };
      },
    });
  }, [paletteKey, seamX, seamY, reach, cell, speed, exposure]);

  return <div ref={host} aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} style={{ background: stillBackground(palette, seamX, seamY) }} />;
}
