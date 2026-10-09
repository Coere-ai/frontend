import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "./core";

/**
 * App icons for the Products picture: rounded tiles, white for the AIs that
 * feed Coere and brand blue for the things that read from it, and the white
 * symbols that sit on the blue ones. Symbols are drawn as filled shapes on a
 * 24 unit grid, like an icon set, then extruded with a soft bevel.
 */

export const TILE_SIZE = 1;
/** Corner radius of the face, about what a phone gives its app icons. */
const TILE_RADIUS = 0.23;
const TILE_BEVEL = 0.07;
const TILE_BODY = 0.12;
export const TILE_DEPTH = TILE_BODY + TILE_BEVEL * 2;

// ------------------------------------------------------------------ shapes

type Outline = THREE.Shape | THREE.Path;

/**
 * A rounded rectangle. Counterclockwise for a shape, clockwise for a hole,
 * which is what ExtrudeGeometry expects.
 */
function roundRect<T extends Outline>(
  target: T,
  cx: number,
  cy: number,
  w: number,
  h: number,
  r: number,
  clockwise = false,
) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const radius = Math.min(r, w / 2, h / 2);
  const corners: [number, number, number][] = [
    [x + w - radius, y + radius, -Math.PI / 2],
    [x + w - radius, y + h - radius, 0],
    [x + radius, y + h - radius, Math.PI / 2],
    [x + radius, y + radius, Math.PI],
  ];
  const ordered = clockwise ? [...corners].reverse() : corners;
  ordered.forEach(([px, py, start], i) => {
    const a0 = clockwise ? start + Math.PI / 2 : start;
    const a1 = clockwise ? start : start + Math.PI / 2;
    if (i === 0) {
      target.moveTo(px + Math.cos(a0) * radius, py + Math.sin(a0) * radius);
    }
    target.absarc(px, py, radius, a0, a1, clockwise);
  });
  target.closePath();
  return target;
}

const rect = (cx: number, cy: number, w: number, h: number, r: number) =>
  roundRect(new THREE.Shape(), cx, cy, w, h, r);
const rectHole = (cx: number, cy: number, w: number, h: number, r: number) =>
  roundRect(new THREE.Path(), cx, cy, w, h, r, true);

/** A rounded frame: an outer rounded rectangle less an inner one. */
function frame(
  cx: number,
  cy: number,
  w: number,
  h: number,
  r: number,
  inner: [number, number, number, number, number],
) {
  const shape = rect(cx, cy, w, h, r);
  shape.holes.push(rectHole(...inner));
  return shape;
}

function poly(points: [number, number][]) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  shape.closePath();
  return shape;
}

function circleHole(cx: number, cy: number, r: number) {
  const path = new THREE.Path();
  path.absarc(cx, cy, r, 0, Math.PI * 2, true);
  return path;
}

/** One band of a database drum: the strip between two lower half-ellipses. */
function drumBand(top: number, height: number, rx: number, ry: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-rx, top);
  shape.absellipse(0, top, rx, ry, Math.PI, Math.PI * 2, false, 0);
  shape.lineTo(rx, top - height);
  shape.absellipse(0, top - height, rx, ry, 0, Math.PI, true, 0);
  shape.closePath();
  return shape;
}

function ellipse(cx: number, cy: number, rx: number, ry: number) {
  const shape = new THREE.Shape();
  shape.absellipse(cx, cy, rx, ry, 0, Math.PI * 2, false, 0);
  return shape;
}

/**
 * Smooth normals across a bevel, but dead flat on the faces. A cap of an
 * extrusion has all its corners on the rim, so smoothing would tilt every one
 * of them and streak the face.
 */
function softEdges(geometry: THREE.BufferGeometry) {
  const smooth = toCreasedNormals(geometry, Math.PI / 4);
  const position = smooth.getAttribute("position");
  const normal = smooth.getAttribute("normal");
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  for (let i = 0; i < position.count; i += 3) {
    a.fromBufferAttribute(position, i);
    b.fromBufferAttribute(position, i + 1);
    c.fromBufferAttribute(position, i + 2);
    c.sub(b);
    b.sub(a);
    const face = b.cross(c).normalize();
    if (Math.abs(face.z) > 0.9999) {
      for (let k = 0; k < 3; k++) normal.setXYZ(i + k, 0, 0, Math.sign(face.z));
    }
  }
  smooth.computeBoundingSphere();
  return smooth;
}

// ------------------------------------------------------------------- tiles

let tileGeometry: THREE.BufferGeometry | null = null;

/** One rounded tile, shared by every icon. Centered, face toward +z. */
export function getTileGeometry() {
  if (tileGeometry) return tileGeometry;
  const inner = TILE_SIZE - TILE_BEVEL * 2;
  const extruded = new THREE.ExtrudeGeometry(
    rect(0, 0, inner, inner, TILE_RADIUS - TILE_BEVEL),
    {
      depth: TILE_BODY,
      curveSegments: 14,
      bevelEnabled: true,
      bevelThickness: TILE_BEVEL,
      bevelSize: TILE_BEVEL,
      bevelSegments: 6,
    },
  );
  extruded.translate(0, 0, -TILE_BODY / 2);
  tileGeometry = softEdges(extruded);
  return tileGeometry;
}

let brandGeometry: THREE.BufferGeometry | null = null;

/** The tile with a top-to-bottom sweep of brand blues baked in. */
export function getBrandTileGeometry() {
  if (brandGeometry) return brandGeometry;
  const geometry = getTileGeometry().clone();
  const position = geometry.getAttribute("position");
  const colors = new Float32Array(position.count * 3);
  const top = new THREE.Color(BRAND[400]);
  const bottom = new THREE.Color(BRAND[600]);
  const c = new THREE.Color();
  for (let i = 0; i < position.count; i++) {
    // A touch diagonal, lighter toward the top left, like the Coere mark.
    const t = THREE.MathUtils.clamp(
      (position.getY(i) - position.getX(i) * 0.35) / TILE_SIZE + 0.5,
      0,
      1,
    );
    c.copy(bottom).lerp(top, t);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  brandGeometry = geometry;
  return geometry;
}

/** Porcelain white, for the AI tiles. */
export function lightTileMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: "#fbfcff",
    roughness: 0.28,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    envMapIntensity: 0.85,
    emissive: new THREE.Color(BRAND[300]),
    emissiveIntensity: 0,
  });
}

/** Glossy brand blue, for the reader tiles. */
export function brandTileMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    vertexColors: true,
    roughness: 0.26,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 0.9,
    emissive: new THREE.Color(BRAND[400]),
    emissiveIntensity: 0,
  });
}

// ----------------------------------------------------------------- symbols

export type GlyphName =
  | "laptop"
  | "phone"
  | "watch"
  | "browser"
  | "chat"
  | "terminal"
  | "code"
  | "cube"
  | "database";

/** Each symbol on a 24 unit grid centered on the origin, y up. */
const GLYPHS: Record<GlyphName, () => THREE.Shape[]> = {
  laptop: () => [
    frame(0, 2.6, 17, 11.6, 1.8, [0, 2.8, 13.6, 8.4, 0.7]),
    rect(0, -5.4, 22, 2.4, 1.2),
  ],
  phone: () => [
    frame(0, 0, 12, 20, 3, [0, 0, 9, 17, 1.8]),
    // The pill at the top of the screen.
    rect(0, 6.6, 3.6, 1.2, 0.6),
  ],
  watch: () => [
    frame(0, 0, 12.6, 14, 3.6, [0, 0, 9.6, 11, 2.2]),
    rect(0, 9.1, 8, 3.6, 1.2),
    rect(0, -9.1, 8, 3.6, 1.2),
    rect(7.35, 1.4, 1.6, 3, 0.7),
  ],
  browser: () => {
    const shape = frame(0, 0, 21, 17, 2.4, [0, -1.6, 18, 11, 0.9]);
    [-7.2, -4.8, -2.4].forEach((x) =>
      shape.holes.push(circleHole(x, 6.15, 0.8)),
    );
    return [shape];
  },
  chat: () => {
    const bubble = rect(0, 1.6, 20, 14.5, 4.2);
    [-4.6, 0, 4.6].forEach((x) => bubble.holes.push(circleHole(x, 1.6, 1.35)));
    return [
      bubble,
      poly([
        [-5.8, -5.2],
        [-9, -10],
        [-0.6, -5.2],
      ]),
    ];
  },
  terminal: () => [
    frame(0, 0, 21, 17, 2.4, [0, 0, 18, 14, 0.9]),
    poly([
      [-6.6, 4],
      [-1.8, 0],
      [-6.6, -4],
      [-8, -2.7],
      [-4.6, 0],
      [-8, 2.7],
    ]),
    rect(3.2, -3.8, 6.4, 1.7, 0.6),
  ],
  code: () => [
    poly([
      [-4.2, 7.4],
      [-11, 0],
      [-4.2, -7.4],
      [-2.4, -5.6],
      [-7.6, 0],
      [-2.4, 5.6],
    ]),
    poly([
      [4.2, 7.4],
      [11, 0],
      [4.2, -7.4],
      [2.4, -5.6],
      [7.6, 0],
      [2.4, 5.6],
    ]),
    poly([
      [1.4, 9],
      [3.4, 9],
      [-1.4, -9],
      [-3.4, -9],
    ]),
  ],
  cube: () => [
    poly([
      [0, 10],
      [8.6, 5.2],
      [0, 0.6],
      [-8.6, 5.2],
    ]),
    poly([
      [-9.2, 3.6],
      [-0.9, -0.9],
      [-0.9, -10.6],
      [-9.2, -5.9],
    ]),
    poly([
      [9.2, 3.6],
      [0.9, -0.9],
      [0.9, -10.6],
      [9.2, -5.9],
    ]),
  ],
  // A drum seen from a little above: its lid, then two bands below it.
  database: () => [
    ellipse(0, 6.2, 8.6, 3.4),
    drumBand(4.6, 4.6, 8.6, 3.4),
    drumBand(-1.6, 4.6, 8.6, 3.4),
  ],
};

const glyphCache = new Map<GlyphName, THREE.BufferGeometry>();

/** A white symbol a little over half the width of a tile, face toward +z. */
export function getGlyphGeometry(name: GlyphName) {
  let geometry = glyphCache.get(name);
  if (geometry) return geometry;
  const extruded = new THREE.ExtrudeGeometry(GLYPHS[name](), {
    depth: 1.4,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.5,
    bevelSize: 0.35,
    bevelOffset: -0.15,
    bevelSegments: 3,
  });
  extruded.computeBoundingBox();
  const center = extruded.boundingBox!.getCenter(new THREE.Vector3());
  extruded.translate(-center.x, -center.y, -center.z);
  // Smooth at the drawing's own scale: the smoothing matches up vertices to
  // a hundredth of a unit, finer than a scaled-down bevel's steps.
  geometry = softEdges(extruded);
  const scale = 0.58 / 24;
  geometry.scale(scale, scale, scale);
  glyphCache.set(name, geometry);
  return geometry;
}

export function glyphMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 0.8,
    emissive: new THREE.Color("#ffffff"),
    emissiveIntensity: 0.18,
  });
}
