"use client";

import { useEffect, useRef } from "react";
import { hexToRgb, NEON_PALETTE } from "./pixel-matrix/palette";
import { type CellPicture, pictureCells } from "./pixel-picture/cells";
import { coverCrop, extendRows } from "./pixel-picture/frame";
import { paintPicture } from "./pixel-picture/paint";
import { createPictureRenderer, INTRO_END, type PictureRenderer } from "./pixel-picture/renderer";
import { sizedSrc } from "@/site/ui/sized-src";

/** Photos whose intro has played in this page load, so coming back to one shows it finished. */
const played = new Set<string>();

/** Photo pixels read per cell each way: enough to average out the photo's grain. */
const SAMPLE = 3;
/** The tallest frame the photo is cropped to, as width over height; a taller canvas sets it at the foot and fades it in above. */
const TALLEST = 0.85;
/** Above this the cells are drawn at this pixel ratio and the screen scales them. */
const MAX_DPR = 2;

export type PixelPictureProps = {
  /** A private photo's path without its width, such as /preview/images/industries/finance.webp. */
  photo: string;
  /** The point of the photo to keep in frame, 0 to 1 each way. */
  focus?: readonly [number, number];
  /** Plays the cells coloring in, once per page load, when the picture first shows. Without it the picture appears finished. */
  intro?: boolean;
  /** CSS pixels from one cell to the next. */
  cell?: number;
  /** The photo width to read, from the saved widths. */
  source?: number;
  /** Set for a picture that stands for its photo; left out, the picture is decoration. */
  label?: string;
  className?: string;
};

/**
 * A photo redrawn as an LED wall in the Solutions hero's style: a grid of
 * small square cells on near black, each one solid color from the Coere
 * palette, read from the photo's light and edges (see pixel-picture/cells).
 * The colors are worked out once, when the photo loads, into a texture one
 * texel a cell; with `intro`, a single WebGL pass then lights the cells in
 * a wave from the top left, each flashing as the front passes, and stops
 * for good. Without it a 2D canvas paints the picture once and fades it in.
 *
 * The server renders the plain dark field it sits on. Under reduced motion
 * the picture shows finished at once. A resize redraws it still; unmounting
 * frees the canvas and its context.
 */
export function PixelPicture({ photo, focus = [0.5, 0.5], intro = false, cell = 3.5, source = 1920, label, className = "" }: PixelPictureProps) {
  const host = useRef<HTMLDivElement>(null);
  const [fx, fy] = focus;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const stops = NEON_PALETTE.map(hexToRgb);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = `position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity ${intro ? 300 : 600}ms ease`;
    el.appendChild(canvas);

    let gpu: PictureRenderer | null = null;
    if (intro) {
      try {
        gpu = createPictureRenderer(canvas, stops);
      } catch {
        gpu = null;
      }
    }
    // Where WebGL is missing, the 2D canvas paints the finished picture.
    const play = Boolean(gpu) && !reduce && !played.has(photo);

    let image: HTMLImageElement | null = null;
    let picture: CellPicture | null = null;
    let disposed = false;
    let raf = 0;
    let start = 0;
    let started = !play;
    let visible = false;
    const grid = { cell: 4, gap: 1, cols: 0, rows: 0 };
    let last: ResizeObserverEntry | undefined;

    /** Sizes the canvas to whole device pixels and works out the grid. */
    function measure(entry = last) {
      last = entry;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const exact = dpr === (window.devicePixelRatio || 1) ? entry?.devicePixelContentBoxSize?.[0] : undefined;
      const w = exact ? exact.inlineSize : Math.round(el!.clientWidth * dpr);
      const h = exact ? exact.blockSize : Math.round(el!.clientHeight * dpr);
      if (w < 1 || h < 1) return false;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      // A phone draws its cells a little finer, to keep more of the scene on a narrow screen.
      const css = el!.clientWidth < 640 ? cell * 0.86 : cell;
      grid.cell = Math.max(2, Math.round(css * dpr));
      grid.gap = Math.max(1, Math.round(grid.cell * 0.22 + 0.15));
      grid.cols = Math.ceil(w / grid.cell);
      grid.rows = Math.ceil(h / grid.cell);
      return true;
    }

    /** Reads the photo into cells for the current grid, once per grid size. */
    function compute() {
      if (!image || (picture && picture.cols === grid.cols && picture.rows === grid.rows)) return;
      const rows = Math.min(grid.rows, Math.ceil(grid.cols / TALLEST));
      const sample = document.createElement("canvas");
      sample.width = grid.cols * SAMPLE;
      sample.height = rows * SAMPLE;
      const ctx = sample.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      const crop = coverCrop(image.naturalWidth, image.naturalHeight, grid.cols / rows, [fx, fy]);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, crop.x, crop.y, crop.w, crop.h, 0, 0, sample.width, sample.height);
      const pixels = ctx.getImageData(0, 0, sample.width, sample.height);
      picture = extendRows(pictureCells(pixels, grid.cols, rows, stops), grid.rows);
      sample.width = 0;
      gpu?.setPicture(picture);
    }

    function draw(time: number) {
      if (!picture) return;
      if (gpu) gpu.draw(time, grid.cell, grid.gap);
      else paintPicture(canvas, picture, grid.cell, grid.gap);
      canvas.style.opacity = "1";
    }

    function tick(now: number) {
      raf = 0;
      if (disposed) return;
      if (!start) start = now;
      const time = (now - start) / 1000;
      draw(time);
      if (time < INTRO_END) raf = requestAnimationFrame(tick);
    }

    /** Starts the intro the first time the picture is ready and on screen, or draws it finished. */
    function begin() {
      if (!picture || disposed) return;
      if (started) {
        draw(INTRO_END);
        return;
      }
      if (!visible) return;
      started = true;
      played.add(photo);
      raf = requestAnimationFrame(tick);
    }

    const resize = new ResizeObserver(([entry]) => {
      if (!measure(entry)) return;
      compute();
      // Mid intro the next frame draws the new size; otherwise draw it finished now, since a resize clears the canvas.
      if (!raf) begin();
    });
    const seen = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) return;
        if (!image) load();
        else if (!started) begin();
      },
      { rootMargin: intro ? "0px" : "300px" },
    );

    function load() {
      const img = new Image();
      img.decoding = "async";
      img.src = sizedSrc(photo, source);
      image = img;
      img
        .decode()
        .then(() => {
          if (disposed) return;
          if (!measure()) return;
          compute();
          begin();
        })
        .catch(() => {
          // A photo that will not load leaves the dark field in place.
        });
    }

    const onLost = (e: Event) => {
      e.preventDefault();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      canvas.style.opacity = "0";
    };
    canvas.addEventListener("webglcontextlost", onLost);
    resize.observe(el);
    seen.observe(el);

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      resize.disconnect();
      seen.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      gpu?.dispose();
      if (image) image.src = "";
      canvas.remove();
    };
  }, [photo, fx, fy, intro, cell, source]);

  return (
    <div
      ref={host}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-[#0b0a12] ${className}`}
    />
  );
}
