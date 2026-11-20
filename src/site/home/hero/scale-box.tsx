"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Draws its children at a fixed design size and scales them to the width it
 * is given, so a mock built in pixels keeps its proportions at any width.
 * The box keeps its height from the start (aspect ratio), so nothing shifts
 * when the scale is set; the children wait hidden until then. They are real
 * elements, so text stays sharp at any scale.
 */
export function ScaleBox({ width, height, className = "", children }: { width: number; height: number; className?: string; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const box = outer.current;
    const content = inner.current;
    if (!box || !content) return;
    const fit = () => {
      content.style.transform = `scale(${box.clientWidth / width})`;
      content.style.visibility = "visible";
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={outer} className={`relative w-full ${className}`} style={{ aspectRatio: `${width} / ${height}` }}>
      <div ref={inner} className="absolute top-0 left-0 origin-top-left" style={{ width, height, visibility: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
