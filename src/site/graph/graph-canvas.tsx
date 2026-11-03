"use client";

import { useEffect, useRef } from "react";

import { createCanvasGraph, type CanvasGraph } from "./controller";
import type { GraphNode } from "./types";

/**
 * The memory graph on a canvas, in a card the size of the page's column.
 * Built once per mount; new points or a new search go to the same canvas,
 * so the view is not rebuilt as the person types.
 */
export function GraphCanvas({ nodes, dimmed, label }: { nodes: readonly GraphNode[]; dimmed: ReadonlySet<string> | null; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphRef = useRef<CanvasGraph | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const graph = createCanvasGraph(canvas, () => getComputedStyle(canvas).fontFamily || "sans-serif");
    graphRef.current = graph;
    return () => {
      graph.destroy();
      graphRef.current = null;
    };
  }, []);

  useEffect(() => graphRef.current?.setNodes(nodes), [nodes]);
  useEffect(() => graphRef.current?.setDimmed(dimmed), [dimmed]);

  const control = "grid h-9 w-9 place-items-center rounded-full border border-neutral-200 bg-white text-[15px] text-neutral-950 transition-colors hover:border-neutral-950";
  return (
    <div className="relative h-[460px] overflow-hidden rounded-3xl border border-neutral-200 md:h-[560px]">
      <canvas ref={canvasRef} role="img" aria-label={label} className="block h-full w-full font-sans" />
      <div className="absolute right-4 bottom-4 flex gap-2">
        <button type="button" aria-label="Zoom in" className={control} onClick={() => graphRef.current?.zoomBy(1.4)}>
          +
        </button>
        <button type="button" aria-label="Zoom out" className={control} onClick={() => graphRef.current?.zoomBy(1 / 1.4)}>
          &minus;
        </button>
        <button type="button" className={`${control} w-auto px-4 text-[13px]`} onClick={() => graphRef.current?.fit()}>
          Fit
        </button>
      </div>
    </div>
  );
}
