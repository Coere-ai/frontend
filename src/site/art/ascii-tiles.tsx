"use client";

import { useEffect, useRef } from "react";
import { buildGlyphAtlas, DEFAULT_GLYPHS } from "./ascii-tiles/glyphs";
import { type AsciiTilesPalette, type AsciiTilesPaletteName, iridescentStops, TILE_PALETTES } from "./ascii-tiles/palette";
import { GLYPH_FRAG, INK_FRAG } from "./ascii-tiles/shaders";
import { link } from "./pixel-matrix/gl";
import { cellGrid, hexToRgb } from "./stage/math";
import { FULL_VERT, fullTriangle, mountStage } from "./stage/stage";

export type { AsciiTilesPalette } from "./ascii-tiles/palette";
export { COERE_TILES_PALETTE, SPECTRUM_PALETTE } from "./ascii-tiles/palette";

export type AsciiTilesProps = {
  /** "coere" (Coere blue, white and violet), "spectrum" (gray glass, rainbow bevels), or colors of your own. */
  palette?: AsciiTilesPaletteName | AsciiTilesPalette;
  /** The glyphs to draw with, in any order; they are sorted by ink. */
  glyphs?: string;
  /** Character cell size in CSS pixels. */
  cell?: number;
  /** A tile's width on screen, in CSS pixels, near the middle. Defaults to a size from the viewport. */
  tile?: number;
  /** Turn of the grid in degrees. */
  rotation?: number;
  /** How far the camera leans from looking straight down, in degrees. */
  tilt?: number;
  /** 0 holds a still frame, 1 is the default drift of light and tiles. */
  speed?: number;
  /** Ink of the glyphs, 1 the default. */
  brightness?: number;
  className?: string;
};

const FOCAL = 1.55;

/** A CSS picture for the server and the moment before WebGL starts: a dark field of faint dots with soft light pools. */
function stillBackground(p: AsciiTilesPalette): string {
  const dot = p.shade;
  return [
    `radial-gradient(circle at 50% 50%, ${dot}66 0 0.9px, transparent 1.3px) 0 0 / 7px 7px`,
    `radial-gradient(ellipse 40% 30% at 30% 60%, ${p.lit}10, transparent 70%)`,
    `radial-gradient(ellipse 35% 28% at 72% 35%, ${p.iridescent[0]}18, transparent 70%)`,
    p.background,
  ].join(",");
}

/**
 * A floor of large glassy beveled tiles seen at a slant, drawn as a dense
 * field of ASCII glyphs: sparse marks where the glass is in shade, dense
 * ones where the light pools, and an iridescent film running along every
 * bevel. The light circles and drifts and the tiles glide slowly. Drawn
 * with WebGL in two passes (see ascii-tiles/shaders.ts).
 *
 * It shows a still CSS version on the server and until WebGL starts,
 * holds one frame under reduced motion, pauses off screen and in a hidden
 * tab, draws at a capped pixel ratio with larger cells on a phone, and
 * frees its context when it unmounts.
 */
export function AsciiTiles({ palette = "coere", glyphs = DEFAULT_GLYPHS, cell = 7, tile, rotation = 21, tilt = 20, speed = 1, brightness = 1, className = "" }: AsciiTilesProps) {
  const host = useRef<HTMLDivElement>(null);
  const colors = typeof palette === "string" ? TILE_PALETTES[palette] : palette;
  const paletteKey = JSON.stringify(colors);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const p = JSON.parse(paletteKey) as AsciiTilesPalette;
    const iri = iridescentStops(p.iridescent);
    const pitch = (Math.min(Math.max(tilt, 0), 60) * Math.PI) / 180;
    const rot = (rotation * Math.PI) / 180;
    return mountStage(el, {
      cap: 2,
      phoneCap: 1.5,
      floor: 1,
      speed,
      stillTime: 24,
      create(gl, phone) {
        const atlas = buildGlyphAtlas(glyphs);
        const scene = link(gl, FULL_VERT, INK_FRAG);
        const glyph = link(gl, FULL_VERT, GLYPH_FRAG);
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

        // The ink texture holds one texel a character cell, remade when the grid changes.
        const sceneTex = gl.createTexture();
        const fbo = gl.createFramebuffer();
        let grid = { cols: 0, rows: 0 };
        function sizeScene(cols: number, rows: number) {
          if (cols === grid.cols && rows === grid.rows) return;
          grid = { cols, rows };
          gl.bindTexture(gl.TEXTURE_2D, sceneTex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTex, 0);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }

        const bg = hexToRgb(p.background);
        // Both passes light the same scene, so both get its settings.
        for (const prog of [scene, glyph]) {
          gl.useProgram(prog.program);
          gl.uniform3fv(prog.at("uShade"), hexToRgb(p.shade) as unknown as number[]);
          gl.uniform3fv(prog.at("uLit"), hexToRgb(p.lit) as unknown as number[]);
          gl.uniform3fv(prog.at("uIri"), iri.stops);
          gl.uniform1i(prog.at("uIriCount"), iri.count);
          gl.uniform1f(prog.at("uPitch"), pitch);
          gl.uniform1f(prog.at("uRot"), rot);
        }
        gl.uniform1i(glyph.at("uInk"), 0);
        gl.uniform1i(glyph.at("uGlyphs"), 1);
        gl.uniform1f(glyph.at("uCount"), atlas.count);
        gl.uniform3f(glyph.at("uBg"), bg[0], bg[1], bg[2]);
        gl.uniform1f(glyph.at("uGain"), Math.max(brightness, 0));

        return {
          draw(g, f) {
            const W = g.drawingBufferWidth;
            const H = g.drawingBufferHeight;
            // A phone gets slightly larger cells, so the glyphs still read and there are fewer to draw.
            const cellPx = Math.max(Math.round(Math.max(cell, 3) * (phone ? 1.15 : 1) * f.dpr), 3);
            const { cols, rows } = cellGrid(W, H, cellPx);
            sizeScene(cols, rows);
            const tilePx = tile ?? Math.min(Math.max(Math.min(f.width, f.height * 1.7) * 0.185, 120), 260);
            // World width of a tile so that, near the middle of the screen, it spans tilePx.
            const tileWorld = (tilePx / f.height) / (FOCAL * Math.cos(pitch));

            const frame = (prog: typeof scene) => {
              g.useProgram(prog.program);
              g.uniform2f(prog.at("uRes"), W, H);
              g.uniform1f(prog.at("uCell"), cellPx);
              g.uniform1f(prog.at("uTime"), f.time);
              g.uniform1f(prog.at("uTile"), tileWorld);
            };
            g.bindFramebuffer(g.FRAMEBUFFER, fbo);
            g.viewport(0, 0, cols, rows);
            frame(scene);
            g.drawArrays(g.TRIANGLES, 0, 3);

            g.bindFramebuffer(g.FRAMEBUFFER, null);
            g.viewport(0, 0, W, H);
            frame(glyph);
            g.activeTexture(g.TEXTURE0);
            g.bindTexture(g.TEXTURE_2D, sceneTex);
            g.activeTexture(g.TEXTURE1);
            g.bindTexture(g.TEXTURE_2D, glyphTex);
            g.drawArrays(g.TRIANGLES, 0, 3);
          },
          dispose(g) {
            freeTriangle();
            g.deleteTexture(glyphTex);
            g.deleteTexture(sceneTex);
            g.deleteFramebuffer(fbo);
            g.deleteProgram(scene.program);
            g.deleteProgram(glyph.program);
          },
        };
      },
    });
  }, [paletteKey, glyphs, cell, tile, rotation, tilt, speed, brightness]);

  return <div ref={host} aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} style={{ background: stillBackground(colors) }} />;
}
