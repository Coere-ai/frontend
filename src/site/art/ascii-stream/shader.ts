/**
 * ASCII Stream in one full screen pass. Every ribbon is a curve that
 * leaves the seam flat and bends away toward the edges, y = v A |x|^P, so
 * a pixel finds which ribbons it sits between by one division,
 * v = |y| / A |x|^P.
 * Ribbons are the values of v cut into strips, which is why they all meet
 * at the middle like light through a lens and fan out toward both edges.
 * Each pixel looks at its own strip and the few beside it in two depth
 * layers: a far one of thin dim ribbons, and a near one of brighter
 * ribbons, some of which carry rows of glyphs. Where the ribbons crowd too
 * close to draw one by one, near the seam, they blend into their mean.
 *
 * The glyphs live in each ribbon's own frame: the distance along its curve
 * (its arc length, by Simpson's rule) and the distance across it. They flow left to right, in along the left ribbons, through
 * the seam in a few rows of their own, and out along the right ones. A
 * soft bloom round the seam, the cores and each glyph stands in for a blur
 * pass. Light adds in linear space, a soft curve keeps it from clipping,
 * and it lands on the background by screen blending, so dark parts of the
 * scene show the background color exactly.
 */
export const STREAM_FRAG = `#version 300 es
precision highp float;
precision highp int;

uniform vec2 uRes;
uniform float uDpr;
uniform float uTime;
uniform vec2 uSeam;
uniform float uReach;
uniform float uCell;
uniform float uExposure;
uniform float uLod;
uniform float uCount;
uniform sampler2D uGlyphs;
uniform vec3 uBg;
uniform vec3 uDeep;
uniform vec3 uRibbon;
uniform vec3 uBright;
uniform vec3 uCore;
uniform vec3 uLine;

out vec4 outColor;

#ifdef PHONE
const int NEAR_REACH = 2;
const int FAR_REACH = 1;
#else
const int NEAR_REACH = 3;
const int FAR_REACH = 2;
#endif

const float VMAX = 2.6;
const float TAU = 6.2831853;
// How the ribbons bend: 1 would be straight rays from the middle, 2 a parabola.
const float P = 1.6;

uint mixBits(uint x) {
  x ^= x >> 16; x *= 0x7feb352du;
  x ^= x >> 15; x *= 0x846ca68bu;
  x ^= x >> 16;
  return x;
}

// Eight steady random numbers from 0 to 1 for one ribbon of one layer.
void ribbonDice(int layer, float id, out vec4 a, out vec4 b) {
  uint h = mixBits(uint(int(id) + 4096) * 1664525u + uint(layer) * 1013904223u + 374761393u);
  a = vec4(h & 255u, (h >> 8) & 255u, (h >> 16) & 255u, h >> 24) / 255.0;
  b = fract(a.yzwx * 7.13 + a.wxyz * 3.71);
}

float dice(vec3 p) {
  uvec3 q = uvec3(ivec3(p) + 65536);
  return float(mixBits(q.x * 73856093u ^ q.y * 19349663u ^ q.z * 83492791u)) / 4294967295.0;
}

// How bright the ribbons are by how far they bend: all of them faint near
// the flat middle, the brightest ones a little past the edge's corner, and
// none past VMAX, which leaves a dark eye above and below the seam.
float bend(float v) {
  return (0.4 + 0.6 * exp(-pow((v - 0.95) / 0.42, 2.0))) * (1.0 - smoothstep(1.3, VMAX, v));
}

// The length along y = a |x|^P from the seam to x, signed like x, by
// Simpson's rule on three points, close enough for a curve this smooth.
float arc(float x, float a) {
  float u = abs(x);
  float k = P * a;
  float mid = k * pow(u * 0.5, P - 1.0);
  float end = k * pow(max(u, 1e-4), P - 1.0);
  return x / 6.0 * (1.0 + 4.0 * sqrt(1.0 + mid * mid) + sqrt(1.0 + end * end));
}

// Linear light back to the screen's sRGB.
vec3 toScreen(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

// One glyph from the atlas, with uv from 0 to 1 across its cell.
float glyph(float g, vec2 uv) {
  uv = clamp((uv - 0.5) * 1.08 + 0.5, 0.0, 1.0);
  return textureLod(uGlyphs, vec2((g + uv.x) / uCount, 1.0 - uv.y), uLod).r;
}

// A glyph's own soft glow, a rounded blob that fills its cell.
float halo(vec2 uv) {
  vec2 d = uv - 0.5;
  return exp(-dot(d, d) * 9.0);
}

void main() {
  float t = uTime;
  vec2 seam = vec2(uSeam.x * uRes.x, (1.0 - uSeam.y) * uRes.y);
  // CSS pixels from the seam's center, y up.
  vec2 p = (gl_FragCoord.xy - seam) / uDpr;
  float H = uRes.y / uDpr;
  float halfW = max(max(seam.x, uRes.x - seam.x) / uDpr, 1.0);
  float X = abs(p.x) / halfW;

  // The ribbons grow out from the middle in the first moments.
  float reveal = 1.0 - smoothstep(t * 0.8 - 0.35, t * 0.8, X);
  // Ribbons stay faint near the middle, where they all crowd into the seam.
  float spread = mix(0.18, 1.0, smoothstep(0.06, 0.85, X)) * reveal;

  // v: which ribbon a pixel sits on, and how fast v changes per pixel, so a
  // gap in v turns into a distance on screen.
  // On a tall narrow box the reach follows the width, so the ribbons still fan out rather than stand up like curtains.
  float A = uReach * min(H, 2.2 * halfW) / pow(halfW, P) * (1.0 + 0.035 * sin(t * 0.31));
  float ax = max(abs(p.x), 0.75);
  float base = A * pow(ax, P);
  float v = abs(p.y) / base;
  float gv = length(vec2(1.0 / base, P * v / ax));

  vec3 light = vec3(0.0);

  // The far layer: many thin dim ribbons, flatter, softer and deep blue.
  {
    const float N = 24.0;
    const float K = 0.78;
    float vf = v / K;
    float g = gv / K;
    float i = floor(vf * N);
    float gap = 1.0 / (N * g);
    float fine = smoothstep(0.8, 2.6, gap);
    for (int k = -FAR_REACH; k <= FAR_REACH; k++) {
      float id = i + float(k);
      if (id < 0.0) continue;
      vec4 a, b;
      ribbonDice(0, id, a, b);
      float vj = (id + 0.5 + (a.x - 0.5) * 0.8) / N;
      float d = (vf - vj) / g;
      float w = mix(0.7, 2.4, a.z);
      float lum = mix(0.05, 0.28, a.w * a.w) * bend(vj) * step(0.35, a.y);
      float shine = exp(-d * d / (w * w)) * fine + exp(-abs(d) / (w * 4.0 + 2.0)) * 0.08;
      light += mix(uDeep, uRibbon, b.x * 0.6) * lum * shine;
    }
    light += (1.0 - fine) * uDeep * bend(vf) * 0.05;
    light *= spread;
  }

  // The near layer: brighter ribbons with white cores and travelling light,
  // the brightest pale blue, and a few out of focus.
  float streamD = 1e4;
  float streamV = 0.0;
  float streamId = 0.0;
  float streamLum = 0.0;
  vec4 streamDice = vec4(0.0);
  {
    const float N = 11.0;
    float i = floor(v * N);
    float gap = 1.0 / (N * gv);
    float fine = smoothstep(0.8, 2.6, gap);
    vec3 near = vec3(0.0);
    for (int k = -NEAR_REACH; k <= NEAR_REACH; k++) {
      float id = i + float(k);
      if (id < 0.0) continue;
      vec4 a, b;
      ribbonDice(1, id, a, b);
      float vj = (id + 0.5 + (a.x - 0.5) * 0.85) / N;
      float d = (v - vj) / gv;
      float blur = b.x * b.x;
      float w = mix(0.45, 1.2, a.z) * mix(1.0, 5.0, blur);
      float lum = mix(0.12, 0.7, a.w * a.w * a.w) * mix(1.0, 0.4, blur) * bend(vj) * step(0.2, a.y);
      float run = 0.62 + 0.38 * sin(p.x * mix(0.006, 0.016, b.y) - t * mix(0.6, 1.6, b.z) + b.w * TAU);
      float core = exp(-d * d / (w * w)) * fine;
      float glow = exp(-abs(d) / (w * 5.0 + 3.0)) * 0.1;
      float hot = smoothstep(0.7, 1.0, a.w) * smoothstep(0.6, 1.0, vj) * (1.0 - blur);
      lum *= 1.0 + hot;
      vec3 hue = mix(mix(uRibbon, uDeep, blur * 0.7), uBright, hot);
      near += (hue * core + mix(hue, uDeep, 0.5) * glow) * lum * run + uCore * lum * run * core * (0.3 + hot * 0.8) * (1.0 - blur);
      if (b.y > 0.4 && lum > 0.18 && abs(d) < abs(streamD)) {
        streamD = d;
        streamV = vj;
        streamId = id;
        streamLum = lum * run;
        streamDice = b;
      }
    }
    near += (1.0 - fine) * uRibbon * bend(v) * 0.1;
    light += near * spread;
  }

  float cell = uCell;

  // Glyphs riding the nearest ribbon that carries a stream, in two or three
  // rows that face out from the seam, brighter toward the edges.
  {
    float rows = streamDice.z > 0.5 ? 3.0 : 2.0;
    float row = floor(streamD / cell + rows * 0.5);
    if (row >= 0.0 && row < rows) {
      float flow = mix(36.0, 80.0, streamDice.w);
      float s = arc(p.x, A * streamV) - t * flow;
      float col = floor(s / (cell * 0.92));
      vec2 uv = vec2(fract(s / (cell * 0.92)), fract(streamD / cell + rows * 0.5));
      if (p.y < 0.0) uv.y = 1.0 - uv.y;
      float on = step(0.32, dice(vec3(col, row, streamId)));
      float train = smoothstep(0.15, 0.75, 0.5 + 0.5 * sin(s * 0.011 + streamId * 2.3));
      float g = floor(dice(vec3(col, row + 17.0, streamId + floor(t * 1.5 + dice(vec3(col, row, 3.0)) * 9.0))) * uCount);
      float edge = smoothstep(0.22, 0.9, X) * reveal;
      float amount = on * train * edge * min(streamLum * 1.6, 1.4);
      light += (mix(uBright, uCore, 0.6) * glyph(g, uv) * 1.8 + uRibbon * halo(uv) * 0.25) * amount;
    }
  }

  // The seam: a hot white core that cools to a thin cyan line toward the
  // edges, a halo, a wide soft bloom, and its own rows of glyphs.
  {
    float mid = exp(-pow(p.x / (0.3 * halfW), 2.0));
    float shimmer = 0.85 + 0.15 * sin(p.x * 0.021 - t * 2.4);
    float lineReveal = 1.0 - smoothstep(t * 1.1 - 0.3, t * 1.1, X);
    float y2 = p.y * p.y;
    vec3 seamHue = mix(uLine, uCore, mid);
    light += seamHue * exp(-y2 / 1.1) * (0.3 + 2.2 * mid) * shimmer * lineReveal;
    light += mix(uRibbon, uBright, mid) * (exp(-y2 / 196.0) * mid * 0.5 + exp(-y2 / 400.0) * exp(-pow(p.x / (0.24 * halfW), 2.0)) * 0.3);
    light += uDeep * exp(-length(vec2(p.x / (0.5 * halfW), p.y / (0.1 * H))) * 2.6) * 0.12;

    float rowH = cell * 1.3;
    float r = floor(p.y / rowH);
    float rr = abs(r + 0.5);
    if (rr < 3.0) {
      float flow = mix(40.0, 95.0, dice(vec3(r, 5.0, 11.0)));
      float s = p.x - t * flow;
      float col = floor(s / (cell * 0.92));
      vec2 uv = vec2(fract(s / (cell * 0.92)), fract(p.y / rowH) * 1.3 - 0.15);
      float on = step(0.3, dice(vec3(col, r, 7.0)));
      float g = floor(dice(vec3(col, r, floor(t * 2.0 + dice(vec3(col, r, 9.0)) * 7.0))) * uCount);
      float fade = exp(-pow(p.x / (0.32 * halfW), 2.0)) * (1.0 - rr / 3.2) * lineReveal;
      float ink = uv.y > 0.0 && uv.y < 1.0 ? glyph(g, uv) : 0.0;
      light += (mix(uBright, uCore, 0.5) * ink * 0.85 + uRibbon * halo(uv) * 0.12) * on * fade;
    }
  }

  vec3 lit = 1.0 - exp(-light * uExposure);
  vec3 shown = toScreen(lit);
  vec3 bg = toScreen(uBg);
  vec3 color = 1.0 - (1.0 - bg) * (1.0 - shown);
  // A whisper of dither keeps the soft glows from banding; the bare background stays exact.
  float grain = (dice(vec3(gl_FragCoord.xy, 1.0)) - 0.5) / 255.0;
  color += grain * smoothstep(0.0, 0.02, max(max(lit.r, lit.g), lit.b));
  outColor = vec4(color, 1.0);
}`;
