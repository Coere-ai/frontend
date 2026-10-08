import * as THREE from "three";
import { cubicBezier } from "./core";

/**
 * A ribbon that follows a cubic bezier, evaluated on the GPU so its four
 * control points can move every frame for free. Pulses run along it in both
 * directions: deep blue ones flowing in (start to end) and pale ones flowing
 * back out, which is the whole idea of the page in one line.
 */
export class FlowLine {
  readonly mesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  readonly p0 = new THREE.Vector3();
  readonly p1 = new THREE.Vector3();
  readonly p2 = new THREE.Vector3();
  readonly p3 = new THREE.Vector3();

  constructor({
    segments = 80,
    width = 0.035,
    inColor = "#3f4ceb",
    outColor = "#8fa0ff",
    baseColor = "#7f8bfa",
    opacity = 1,
    seed = 0,
  } = {}) {
    const ts: number[] = [];
    const sides: number[] = [];
    const positions: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      ts.push(t, t);
      sides.push(-1, 1);
      positions.push(0, 0, 0, 0, 0, 0);
      if (i < segments) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("aT", new THREE.Float32BufferAttribute(ts, 1));
    geometry.setAttribute("aSide", new THREE.Float32BufferAttribute(sides, 1));
    geometry.setIndex(indices);

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uP0: { value: this.p0 },
        uP1: { value: this.p1 },
        uP2: { value: this.p2 },
        uP3: { value: this.p3 },
        uWidth: { value: width },
        uTime: { value: 0 },
        uSeed: { value: seed },
        uOpacity: { value: opacity },
        uIn: { value: new THREE.Color(inColor) },
        uOut: { value: new THREE.Color(outColor) },
        uBase: { value: new THREE.Color(baseColor) },
        uHighlight: { value: 0 },
      },
      vertexShader: /* glsl */ `
        uniform vec3 uP0;
        uniform vec3 uP1;
        uniform vec3 uP2;
        uniform vec3 uP3;
        uniform float uWidth;
        attribute float aT;
        attribute float aSide;
        varying float vT;
        varying float vSide;

        vec3 bezier(float t) {
          float s = 1.0 - t;
          return s * s * s * uP0 + 3.0 * s * s * t * uP1 + 3.0 * s * t * t * uP2 + t * t * t * uP3;
        }
        vec3 bezierTangent(float t) {
          float s = 1.0 - t;
          return 3.0 * s * s * (uP1 - uP0) + 6.0 * s * t * (uP2 - uP1) + 3.0 * t * t * (uP3 - uP2);
        }

        void main() {
          vec4 mv = modelViewMatrix * vec4(bezier(aT), 1.0);
          vec3 tangent = (modelViewMatrix * vec4(bezierTangent(aT), 0.0)).xyz;
          vec2 dir = tangent.xy;
          float len = length(dir);
          vec2 normal = len > 1e-5 ? vec2(-dir.y, dir.x) / len : vec2(0.0, 1.0);
          float taper = smoothstep(0.0, 0.08, aT) * smoothstep(1.0, 0.9, aT);
          mv.xy += normal * aSide * uWidth * (0.3 + 0.7 * taper);
          gl_Position = projectionMatrix * mv;
          vT = aT;
          vSide = aSide;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uSeed;
        uniform float uOpacity;
        uniform float uHighlight;
        uniform vec3 uIn;
        uniform vec3 uOut;
        uniform vec3 uBase;
        varying float vT;
        varying float vSide;

        void main() {
          float edge = 1.0 - smoothstep(0.35, 1.0, abs(vSide));
          float ends = smoothstep(0.0, 0.07, vT) * smoothstep(1.0, 0.9, vT);

          // In: heads travel from start to end with a long tail behind.
          float pin = fract(vT * 2.2 - uTime * 0.55 + uSeed);
          float inPulse = pow(pin, 14.0);
          // Out: smaller, quicker, the other way.
          float pout = fract((1.0 - vT) * 3.0 - uTime * 0.8 + uSeed * 1.7);
          float outPulse = pow(pout, 22.0);

          vec3 color = uBase;
          color = mix(color, uOut, outPulse);
          color = mix(color, uIn, inPulse);
          float alpha = (0.34 + 0.3 * uHighlight + inPulse * 0.66 + outPulse * 0.5) * edge * ends * uOpacity;
          gl_FragColor = vec4(color, alpha);
          #include <colorspace_fragment>
        }
      `,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 2;
  }

  set time(value: number) {
    this.mesh.material.uniforms.uTime.value = value;
  }

  set opacity(value: number) {
    this.mesh.material.uniforms.uOpacity.value = value;
    this.mesh.visible = value > 0.002;
  }

  set highlight(value: number) {
    this.mesh.material.uniforms.uHighlight.value = value;
  }

  /** Position along the curve, for anything that rides it. */
  pointAt(t: number, out: THREE.Vector3) {
    return cubicBezier(this.p0, this.p1, this.p2, this.p3, t, out);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

/** Soft round specks drifting in the air, for depth. */
export function createDust(
  count: number,
  extent: THREE.Vector3,
  color: string,
  seed = 1,
) {
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rand() - 0.5) * extent.x;
    positions[i * 3 + 1] = rand() * extent.y;
    positions[i * 3 + 2] = (rand() - 0.5) * extent.z;
    scales[i] = 0.4 + rand() * 0.9;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 1 },
      uHeight: { value: extent.y },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uHeight;
      attribute float aScale;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.y = mod(p.y + uTime * 0.12 * aScale, uHeight);
        p.x += sin(uTime * 0.3 + position.z) * 0.4;
        p.z += cos(uTime * 0.25 + position.x) * 0.4;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aScale * 9.0 * uPixelRatio / max(1.0, -mv.z * 0.25);
        // Fade in from the floor and out at the ceiling.
        vAlpha = smoothstep(0.0, 1.5, p.y) * (1.0 - smoothstep(uHeight - 2.0, uHeight, p.y));
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(uColor, a * vAlpha * 0.55 * uOpacity);
        #include <colorspace_fragment>
      }
    `,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return points;
}
