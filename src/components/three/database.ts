import * as THREE from "three";
import { BRAND } from "./core";

/**
 * The database: three stacked disks split by glowing grooves, the way a
 * database is drawn as an icon. Also the hero's smooth cube tiles.
 *
 * It is a custom lathe so each run of the profile can keep hard edges against
 * the next, and so every vertex can carry what part it is: `aPart.x` marks the
 * grooves, `aPart.y` the glow at the center of the top cap.
 */

type Run = {
  points: [number, number][];
  band?: number;
  /** Cap glow per point, defaults to 0. */
  glow?: number[];
};

function lathe(runs: Run[], segments: number) {
  const positions: number[] = [];
  const normals: number[] = [];
  const parts: number[] = [];
  const indices: number[] = [];

  for (const run of runs) {
    const pts = run.points;
    const ring0 = positions.length / 3;
    // Per point 2D normals, averaged with neighbours inside this run only.
    const n2: [number, number][] = pts.map((_, j) => {
      const prev = pts[Math.max(0, j - 1)];
      const next = pts[Math.min(pts.length - 1, j + 1)];
      const dr = next[0] - prev[0];
      const dy = next[1] - prev[1];
      const len = Math.hypot(dr, dy) || 1;
      // Rotating the tangent a quarter turn points it outward.
      return [-dy / len, dr / len];
    });

    for (let j = 0; j < pts.length; j++) {
      const [r, y] = pts[j];
      const [nr, ny] = n2[j];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const s = Math.sin(theta);
        const c = Math.cos(theta);
        positions.push(r * s, y, r * c);
        normals.push(nr * s, ny, nr * c);
        parts.push(run.band ?? 0, run.glow?.[j] ?? 0);
      }
    }
    for (let j = 0; j < pts.length - 1; j++) {
      for (let i = 0; i < segments; i++) {
        const a = ring0 + j * (segments + 1) + i;
        const b = a + segments + 1;
        const c = b + 1;
        const d = a + 1;
        indices.push(a, b, c, a, c, d);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("aPart", new THREE.Float32BufferAttribute(parts, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * The same profile idea as `lathe`, swept round a square instead of a circle:
 * each of the four faces is flat, so the profile only rounds the top edge.
 * Faces meet exactly at the corners, so the solid stays watertight.
 */
function squarePrism(runs: Run[]) {
  const positions: number[] = [];
  const normals: number[] = [];
  const parts: number[] = [];
  const indices: number[] = [];
  const faces = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];

  for (const run of runs) {
    const pts = run.points;
    const n2 = pts.map((_, j) => {
      const prev = pts[Math.max(0, j - 1)];
      const next = pts[Math.min(pts.length - 1, j + 1)];
      const dr = next[0] - prev[0];
      const dy = next[1] - prev[1];
      const len = Math.hypot(dr, dy) || 1;
      return [-dy / len, dr / len];
    });
    for (const [nx, nz] of faces) {
      // Along the face, perpendicular to its outward normal.
      const tx = -nz;
      const tz = nx;
      const base = positions.length / 3;
      for (let j = 0; j < pts.length; j++) {
        const [r, y] = pts[j];
        const [nr, ny] = n2[j];
        for (const side of [-1, 1]) {
          positions.push(r * nx + side * r * tx, y, r * nz + side * r * tz);
          normals.push(nr * nx, ny, nr * nz);
          parts.push(run.band ?? 0, run.glow?.[j] ?? 0);
        }
      }
      for (let j = 0; j < pts.length - 1; j++) {
        const a = base + j * 2;
        for (const [i0, i1, i2] of [
          [a, a + 1, a + 3],
          [a, a + 3, a + 2],
        ]) {
          // Wind each triangle so it faces the way its normals point.
          const p = (i: number) =>
            new THREE.Vector3().fromArray(positions, i * 3);
          const cross = p(i1)
            .sub(p(i0))
            .cross(p(i2).sub(p(i0)));
          const n = new THREE.Vector3().fromArray(normals, i0 * 3);
          if (cross.lengthSq() < 1e-12) continue;
          if (cross.dot(n) >= 0) indices.push(i0, i1, i2);
          else indices.push(i0, i2, i1);
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("aPart", new THREE.Float32BufferAttribute(parts, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * A smooth cube on a long shaft, for the hero's field: flat faces, a softly
 * rolled top edge, nothing else. Top sits at y = 0. `half` is half its width.
 */
export function createTileGeometry({
  half,
  shaft,
  roll = 3,
}: {
  half: number;
  shaft: number;
  /** Segments in the rolled top edge; 1 is a plain chamfer. */
  roll?: number;
}) {
  const bevel = half * 0.22;
  const cap: [number, number][] = [
    [0, 0],
    [half - bevel, 0],
  ];
  for (let k = 1; k <= roll; k++) {
    const a = (k / roll) * (Math.PI / 2);
    cap.push([
      half - bevel + Math.sin(a) * bevel,
      -bevel + Math.cos(a) * bevel,
    ]);
  }
  return squarePrism([
    { points: cap },
    {
      points: [
        [half, -bevel],
        [half, -shaft],
      ],
    },
  ]);
}

type DatabaseShape = {
  radius: number;
  /** Height of each of the three disks. */
  disk: number;
  /** How far the shaft runs below the last disk. 0 for a free-standing database. */
  shaft: number;
  segments: number;
  /** Fewer rings for columns far enough away that the roll is sub-pixel. */
  low?: boolean;
  /** Cap and wall only, for columns so far off the grooves would not show. */
  plain?: boolean;
};

/** Top of the database sits at y = 0 and it hangs downward. */
export function createDatabaseGeometry({
  radius: R,
  disk,
  shaft,
  segments,
  low = false,
  plain = false,
}: DatabaseShape) {
  const bevel = R * 0.16;
  const groove = disk * 0.16;
  const inset = R * 0.075;
  const edge = low ? 0 : R * 0.05;
  const runs: Run[] = [];

  // Top cap: flat, with a soft rolled edge.
  const cap: [number, number][] = [
    [0, 0],
    [R * 0.32, 0],
    [R - bevel, 0],
  ];
  const roll = low ? 1 : 4;
  for (let k = 1; k <= roll; k++) {
    const a = (k / roll) * (Math.PI / 2);
    cap.push([R - bevel + Math.sin(a) * bevel, -bevel + Math.cos(a) * bevel]);
  }
  runs.push({ points: cap, glow: [1, 0.22, 0, 0, 0, 0, 0] });
  if (plain) {
    runs.push({
      points: [
        [R, -bevel],
        [R, -shaft],
      ],
    });
    return lathe(runs, segments);
  }

  let top = -bevel;
  for (let k = 0; k < 3; k++) {
    const bottom = -(k + 1) * disk + (k < 2 ? groove / 2 : 0);
    const start = k === 0 ? top : top - edge;
    // Disk wall with a slight roll at each end.
    const wall: [number, number][] = [];
    if (k > 0 && edge) wall.push([R - edge, top]);
    wall.push([R, start]);
    wall.push([R, bottom + (k < 2 ? edge : 0)]);
    if (k < 2 && edge) wall.push([R - edge, bottom]);
    runs.push({ points: wall });

    if (k < 2) {
      // Groove between this disk and the next: the lit band.
      const lower = bottom - groove;
      runs.push({
        band: 1,
        points: [
          [R - edge, bottom],
          [R - inset, bottom - groove * 0.18],
          [R - inset, lower + groove * 0.18],
          [R - edge, lower],
        ],
      });
      top = lower;
    } else {
      top = bottom;
    }
  }

  if (shaft > 0) {
    // A thin lit seam where the database meets its shaft, then the shaft.
    runs.push({
      band: 0.55,
      points: [
        [R, top],
        [R - inset * 0.7, top - groove * 0.4],
        [R - inset * 0.7, top - groove * 0.9],
        [R, top - groove * 1.3],
      ],
    });
    runs.push({
      points: [
        [R, top - groove * 1.3],
        [R, -shaft],
      ],
    });
  } else {
    // Free-standing: close the bottom.
    runs.push({
      points: [
        [R, top],
        [R - edge, top - edge],
        [R * 0.5, top - edge],
        [0, top - edge],
      ],
    });
  }

  return lathe(runs, segments);
}

export type DatabaseUniforms = {
  uBand: { value: THREE.Color };
  uDeep: { value: THREE.Color };
  uLow: { value: THREE.Color };
  uGlow: { value: THREE.Color };
  uShadeDepth: { value: number };
  uBandBase: { value: number };
  uData: { value: THREE.Vector4 };
};

/**
 * White porcelain with lit grooves. Per instance `aData` drives it:
 * x = energy (how bright the grooves and cap glow), y = how far into the blue
 * of the troughs it sits, z = fade into the fog, w = glow from Coere's light.
 *
 * Without instancing, `aData` falls back to the `uData` uniform.
 */
export function createDatabaseMaterial({
  color = "#ffffff",
  band = BRAND[500],
  deep = "#a7b5dc",
  low = "#6a82f4",
  glow = BRAND[300],
  shadeDepth = 3.2,
  bandBase = 0.18,
  instanced = true,
}: {
  color?: string;
  band?: string;
  deep?: string;
  low?: string;
  glow?: string;
  shadeDepth?: number;
  bandBase?: number;
  instanced?: boolean;
} = {}) {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.4,
    metalness: 0,
    envMapIntensity: 0.6,
  });
  const uniforms: DatabaseUniforms = {
    uBand: { value: new THREE.Color(band) },
    uDeep: { value: new THREE.Color(deep) },
    uLow: { value: new THREE.Color(low) },
    uGlow: { value: new THREE.Color(glow) },
    uShadeDepth: { value: shadeDepth },
    uBandBase: { value: bandBase },
    uData: { value: new THREE.Vector4(0.4, 0, 0, 0) },
  };

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        attribute vec2 aPart;
        ${instanced ? "attribute vec4 aData;" : "uniform vec4 uData;"}
        varying vec2 vPart;
        varying vec4 vData;
        varying float vLocalY;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vPart = aPart;
        vData = ${instanced ? "aData" : "uData"};
        vLocalY = position.y;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform vec3 uBand;
        uniform vec3 uDeep;
        uniform vec3 uLow;
        uniform vec3 uGlow;
        uniform float uShadeDepth;
        uniform float uBandBase;
        varying vec2 vPart;
        varying vec4 vData;
        varying float vLocalY;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        // Troughs run blue, crests stay white.
        diffuseColor.rgb = mix(diffuseColor.rgb, uLow, clamp(vData.y, 0.0, 1.0));
        diffuseColor.rgb = mix(diffuseColor.rgb, uGlow, clamp(vData.w, 0.0, 1.0) * 0.6);
        // Walls darken the deeper they go, standing in for the light their
        // neighbours would block.
        float depthShade = smoothstep(0.0, 1.0, clamp(-vLocalY / uShadeDepth, 0.0, 1.0));
        diffuseColor.rgb = mix(diffuseColor.rgb, uDeep * mix(vec3(1.0), uLow, clamp(vData.y, 0.0, 1.0)), depthShade * 0.92);
        // Deep walls see little light at all, so the gaps between neighbours
        // fall dark instead of catching stray light.
        diffuseColor.rgb *= 1.0 - depthShade * 0.6;
        diffuseColor.rgb = mix(diffuseColor.rgb, uBand, vPart.x * 0.7);`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float energy = max(vData.x, 0.0);
        totalEmissiveRadiance += uBand * vPart.x * (uBandBase + energy * 1.4);
        totalEmissiveRadiance += uBand * vPart.y * energy * 1.2;`,
      )
      .replace(
        "#include <fog_fragment>",
        `#include <fog_fragment>
        #ifdef USE_FOG
        gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, clamp(vData.z, 0.0, 1.0));
        #endif`,
      );
  };
  // Distinguish the program from plain standard materials in the cache.
  material.customProgramCacheKey = () => `database-${instanced ? "i" : "s"}`;

  return { material, uniforms };
}
