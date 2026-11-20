import { type Placed, poseAt } from "./layout";
import type { Rgb } from "./palette";
import type { Frame, LogoFrame } from "./renderer";

/** A placed logo with its sampled grid and the color it throws on the wall. */
export type SceneLogo = { placed: Placed; grid: number; tint: Rgb };

/** What the frame loop knows at one moment. */
export type SceneState = {
  width: number;
  height: number;
  dpr: number;
  scale: number;
  time: number;
  intro: number;
  motion: number;
  /** Pointer x and y in the wall's own pixels, and how present it is from 0 to 1. */
  pointer: readonly [number, number, number];
  wallCell: number;
  logos: SceneLogo[];
};

/** Light comes from the upper left and a little in front, so shade falls down and right. */
const LIGHT: readonly [number, number, number] = (() => {
  const v = [-0.55, -0.62, 0.56];
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l] as const;
})();

/** A turn about y, then x, then z, as the column major matrix GLSL reads. */
function rotation(yaw: number, pitch: number, roll: number): Float32Array {
  const [cy, sy, cp, sp, cr, sr] = [Math.cos(yaw), Math.sin(yaw), Math.cos(pitch), Math.sin(pitch), Math.cos(roll), Math.sin(roll)];
  // R = Ry * Rx * Rz, written out by column.
  return new Float32Array([
    cy * cr + sy * sp * sr, cp * sr, -sy * cr + cy * sp * sr,
    -cy * sr + sy * sp * cr, cp * cr, sy * sr + cy * sp * cr,
    sy * cp, -sp, cy * cp,
  ]);
}

/**
 * Turns the moment into a frame. Each logo rests on a spot given in screen
 * terms, so its world position is the screen spot pulled back by its own
 * perspective: depth then changes its size and light without moving it off
 * its place. Far logos are dimmer and softer, like air between them.
 */
export function frameFor(s: SceneState): Frame {
  const focal = Math.max(s.width, s.height) * 0.9;
  const logos: (LogoFrame & { depth: number })[] = s.logos.map(({ placed, grid, tint }, slot) => {
    const pose = poseAt(placed, s.time, s.motion);
    const z = placed.z + pose.z;
    const persp = focal / (focal - z);
    const sx = placed.x * s.width * 0.46 + pose.x;
    const sy = placed.y * s.height * 0.44 + pose.y;
    const screenSize = placed.size * s.scale;
    const center = placed.id === "coere";
    const delay = center ? 0.7 : 0.1 + placed.index * 0.08;
    const dim = (center ? 1.25 : 1) * (1 + Math.min(Math.max(z / 900, -0.3), 0.12));
    const arrived = Math.min(Math.max((s.intro - delay) / 2, 0), 1);
    return {
      slot,
      depth: z,
      center: [sx / persp, sy / persp, z],
      rot: rotation(pose.yaw, pose.pitch, pose.roll),
      size: screenSize / persp,
      grid,
      dim,
      blur: Math.min(Math.max(-z / 600, 0), 1) * 0.2,
      delay,
      spot: [s.width / 2 + sx, s.height / 2 + sy, screenSize * 0.5, dim * arrived * (center ? 1.2 : 0.8)],
      tint,
    };
  });
  logos.sort((a, b) => a.depth - b.depth);
  const [px, py, pin] = s.pointer;
  return {
    width: s.width,
    height: s.height,
    dpr: s.dpr,
    time: s.time,
    intro: s.intro,
    motion: Math.min(s.motion, 1),
    tilt: [((px / s.width - 0.5) * 0.16 * pin * s.motion), ((py / s.height - 0.5) * -0.1 * pin * s.motion)],
    pointer: [px, py, pin * Math.min(s.motion, 1)],
    focal,
    wallCell: s.wallCell,
    gap: 0.24,
    glow: 0.8,
    light: LIGHT,
    shadow: [0.12, 0.2],
    haze: [0.06, 0.1, 0.26],
    spark: [0.35, 0.65, 1],
    logos,
  };
}
