import type { ReactNode } from "react";
import { slantPath } from "./slant-shape";

/** Each tile is 100 wide and this tall in its own drawing box, so all tiles share one shape. */
const TILE_HEIGHT = 62;

/**
 * A grid of tiles split by slanted cuts, each holding one thing: a logo, a
 * word, a small picture. The tiles are drawn in SVG so the cut edges keep
 * a crisp outline and rounded corners at any size. Nothing joins the tiles;
 * the cuts alone make them read as one set.
 */
export function SlantTiles({ items, columns = 2, className }: { items: { key: string; content: ReactNode }[]; columns?: number; className?: string }) {
  return (
    <ul className={`grid gap-x-1.5 gap-y-3 ${className ?? ""}`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {items.map((item, index) => (
        <li key={item.key} className="relative" style={{ aspectRatio: `100 / ${TILE_HEIGHT}` }}>
          <svg viewBox={`0 0 100 ${TILE_HEIGHT}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <path
              d={slantPath({ column: index % columns, columns, height: TILE_HEIGHT })}
              className="fill-neutral-100 stroke-neutral-300"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="relative flex h-full items-center justify-center px-[14%]">{item.content}</div>
        </li>
      ))}
    </ul>
  );
}
