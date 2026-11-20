import type { MatrixLogoId } from "./logos";

/**
 * Where a logo rests: `x` and `y` from -1 to 1 across the half width and
 * half height of the wall, `z` its depth in pixels (positive comes toward
 * the viewer) and `size` its width on screen in pixels at the reference
 * width. Spots are placed on screen, so a far logo lands where it is drawn
 * and only its size and light tell its depth.
 */
type Spot = { x: number; y: number; z: number; size: number };

/** A logo placed on the wall, with the numbers its drift path needs. */
export type Placed = Spot & { id: MatrixLogoId; index: number; phase: number };

/** How the logos share the wall: `center` rings them round the Coere mark, `frame` keeps the middle band clear for a hero's words and app. */
export type MatrixLayout = "center" | "frame";

/** The bright center mark first, then the rest from nearest to farthest. */
const WIDE_CENTER: Spot[] = [
  { x: 0.0, y: 0.0, z: 140, size: 300 },
  { x: -0.78, y: -0.56, z: 80, size: 200 },
  { x: 0.64, y: -0.6, z: 160, size: 215 },
  { x: -0.44, y: 0.64, z: -100, size: 180 },
  { x: 0.84, y: 0.1, z: -20, size: 185 },
  { x: -0.9, y: 0.12, z: -220, size: 160 },
  { x: 0.3, y: 0.7, z: 60, size: 185 },
  { x: -0.3, y: -0.78, z: -280, size: 150 },
  { x: 0.34, y: -0.22, z: -440, size: 140 },
  { x: 0.82, y: 0.78, z: 200, size: 190 },
  { x: -0.42, y: 0.0, z: -500, size: 130 },
];

/** Bands above and below a hero's copy and app, with the Coere mark over the gap between them. */
const WIDE_FRAME: Spot[] = [
  { x: -0.06, y: -0.8, z: 150, size: 190 },
  { x: -0.84, y: -0.78, z: 60, size: 175 },
  { x: 0.86, y: -0.74, z: 160, size: 190 },
  { x: -0.5, y: -0.9, z: -200, size: 140 },
  { x: 0.06, y: 0.84, z: 170, size: 175 },
  { x: -0.88, y: 0.8, z: 80, size: 165 },
  { x: -0.42, y: 0.88, z: -120, size: 150 },
  { x: 0.26, y: -0.92, z: -320, size: 125 },
  { x: 0.52, y: 0.9, z: -60, size: 160 },
  { x: 0.92, y: 0.78, z: 110, size: 170 },
  { x: -0.98, y: 0.02, z: -380, size: 130 },
];

/** A phone held upright: fewer, smaller logos stacked around the copy. */
const TALL_CENTER: Spot[] = [
  { x: 0, y: -0.04, z: 100, size: 170 },
  { x: -0.62, y: -0.7, z: 40, size: 112 },
  { x: 0.6, y: -0.5, z: 120, size: 118 },
  { x: -0.64, y: 0.46, z: -80, size: 106 },
  { x: 0.62, y: 0.68, z: 60, size: 112 },
  { x: 0.7, y: 0.1, z: -200, size: 92 },
  { x: -0.7, y: -0.12, z: -260, size: 90 },
  { x: 0.02, y: 0.86, z: -300, size: 90 },
  { x: 0.04, y: -0.9, z: -340, size: 86 },
];

/** Upright, with the copy filling the middle: the logos keep to the sides and the ends. */
const TALL_FRAME: Spot[] = [
  { x: 0.62, y: -0.86, z: 120, size: 120 },
  { x: -0.7, y: -0.9, z: 40, size: 100 },
  { x: 0.84, y: -0.3, z: -120, size: 84 },
  { x: -0.86, y: 0.2, z: -80, size: 88 },
  { x: 0.82, y: 0.46, z: 60, size: 96 },
  { x: -0.66, y: 0.9, z: 80, size: 104 },
  { x: 0.4, y: 0.94, z: -200, size: 86 },
  { x: -0.9, y: -0.4, z: -260, size: 80 },
  { x: 0.0, y: -0.96, z: -300, size: 78 },
];

const SPOTS: Record<MatrixLayout, { wide: Spot[]; tall: Spot[] }> = {
  center: { wide: WIDE_CENTER, tall: TALL_CENTER },
  frame: { wide: WIDE_FRAME, tall: TALL_FRAME },
};

/** A portrait wall uses the tall spots; the reference widths size the logos. */
export function isTall(width: number, height: number): boolean {
  return width < 640 || height > width * 1.15;
}

/**
 * Puts the logos on spots. The Coere mark takes the center spot when it
 * is asked for; the AIs take the others in order, up to `max` in all.
 */
export function placeLogos(ids: readonly MatrixLogoId[], layout: MatrixLayout, tall: boolean, max: number): Placed[] {
  const spots = tall ? SPOTS[layout].tall : SPOTS[layout].wide;
  const center = ids.includes("coere");
  const rest = ids.filter((id) => id !== "coere");
  const placed: Placed[] = [];
  if (center) placed.push({ ...spots[0], id: "coere", index: 0, phase: 0.37 });
  rest.slice(0, Math.min(max, spots.length) - placed.length).forEach((id, i) => {
    placed.push({ ...spots[i + 1], id, index: placed.length, phase: ((i + 1) * 0.618034) % 1 });
  });
  return placed;
}

/** How much bigger than the reference width the wall is, kept in a sane range. */
export function wallScale(width: number, tall: boolean): number {
  return tall ? Math.min(Math.max(width / 390, 0.85), 1.6) : Math.min(Math.max(width / 1440, 0.6), 1.25);
}

/** A logo's pose at time `t`: where it is, how it is turned, and how far it has drifted. */
export type Pose = { x: number; y: number; z: number; yaw: number; pitch: number; roll: number };

/**
 * The slow path each logo drifts on: two sines a side at speeds that never
 * line up, so no two logos move together and the loop never shows. Each
 * logo also leans toward the center, as if the wall curves around it.
 */
export function poseAt(p: Placed, t: number, amount: number): Pose {
  const a = p.phase * Math.PI * 2;
  const s = 0.75 + p.phase * 0.5;
  return {
    x: (Math.sin(t * 0.11 * s + a) * 26 + Math.sin(t * 0.047 + a * 3) * 14) * amount,
    y: (Math.cos(t * 0.09 * s + a * 2) * 20 + Math.sin(t * 0.061 + a) * 8) * amount,
    z: Math.sin(t * 0.07 + a * 5) * 70 * amount,
    yaw: -p.x * 0.34 + Math.sin(t * 0.13 * s + a) * 0.2 * amount,
    pitch: p.y * 0.26 + Math.cos(t * 0.1 + a * 4) * 0.15 * amount,
    roll: Math.sin(t * 0.06 + a * 2) * 0.06 * amount,
  };
}
