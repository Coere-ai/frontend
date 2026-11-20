/**
 * Liquid Lines in one full screen pass. The screen is turned onto the
 * diagonal, so `u` runs along the streaks and `v` across them. A slow
 * field of waves bends `v`, which makes neighbouring streaks swell, part
 * and meet like a liquid. Each depth layer cuts the bent `v` into strips;
 * a strip may hold one streak with its own place, slant, focus, brightness
 * and a run of light that travels along it. Every pixel looks at its own
 * strip and the two beside it in each layer, so the cost is fixed whatever
 * the number of streaks.
 *
 * A streak is a sharp core with a faint wide bloom. Its warm and cool
 * copies sit a little to either side and the core sits between them,
 * so where they overlap the light adds up to white and only the edges
 * keep the tint, as a lens splits colors. Out of focus streaks are wider,
 * dimmer and split more. Light adds in linear space, then a soft curve
 * keeps bright overlaps from clipping and a tiny dither keeps the dark
 * gradients smooth.
 */
export const LIQUID_FRAG = `#version 300 es
precision highp float;
precision highp int;

uniform vec2 uRes;
uniform float uDpr;
uniform float uScale;
uniform float uTime;
uniform vec2 uDir;
uniform float uDensity;
uniform float uFringe;
uniform float uExposure;
uniform vec3 uBg;
uniform vec3 uCore;
uniform vec3 uCool;
uniform vec3 uAccent;
uniform vec3 uWarm;
uniform vec3 uGlow;

out vec4 outColor;

uint mixBits(uint x) {
  x ^= x >> 16; x *= 0x7feb352du;
  x ^= x >> 15; x *= 0x846ca68bu;
  x ^= x >> 16;
  return x;
}

// Eight steady random numbers from 0 to 1 for one strip of one layer.
void strip(int layer, float cell, out vec4 a, out vec4 b) {
  uint h = mixBits(uint(int(cell) + 1048576) * 1664525u + uint(layer) * 1013904223u + 374761393u);
  uint g = mixBits(h ^ 0x9e3779b9u);
  uint k = mixBits(g + 0x632be5abu);
  uint m = mixBits(k ^ 0x85ebca6bu);
  a = vec4(float(h & 0xffffu), float(h >> 16), float(g & 0xffffu), float(g >> 16)) / 65535.0;
  b = vec4(float(k & 0xffffu), float(k >> 16), float(m & 0xffffu), float(m >> 16)) / 65535.0;
}

// A streak across its width. In focus the core is flat topped with a crisp
// edge; out of focus it softens into a gaussian. A faint wide bloom sits
// under both.
float profile(float d, float w, float shape) {
  float x = abs(d) / w;
  return exp(-pow(x, shape)) + 0.03 * exp(-abs(d) / (w * 2.5 + 6.0));
}

// A colored edge: a soft gaussian with no bloom.
float edge(float d, float w) {
  return exp(-(d * d) / (w * w));
}

// One depth layer of streaks.
//   spacing   strip width in design pixels
//   density   share of strips that hold a streak
//   focus     blur range, 0 sharp and 1 far out of focus
//   bright    light of the layer
//   drift     pixels a second the layer slides across the streaks
//   bend      how much the wave field bends this layer
vec3 layer(int id, float u, float v, float wave, float t, float spacing, float density, vec2 focus, float bright, float drift, float bend, float minSigma, int reach) {
  vec3 acc = vec3(0.0);
  float vv = v + wave * bend + t * drift;
  float cell = floor(vv / spacing);
  for (int k = -2; k <= 2; k++) {
    if (k < -reach || k > reach) continue;
    float c = cell + float(k);
    vec4 a, b;
    strip(id, c, a, b);
    // Streaks gather in loose groups with darker gaps, as in a long exposure.
    float group = 0.55 + 0.45 * sin(c * spacing * 0.0042 + float(id) * 2.1);
    if (a.x > density * group) continue;
    float center = (c + 0.5 + (a.y - 0.5) * 0.85) * spacing + (b.x - 0.5) * 0.055 * u;
    float d = vv - center;
    // A run of light travels along the streak with the flow, so it brightens and fades as it goes.
    float pace = mix(45.0, 150.0, b.z);
    float phase = a.w * 6.2832;
    float run = 0.62 * sin((u - t * pace) * 0.0024 * (0.65 + 0.7 * b.w) + phase) + 0.38 * sin((u - t * pace * 0.7) * 0.0063 + phase * 2.3);
    float light = smoothstep(-0.7, 1.0, run);
    light *= light;
    float energy = bright * mix(0.3, 1.3, b.w) * light;
    if (energy < 0.002) continue;
    float blur = mix(focus.x, focus.y, a.z);
    // The streak swells where its light runs and thins to a point where it fades, like a long spindle.
    float sigma = max(mix(1.3, 11.0, blur * blur) * mix(0.6, 1.15, light), minSigma);
    energy *= pow(sigma, -0.32);
    // One side of a streak is crisper than the other, like the lit edge of a ribbon.
    float s = d < 0.0 ? sigma : sigma * mix(0.6, 1.5, b.y);
    float shape = mix(4.0, 2.0, smoothstep(0.1, 0.6, blur));
    // The warm and cool edges sit just past each side of the core and overlap its rim.
    float split = sigma * 0.8 + uFringe * (0.35 + sigma * 0.3);
    float rim = sigma * 0.6 + 0.45;
    vec3 cool = mix(uCool, uAccent, step(0.72, b.x));
    acc += energy * (uCore * profile(d, s, shape) + uFringe * (1.0 - 0.65 * blur) * (uWarm * edge(d + split, rim) + cool * edge(d - split, rim)));
  }
  return acc;
}

// Wide soft bands of light far behind the streaks.
vec3 bands(float u, float v, float wave, float t) {
  vec3 acc = vec3(0.0);
  float spacing = 520.0;
  float vv = v + wave * 1.4 + t * 3.0;
  float cell = floor(vv / spacing);
  for (int k = -1; k <= 1; k++) {
    float c = cell + float(k);
    vec4 a, b;
    strip(9, c, a, b);
    if (a.x > 0.75) continue;
    float center = (c + 0.5 + (a.y - 0.5) * 0.5) * spacing;
    float d = vv - center;
    float sigma = mix(22.0, 70.0, a.z);
    float run = 0.5 + 0.5 * sin(u * 0.0012 * (0.6 + b.w) - t * 0.05 + a.w * 6.2832);
    acc += uGlow * (0.02 + 0.12 * b.x) * run * run * run * exp(-(d * d) / (sigma * sigma));
  }
  return acc;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / (uDpr * uScale);
  float u = dot(p, uDir);
  float v = dot(p, vec2(-uDir.y, uDir.x));
  float t = uTime;
  // The liquid: long slow waves that bend every streak a little differently.
  float wave = 16.0 * sin(u * 0.0011 + t * 0.17 + v * 0.0021)
             + 9.0 * sin(u * 0.0026 - t * 0.26 + v * 0.0037 + 1.9)
             + 3.5 * sin(u * 0.0061 + t * 0.41 - v * 0.0024 + 4.1);
  float minSigma = 0.62 / (uDpr * uScale);
  float dens = uDensity;
  vec3 col = bands(u, v, wave, t);
#ifndef PHONE
  col += layer(1, u, v, wave, t, 30.0, 0.5 * dens, vec2(0.15, 0.55), 0.8, 5.0, 0.7, minSigma, 1);
#endif
  col += layer(2, u, v, wave, t, 56.0, 0.58 * dens, vec2(0.0, 0.38), 6.0, 9.0, 1.0, minSigma, 1);
  col += layer(3, u, v, wave, t, 130.0, 0.6 * dens, vec2(0.2, 1.0), 6.0, 15.0, 1.25, minSigma, 2);

  vec3 lit = 1.0 - exp(-col * uExposure);
  vec3 linear = uBg + lit * (1.0 - uBg);
  vec3 srgb = mix(linear * 12.92, 1.055 * pow(linear, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, linear));
  float grain = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5;
  outColor = vec4(srgb + grain / 255.0, 1.0);
}`;
