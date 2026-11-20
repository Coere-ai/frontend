/**
 * The passes of the LED wall. The wall passes fill the screen with dim
 * square cells, the light that spills from each logo and the shade each
 * one casts. The cell pass draws every lit logo cell as its own square,
 * with the light, wave and shimmer worked out per cell on the GPU so the
 * CPU only moves a dozen logos a frame.
 */

/** Everything the wall pass needs: up to this many logos light it. */
export const MAX_SPOTS = 12;

export const WALL_VERT = `#version 300 es
in vec2 aCorner;
void main() { gl_Position = vec4(aCorner, 0.0, 1.0); }
`;

/**
 * The wall's light, worked out once per cell into a small texture (one
 * texel a cell) instead of once per screen pixel: the spill from every logo
 * is the costly part, and a cell is one color anyway. Stored at half
 * strength so dim cells keep more steps of brightness in 8 bits.
 */
export const WALL_CELLS_FRAG = `#version 300 es
precision highp float;
uniform vec2 uView;
uniform float uCell;
uniform float uTime;
uniform float uMotion;
uniform int uCount;
uniform vec4 uSpot[${MAX_SPOTS}];
uniform vec3 uTint[${MAX_SPOTS}];
uniform vec2 uShadow;
uniform vec3 uPointer;
uniform vec3 uHaze;
uniform vec3 uSpark;
out vec4 frag;

// A sine free hash: a sine hash lines its sparkles up in diagonal rows.
float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

void main() {
  vec2 id = floor(gl_FragCoord.xy);
  vec2 c = (id + 0.5) * uCell;
  vec2 q = (c - uView * vec2(0.5, 0.46)) / max(uView.x, uView.y);
  float haze = exp(-dot(q, q) * 4.5);
  float r = hash(id);
  float wave = 0.5 + 0.5 * sin(dot(c, vec2(0.0058, 0.0031)) - uTime * 0.85);
  vec3 col = uHaze * (0.13 + 0.42 * haze) * (0.75 + 0.45 * wave * uMotion) * (0.7 + 0.6 * r);

  float shade = 1.0;
  for (int i = 0; i < ${MAX_SPOTS}; i++) {
    if (i >= uCount) break;
    vec4 s = uSpot[i];
    vec2 d = (c - s.xy) / s.z;
    col += uTint[i] * exp(-dot(d, d) * 0.8) * s.w * 0.2;
    vec2 ds = (c - s.xy - uShadow * s.z) / (s.z * 0.8);
    shade *= 1.0 - 0.75 * exp(-dot(ds, ds) * 1.6) * min(s.w, 1.0);
    shade *= 1.0 - 0.8 * smoothstep(1.0, 0.45, length(d)) * min(s.w, 1.0);
  }
  vec2 dp = c - uPointer.xy;
  col += uSpark * exp(-dot(dp, dp) / (240.0 * 240.0)) * 0.07 * uPointer.z;
  float tw = step(0.993, r) * pow(0.5 + 0.5 * sin(uTime * (0.6 + fract(r * 91.0) * 1.8) + r * 50.0), 8.0);
  col += uSpark * tw * 0.45 * mix(0.35, 1.0, uMotion);
  frag = vec4(col * shade * 0.5, 1.0);
}
`;

/** Draws each wall cell as a square with a dark gap round it, plus a soft haze the grid does not cut. */
export const WALL_SHOW_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uCells;
uniform vec2 uView;
uniform float uDpr;
uniform float uCell;
uniform float uGap;
uniform vec3 uHaze;
out vec4 frag;

void main() {
  vec2 px = vec2(gl_FragCoord.x, uView.y * uDpr - gl_FragCoord.y) / uDpr;
  vec2 id = floor(px / uCell);
  vec2 f = px / uCell - id - 0.5;
  vec3 col = texelFetch(uCells, ivec2(id), 0).rgb * 2.0;
  vec2 q = ((id + 0.5) * uCell - uView * vec2(0.5, 0.46)) / max(uView.x, uView.y);
  float aa = 0.5 / (uCell * uDpr);
  // The gap never closes below one device pixel, so the grid stays visible on a plain screen.
  float gap = max(uGap, 1.0 / (uCell * uDpr));
  float core = 1.0 - smoothstep(-aa, aa, max(abs(f.x), abs(f.y)) - (0.5 - gap * 0.5));
  vec3 dark = vec3(0.004, 0.006, 0.014);
  vec3 glow = uHaze * 0.05 * exp(-dot(q, q) * 3.0);
  float vignette = 1.0 - 0.45 * smoothstep(0.15, 0.6, length(q));
  frag = vec4((mix(dark, col, core) + glow) * vignette, 1.0);
}
`;

export const CELL_VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec2 aOffset;
layout(location = 2) in vec3 aColor;
layout(location = 3) in vec3 aBevel;
layout(location = 4) in float aSeed;
uniform vec2 uView;
uniform float uDpr;
uniform float uFocal;
uniform vec2 uTilt;
uniform vec3 uCenter;
uniform mat3 uRot;
uniform float uSize;
uniform float uGrid;
uniform float uDim;
uniform float uBlur;
uniform float uDelay;
uniform float uIntro;
uniform float uTime;
uniform float uMotion;
uniform vec3 uPointer;
uniform vec3 uLight;
uniform float uGlow;
uniform float uGap;
out vec2 vLocal;
out vec3 vColor;
out float vHalo;
out float vSoft;
out float vGap;

// The same kind of sine free hash, three values from one seed.
vec3 hash3(float p) {
  vec3 q = fract(vec3(p) * vec3(0.1031, 0.103, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.xxy + q.yzz) * q.zyx);
}

vec3 tilt(vec3 p) {
  float cy = cos(uTilt.x), sy = sin(uTilt.x), cp = cos(uTilt.y), sp = sin(uTilt.y);
  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  return vec3(p.x, cp * p.y - sp * p.z, sp * p.y + cp * p.z);
}

void main() {
  vec3 h = hash3(aSeed * 8191.0 + uDelay * 977.0);
  vec3 rest = uCenter + uRot * vec3(aOffset * uSize, 0.0);

  // The cells fly in from scattered points and curl into place.
  float k = clamp((uIntro - uDelay - h.x * 0.9) / 1.5, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - k, 3.0);
  float fly = 1.0 - e;
  vec3 p = mix(rest + (h * 2.0 - 1.0) * vec3(uView.x * 0.8, uView.y * 0.8, 700.0), rest, e);
  float turn = fly * 2.2 * (h.z - 0.5);
  vec2 around = p.xy - uCenter.xy;
  p.xy = uCenter.xy + mat2(cos(turn), sin(turn), -sin(turn), cos(turn)) * around;

  p = tilt(p);
  float persp = uFocal / max(uFocal - p.z, 1.0);
  vec2 screen = uView * 0.5 + p.xy * persp;

  vec2 d = screen - uPointer.xy;
  float near = exp(-dot(d, d) / (150.0 * 150.0)) * uPointer.z;
  screen += d / (length(d) + 1.0) * near * 24.0;

  // Light from one side: the bevel catches it and the side of the logo nearer it glows more.
  vec3 n = tilt(normalize(uRot * vec3(aBevel.xy, 1.0)));
  float diff = max(dot(n, uLight), 0.0);
  float spec = pow(max(dot(n, normalize(uLight + vec3(0.0, 0.0, 1.0))), 0.0), 26.0);
  float lit = 0.8 + 0.5 * dot(aOffset, normalize(uLight.xy));

  float wave = 0.5 + 0.5 * sin(dot(screen, vec2(0.0058, 0.0031)) - uTime * 0.85);
  float wave2 = 0.5 + 0.5 * sin(dot(screen, vec2(-0.0021, 0.0049)) + uTime * 0.53);
  float shimmer = 0.5 + 0.5 * sin(uTime * (1.3 + h.y * 2.6) + h.z * 6.2831);
  float b = aBevel.z * uDim * (0.32 + 0.78 * diff) * lit * (0.92 + 0.16 * h.y);
  b *= mix(1.0, 0.74 + 0.36 * wave + 0.12 * wave2, uMotion) * mix(1.0, 0.9 + 0.2 * shimmer, uMotion);
  b += near * 0.3;
  // A soft shoulder on brightness alone, so dim cells lift and bright ones never clip flat, with the hue kept whole.
  vec3 col = aColor * (1.0 - exp(-b * 1.9));
  col += vec3(0.78, 0.88, 1.0) * spec * 0.7 * aBevel.z * uDim;
  col = mix(col, aColor * 1.3 + 0.12, fly * 0.7);

  float bright = max(max(col.r, col.g), col.b);
  float halo = uGlow * smoothstep(0.55, 0.95, bright);
  float cellPx = uSize / uGrid * persp * mix(1.0, 0.6, fly);
  vec2 quad = aCorner * (0.5 + halo);
  vLocal = quad;
  vHalo = halo;
  vSoft = uBlur + 0.5 / max(cellPx * uDpr, 1.0);
  vGap = max(uGap, 1.0 / max(cellPx * uDpr, 1.0));
  vColor = col;
  vec2 pos = screen + quad * cellPx;
  gl_Position = vec4(pos.x / uView.x * 2.0 - 1.0, 1.0 - pos.y / uView.y * 2.0, 0.0, 1.0);
}
`;

export const CELL_FRAG = `#version 300 es
precision highp float;
in vec2 vLocal;
in vec3 vColor;
in float vHalo;
in float vSoft;
in float vGap;
out vec4 frag;

void main() {
  float box = max(abs(vLocal.x), abs(vLocal.y)) - (0.5 - vGap * 0.5);
  float core = 1.0 - smoothstep(-vSoft, vSoft, box);
  float out_ = max(box, 0.0);
  float glow = vHalo > 0.0 ? exp(-out_ / (0.12 + vHalo * 0.25)) * (1.0 - smoothstep(vHalo * 0.6, vHalo + vGap * 0.5, out_)) : 0.0;
  // Premultiplied: the square covers the wall, the glow around it only adds light.
  frag = vec4(vColor * core + vColor * glow * 0.3 * (1.0 - core), core);
}
`;
