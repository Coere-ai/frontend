import * as THREE from "three";

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
      uHeight: { value: extent.y },
      // Drawing buffer height in pixels, for the fade at the foot.
      uViewHeight: { value: 1 },
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
      uniform float uViewHeight;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        // Gone toward the bottom of the screen, with the field.
        a *= smoothstep(0.0, 0.32, gl_FragCoord.y / uViewHeight);
        gl_FragColor = vec4(uColor, a * vAlpha * 0.55);
        #include <colorspace_fragment>
      }
    `,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return points;
}
