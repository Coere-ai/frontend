import * as THREE from "three";
import { BRAND } from "./core";

/**
 * The hero's databases: smooth cubes on long shafts, packed into a field, and
 * the porcelain material they share. Each cube is swept from a 2D profile in
 * runs, so each run can keep a hard edge against the next.
 */

type Run = {
  points: [number, number][];
  /** Exact 2D (radial, up) normals per point; estimated from the run if absent. */
  normals?: [number, number][];
};

/** Per point 2D normals, averaged with neighbours inside the run only. */
function runNormals(run: Run): [number, number][] {
  if (run.normals) return run.normals;
  const pts = run.points;
  return pts.map((_, j) => {
    const prev = pts[Math.max(0, j - 1)];
    const next = pts[Math.min(pts.length - 1, j + 1)];
    const dr = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const len = Math.hypot(dr, dy) || 1;
    // Rotating the tangent a quarter turn points it outward.
    return [-dy / len, dr / len];
  });
}

/**
 * A profile swept round a square: each of the four faces is flat, so the
 * profile only rounds the top edge. Faces meet exactly at the corners, so the
 * solid stays watertight.
 */
function squarePrism(runs: Run[]) {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const faces = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];

  for (const run of runs) {
    const pts = run.points;
    const n2 = runNormals(run);
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
  // Exact normals, so the roll meets the flat top and the wall without a crease.
  const normals: [number, number][] = [
    [0, 1],
    [0, 1],
  ];
  for (let k = 1; k <= roll; k++) {
    const a = (k / roll) * (Math.PI / 2);
    cap.push([
      half - bevel + Math.sin(a) * bevel,
      -bevel + Math.cos(a) * bevel,
    ]);
    normals.push([Math.sin(a), Math.cos(a)]);
  }
  return squarePrism([
    { points: cap, normals },
    {
      points: [
        [half, -bevel],
        [half, -shaft],
      ],
    },
  ]);
}

/**
 * White porcelain for the instanced field. Per instance `aData` drives it:
 * y = how far into the blue of the troughs it sits, z = fade into the fog,
 * w = glow from the light under an agent. x is unused.
 *
 * Toward the bottom of the screen the field pales and dissolves into white,
 * so it runs on into the page below with no edge. `viewHeight` is the height
 * of the drawing buffer in pixels; keep it current.
 */
export function createDatabaseMaterial({
  color = "#ffffff",
  deep = "#a7b5dc",
  low = "#6a82f4",
  glow = BRAND[300],
  shadeDepth = 3.2,
}: {
  color?: string;
  deep?: string;
  low?: string;
  glow?: string;
  shadeDepth?: number;
} = {}) {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.4,
    metalness: 0,
    envMapIntensity: 0.6,
  });
  const uniforms = {
    uDeep: { value: new THREE.Color(deep) },
    uLow: { value: new THREE.Color(low) },
    uGlow: { value: new THREE.Color(glow) },
    uShadeDepth: { value: shadeDepth },
    uViewHeight: { value: 1 },
  };

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        attribute vec4 aData;
        varying vec4 vData;
        varying float vLocalY;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vData = aData;
        vLocalY = position.y;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform vec3 uDeep;
        uniform vec3 uLow;
        uniform vec3 uGlow;
        uniform float uShadeDepth;
        uniform float uViewHeight;
        varying vec4 vData;
        varying float vLocalY;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        // 1 at the bottom of the screen, easing to 0 a third of the way up.
        float footFade = 1.0 - smoothstep(0.0, 0.32, gl_FragCoord.y / uViewHeight);
        // Troughs run blue, crests stay white; the blue gives way near the foot.
        float lowTint = clamp(vData.y, 0.0, 1.0) * (1.0 - footFade * 0.85);
        diffuseColor.rgb = mix(diffuseColor.rgb, uLow, lowTint);
        diffuseColor.rgb = mix(diffuseColor.rgb, uGlow, clamp(vData.w, 0.0, 1.0) * 0.6);
        // Walls darken the deeper they go, standing in for the light their
        // neighbours would block.
        float depthShade = smoothstep(0.0, 1.0, clamp(-vLocalY / uShadeDepth, 0.0, 1.0));
        diffuseColor.rgb = mix(diffuseColor.rgb, uDeep * mix(vec3(1.0), uLow, lowTint), depthShade * 0.92);
        // Deep walls see little light at all, so the gaps between neighbours
        // fall dark instead of catching stray light.
        diffuseColor.rgb *= 1.0 - depthShade * 0.6;`,
      )
      .replace(
        "#include <fog_fragment>",
        `#include <fog_fragment>
        #ifdef USE_FOG
        gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, clamp(vData.z, 0.0, 1.0));
        #endif
        // Eased, so the fade starts too softly to see where it begins.
        gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0), footFade * footFade);`,
      );
  };
  // Distinguish the program from plain standard materials in the cache.
  material.customProgramCacheKey = () => "database";

  return { material, viewHeight: uniforms.uViewHeight };
}
