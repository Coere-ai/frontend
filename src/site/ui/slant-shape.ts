/**
 * The outline of one slanted tile, as an SVG path in a 100 by `height` box.
 *
 * Tiles sit side by side in a row. Every edge shared with a neighbour
 * leans the same way, so the gap between two tiles is an even diagonal
 * cut, like a pane of glass split at an angle. The first tile keeps a
 * straight left edge and the last a straight right one.
 */
export function slantPath({ column, columns, height, slant = 9, radius = 7 }: { column: number; columns: number; height: number; slant?: number; radius?: number }): string {
  const leftCut = column > 0;
  const rightCut = column < columns - 1;
  const corners: [number, number][] = [
    [0, 0],
    [rightCut ? 100 - slant : 100, 0],
    [100, height],
    [leftCut ? slant : 0, height],
  ];
  return roundedPolygon(corners, radius);
}

/**
 * A closed path through the points with each corner rounded off. Each
 * corner starts `radius` before the point and ends `radius` after it, with
 * a quadratic curve through the point itself.
 */
export function roundedPolygon(points: [number, number][], radius: number): string {
  const n = points.length;
  const toward = (from: [number, number], to: [number, number]) => {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const length = Math.hypot(dx, dy);
    const r = Math.min(radius, length / 2);
    return [from[0] + (dx / length) * r, from[1] + (dy / length) * r] as const;
  };
  let path = "";
  points.forEach((point, i) => {
    const before = toward(point, points[(i - 1 + n) % n]);
    const after = toward(point, points[(i + 1) % n]);
    path += `${i === 0 ? "M" : "L"}${before[0].toFixed(2)} ${before[1].toFixed(2)} Q${point[0]} ${point[1]} ${after[0].toFixed(2)} ${after[1].toFixed(2)} `;
  });
  return `${path}Z`;
}
