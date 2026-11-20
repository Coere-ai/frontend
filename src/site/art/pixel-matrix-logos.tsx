"use client";

import { useEffect, useRef } from "react";
import { isTall, type MatrixLayout, type Placed, placeLogos, wallScale } from "./pixel-matrix/layout";
import { AI_LOGO_IDS, MATRIX_LOGOS, type MatrixLogoId } from "./pixel-matrix/logos";
import { BRAND_PALETTE, hexToRgb, type MatrixPalette, NEON_PALETTE, rampAt } from "./pixel-matrix/palette";
import { rasterizeLogo, SUPERSAMPLE } from "./pixel-matrix/rasterize";
import { createRenderer } from "./pixel-matrix/renderer";
import { cellsFromPixels } from "./pixel-matrix/sample";
import { frameFor, type SceneLogo, type SceneState } from "./pixel-matrix/scene";

export type { MatrixLayout } from "./pixel-matrix/layout";
export type { MatrixLogoId } from "./pixel-matrix/logos";

const DEFAULT_LOGOS: readonly MatrixLogoId[] = ["coere", ...AI_LOGO_IDS];

export type PixelMatrixLogosProps = {
  /** Which marks float on the wall. "coere" takes the bright center. Defaults to Coere and every AI. */
  logos?: readonly MatrixLogoId[];
  /** Cells per logo and on the wall: 1 is the default, 1.4 finer, 0.7 coarser. */
  density?: number;
  /** "neon" (cyan, electric blue, violet, magenta), "brand" (Coere blue), or four hex stops of your own. */
  palette?: "neon" | "brand" | MatrixPalette;
  /** 0 holds a still frame, 1 is the default drift, wave and pointer push, up to 1.5 for more. */
  motion?: number;
  /** "center" rings the logos round the Coere mark; "frame" keeps them to bands above and below a hero's copy. */
  layout?: MatrixLayout;
  className?: string;
};

/**
 * A full bleed LED wall of AI logos. Every mark is sampled from its SVG
 * into a grid of small square cells and drawn with WebGL as instanced
 * squares, floating at its own depth with light, shade and glow. The cells
 * fly in and assemble on load, then the logos drift, a wave of light runs
 * across, and the pointer pushes the cells near it and tilts the scene.
 *
 * It renders a still dark field on the server and until WebGL starts, holds
 * one assembled frame under reduced motion, pauses off screen and in a
 * hidden tab, and frees its context when it unmounts.
 */
export function PixelMatrixLogos({ logos = DEFAULT_LOGOS, density = 1, palette = "neon", motion = 1, layout = "center", className = "" }: PixelMatrixLogosProps) {
  const host = useRef<HTMLDivElement>(null);
  const logoKey = logos.join(",");
  const paletteKey = typeof palette === "string" ? palette : palette.join(",");

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const ids = logoKey.split(",").filter((id): id is MatrixLogoId => id in MATRIX_LOGOS);
    const hexes = paletteKey === "neon" ? NEON_PALETTE : paletteKey === "brand" ? BRAND_PALETTE : paletteKey.split(",");
    const stops = hexes.map(hexToRgb);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || motion <= 0;
    const amount = reduce ? 0 : Math.min(motion, 1.5);

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity 900ms ease";
    el.appendChild(canvas);
    let renderer: ReturnType<typeof createRenderer> = null;
    try {
      renderer = createRenderer(canvas);
    } catch {
      renderer = null;
    }
    if (!renderer) {
      canvas.remove();
      return;
    }
    const gpu = renderer;

    // A phone gets fewer logos, coarser cells and a lower pixel ratio cap.
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const state: SceneState = { width: 1, height: 1, dpr: 1, scale: 1, time: reduce ? 14 : 0, intro: reduce ? 99 : 0, motion: amount, pointer: [0, 0, 0], wallCell: 6, logos: [] };
    let dprCap = coarse ? 1.5 : 2;
    let tall: boolean | null = null;
    let ready = false;
    let disposed = false;
    let build = 0;

    async function rebuild() {
      const mine = ++build;
      ready = false;
      const small = tall || state.width < 900;
      const placed = placeLogos(ids, layout, Boolean(tall), small ? 7 : 10);
      const cellPx = (tall ? 4.6 : 5.6) / Math.max(density, 0.4);
      const grids = placed.map((p) => Math.round(Math.min(Math.max((p.size * state.scale) / cellPx, 20), 64)));
      try {
        const pixels = await Promise.all(placed.map((p, i) => rasterizeLogo(MATRIX_LOGOS[p.id], grids[i])));
        if (disposed || mine !== build) return;
        gpu.setLogos(pixels.map((px, i) => cellsFromPixels(px, grids[i], SUPERSAMPLE, MATRIX_LOGOS[placed[i].id], stops)));
        state.logos = placed.map((p: Placed, i): SceneLogo => ({ placed: p, grid: grids[i], tint: rampAt(stops, MATRIX_LOGOS[p.id].tone) }));
        ready = true;
        wake();
      } catch {
        // A logo that will not load leaves the still background in place.
      }
    }

    function size() {
      const w = Math.max(el!.clientWidth, 1);
      const h = Math.max(el!.clientHeight, 1);
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      state.width = w;
      state.height = h;
      state.dpr = dpr;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const nowTall = isTall(w, h);
      state.scale = wallScale(w, nowTall);
      state.wallCell = (nowTall ? 5 : 6) / Math.max(density, 0.4);
      if (nowTall !== tall) {
        tall = nowTall;
        void rebuild();
      } else if (ready) wake();
    }

    let visible = true;
    let raf = 0;
    let last = 0;
    let slow = 0;
    const target = { x: 0, y: 0, in: 0 };

    function frame(now: number) {
      raf = 0;
      if (disposed || !ready) return;
      // Capped so a long stall does not jump the drift, yet loose enough that a slow device still assembles in a few seconds.
      const dt = last ? Math.min((now - last) / 1000, 0.25) : 0;
      last = now;
      if (!reduce) {
        state.time += dt;
        state.intro += dt;
        const k = 1 - Math.exp(-dt * 4);
        const [px, py, pin] = state.pointer;
        state.pointer = [px + (target.x - px) * k, py + (target.y - py) * k, pin + (target.in - pin) * k];
        // Hold 50 fps or better: past two seconds of slow frames, draw fewer pixels.
        slow = dt > 0.022 ? slow + dt : Math.max(slow - dt, 0);
        if (slow > 2 && dprCap > 1) {
          dprCap = Math.max(1, dprCap - 0.25);
          slow = 0;
          size();
        }
      }
      gpu.draw(frameFor(state));
      canvas.style.opacity = "1";
      if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }

    function wake() {
      if (!raf && !disposed && ready && visible && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    }

    function onPointer(e: PointerEvent) {
      const r = el!.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      target.x = x;
      target.y = y;
      target.in = inside ? 1 : 0;
    }
    const onLeave = () => (target.in = 0);
    const onVisibility = () => (document.hidden ? cancel() : wake());
    function cancel() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    const resize = new ResizeObserver(size);
    resize.observe(el);
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
      else cancel();
    });
    seen.observe(el);
    document.addEventListener("visibilitychange", onVisibility);
    if (!reduce) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    }
    const onLost = (e: Event) => {
      e.preventDefault();
      cancel();
      ready = false;
      canvas.style.opacity = "0";
    };
    canvas.addEventListener("webglcontextlost", onLost);
    size();

    return () => {
      disposed = true;
      cancel();
      resize.disconnect();
      seen.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      gpu.dispose();
      canvas.remove();
    };
  }, [logoKey, paletteKey, density, motion, layout]);

  return (
    <div
      ref={host}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ background: "radial-gradient(ellipse 70% 60% at 50% 46%, rgba(38, 64, 180, 0.2), transparent 70%), #04050b" }}
    />
  );
}
