"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

import { MAP_H, MAP_W } from "./world-shapes";

/**
 * Pan and zoom for the world map.
 *
 * ZOOM IS A TRANSFORM ON A GROUP, not a change to the viewBox. A transform
 * leaves stroke widths and point radii in screen space once they are divided
 * by the scale, which keeps borders hairline thin and points the same size at
 * every zoom level. A viewBox zoom would thicken every stroke as you go in.
 */

export interface View {
  x: number;
  y: number;
  k: number;
}

export const IDENTITY: View = { x: 0, y: 0, k: 1 };

/** Zoom limits. 1 fits the world; 12 is roughly city-block scale. */
const MIN_SCALE = 1;
const MAX_SCALE = 12;

const clampScale = (k: number) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, k));

/** The translation that keeps map point (mx, my), in viewBox units, still
 *  while the scale changes from v.k to k. */
function zoomAbout(v: View, k: number, mx: number, my: number): View {
  const mapX = (mx - v.x) / v.k;
  const mapY = (my - v.y) / v.k;
  return { k, x: mx - mapX * k, y: my - mapY * k };
}

export function useMapView(wrapRef: RefObject<HTMLDivElement | null>) {
  const [view, setView] = useState<View>(IDENTITY);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);

  // Wheel zoom about the cursor. Non-passive, because preventDefault has to
  // stop the page scrolling underneath, and React's onWheel is passive.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const scale = rect.width / MAP_W;
      setView((v) => {
        const k = clampScale(v.k * Math.exp(-e.deltaY * 0.0015));
        if (k === v.k) return v;
        return zoomAbout(v, k, (e.clientX - rect.left) / scale, (e.clientY - rect.top) / scale);
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [wrapRef]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = wrapRef.current;
    if (!d || !el) return;
    const scale = el.getBoundingClientRect().width / MAP_W;
    setView((v) => ({ ...v, x: d.vx + (e.clientX - d.x) / scale, y: d.vy + (e.clientY - d.y) / scale }));
  };

  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  /** Zoom about the centre, for the buttons, which have no cursor position. */
  const zoomBy = (f: number) =>
    setView((v) => {
      const k = clampScale(v.k * f);
      return k === v.k ? v : zoomAbout(v, k, MAP_W / 2, MAP_H / 2);
    });

  const reset = () => setView(IDENTITY);

  return { view, dragging, onPointerDown, onPointerMove, endDrag, zoomBy, reset };
}
