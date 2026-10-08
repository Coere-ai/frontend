import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import {
  mergeGeometries,
  toCreasedNormals,
} from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "./core";

/**
 * Turns the flat brand marks into solid, beveled 3D objects.
 *
 * Geometry comes from extruding each SVG path. Color comes from the SVG itself:
 * the original file is rasterized once to a texture, and every face samples it
 * at its own (x, y), so gradients like Gemini's or Copilot's survive intact and
 * the walls take the color of the edge they run along.
 */

const VIEWBOX = 24;
const TEXTURE_SIZE = 512;
const INK = "#10131c";

export type LogoAsset = {
  geometry: THREE.BufferGeometry;
  material: THREE.MeshPhysicalMaterial;
};

const cache = new Map<string, Promise<LogoAsset>>();

/** Loads and extrudes one of the AI marks in /public. Cached per URL. */
export function loadLogo(url: string) {
  let pending = cache.get(url);
  if (!pending) {
    pending = buildLogo(url);
    cache.set(url, pending);
    // Let a failed fetch be retried next time.
    pending.catch(() => cache.delete(url));
  }
  return pending;
}

/** Writes each vertex's own SVG position as its UV, for caps and walls alike. */
const planarUV = {
  generateTopUV(
    _geometry: THREE.ExtrudeGeometry,
    vertices: number[],
    a: number,
    b: number,
    c: number,
  ) {
    return [a, b, c].map(
      (i) => new THREE.Vector2(vertices[i * 3], vertices[i * 3 + 1]),
    );
  },
  generateSideWallUV(
    _geometry: THREE.ExtrudeGeometry,
    vertices: number[],
    a: number,
    b: number,
    c: number,
    d: number,
  ) {
    return [a, b, c, d].map(
      (i) => new THREE.Vector2(vertices[i * 3], vertices[i * 3 + 1]),
    );
  },
};

async function buildLogo(url: string): Promise<LogoAsset> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url}`);
  const svg = await response.text();

  const [geometry, texture] = await Promise.all([
    Promise.resolve(extrudeSvg(svg)),
    rasterize(svg),
  ]);

  const dark = /currentColor/.test(svg);
  const material = new THREE.MeshPhysicalMaterial({
    map: texture,
    roughness: dark ? 0.24 : 0.3,
    metalness: dark ? 0.15 : 0.02,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: dark ? 1.25 : 0.9,
  });

  return { geometry, material };
}

function extrudeSvg(svg: string) {
  // Geometry needs shapes only, so give every fill a plain color the parser
  // understands. The texture keeps the real colors.
  const solid = svg
    .replace(/fill="url\([^)]*\)"/g, 'fill="#000"')
    .replace(/currentColor/g, "#000");
  const data = new SVGLoader().parse(solid);

  const seen = new Set<string>();
  const parts: THREE.BufferGeometry[] = [];

  for (const path of data.paths) {
    const node = path.userData?.node as Element | undefined;
    const style = path.userData?.style as { fill?: string } | undefined;
    if (style?.fill === "none") continue;
    // Several marks stack the same outline under different gradients. One
    // solid is enough, since the texture already holds the blended color.
    const key = `${node?.getAttribute("d")}|${node?.getAttribute("transform")}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const shapes = path.toShapes();
    if (!shapes.length) continue;
    parts.push(
      new THREE.ExtrudeGeometry(shapes, {
        depth: 2.6,
        curveSegments: 10,
        bevelEnabled: true,
        bevelThickness: 0.42,
        bevelSize: 0.14,
        bevelOffset: -0.06,
        bevelSegments: 4,
        UVGenerator: planarUV,
      }),
    );
  }

  const merged = mergeGeometries(
    parts.map((part) => (part.index ? part.toNonIndexed() : part)),
    false,
  );
  parts.forEach((part) => part.dispose());
  if (!merged) throw new Error("Logo had no fillable paths");

  // SVG space is y-down. A half turn about X flips it upright without
  // mirroring, so the triangles keep facing outward.
  merged.rotateX(Math.PI);
  merged.computeBoundingBox();
  const box = merged.boundingBox!;
  const center = box.getCenter(new THREE.Vector3());
  merged.translate(-center.x, -center.y, -center.z);
  // Normalize against the 24 unit viewBox so every mark keeps its own
  // proportions and the set reads as one family.
  const scale = 1 / VIEWBOX;
  merged.scale(scale, scale, scale);
  // Smooth across the bevel, crisp where the bevel meets the face.
  const smooth = toCreasedNormals(merged, Math.PI / 5);
  merged.dispose();
  smooth.computeBoundingSphere();
  return smooth;
}

async function rasterize(svg: string) {
  const sized = svg
    .replace(/currentColor/g, INK)
    .replace(/(\s)width="[^"]*"/, `$1width="${TEXTURE_SIZE}"`)
    .replace(/(\s)height="[^"]*"/, `$1height="${TEXTURE_SIZE}"`);
  const blobUrl = URL.createObjectURL(
    new Blob([sized], { type: "image/svg+xml" }),
  );
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = blobUrl;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = TEXTURE_SIZE;
    const ctx = canvas.getContext("2d")!;
    // Bleed each color outward past its edge, so walls and bevels that sample
    // just outside the outline still find the right color.
    for (const radius of [14, 9, 5, 2.5]) {
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2;
        ctx.drawImage(
          image,
          Math.cos(a) * radius,
          Math.sin(a) * radius,
          TEXTURE_SIZE,
          TEXTURE_SIZE,
        );
      }
    }
    ctx.drawImage(image, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.anisotropy = 4;
    // UVs are in viewBox units, so map 0..24 onto 0..1.
    texture.repeat.set(1 / VIEWBOX, 1 / VIEWBOX);
    texture.needsUpdate = true;
    return texture;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

/** The Coere mark: one blade, mirrored through the center, as in logo.tsx. */
const BLADE: [number, number][] = [
  [42, 460],
  [88, 190],
  [220, 58],
  [332, 170],
  [168, 334],
];

let coereGeometry: THREE.BufferGeometry | null = null;

export function coereMarkGeometry() {
  if (coereGeometry) return coereGeometry;
  const toShape = (points: [number, number][]) => {
    const shape = new THREE.Shape();
    points.forEach(([x, y], i) => {
      // y-down SVG to y-up, centered on the 512 viewBox.
      const px = x - 256;
      const py = 256 - y;
      if (i === 0) shape.moveTo(px, py);
      else shape.lineTo(px, py);
    });
    shape.closePath();
    return shape;
  };
  const blade = toShape(BLADE);
  const mirrored = toShape(BLADE.map(([x, y]) => [512 - x, 512 - y]));

  const geometry = new THREE.ExtrudeGeometry([blade, mirrored], {
    depth: 64,
    curveSegments: 1,
    bevelEnabled: true,
    bevelThickness: 16,
    bevelSize: 11,
    bevelOffset: -5,
    bevelSegments: 6,
  });
  geometry.computeBoundingBox();
  const center = geometry.boundingBox!.getCenter(new THREE.Vector3());
  geometry.translate(-center.x, -center.y, -center.z);
  const scale = 1 / 512;
  geometry.scale(scale, scale, scale);
  const smooth = toCreasedNormals(geometry, Math.PI / 5);
  geometry.dispose();

  // A diagonal sweep from a bright periwinkle at the top left to the deep
  // brand blue at the bottom right, so the solid reads with depth.
  const position = smooth.getAttribute("position");
  const colors = new Float32Array(position.count * 3);
  const light = new THREE.Color(BRAND[400]);
  const deep = new THREE.Color(BRAND[600]);
  const c = new THREE.Color();
  for (let i = 0; i < position.count; i++) {
    const t = THREE.MathUtils.clamp(
      (position.getX(i) - position.getY(i)) * 0.85 + 0.5,
      0,
      1,
    );
    c.copy(light).lerp(deep, t);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  smooth.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  smooth.computeBoundingSphere();
  coereGeometry = smooth;
  return smooth;
}

export function coereMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    vertexColors: true,
    roughness: 0.18,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    emissive: new THREE.Color(BRAND[600]),
    emissiveIntensity: 0.12,
    envMapIntensity: 1.2,
  });
}

/** A Coere mark mesh, one unit across the viewBox. */
export function createCoereMark() {
  const mesh = new THREE.Mesh(coereMarkGeometry(), coereMaterial());
  mesh.castShadow = true;
  return mesh;
}
