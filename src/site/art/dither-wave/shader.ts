/**
 * Dither Wave's one pass. Every fragment finds the dither cell it sits in,
 * reads a flowing wave field once at the cell's center, and paints the
 * whole cell one of three flat colors (the background, blue or white)
 * through an 8 by 8 Bayer threshold. So the picture is all square pixels
 * with no soft edge, however the canvas is scaled.
 *
 * The field: a plane bent by a few sine waves that drift at their own
 * pace, then cut into bands across the bent x. Each band has a bright
 * core, a hard edge on one side and a long fall on the other; where the
 * bend squeezes the bands they thin into sharp lines, and where it
 * stretches them they widen into soft ribbons. A slow envelope of its own
 * dims whole stretches to black, so the bands come and go.
 */
export const DITHER_WAVE_FRAG = `#version 300 es
precision highp float;

uniform vec2 uRes;      // drawing buffer, device pixels
uniform float uCell;    // one dither pixel, whole device pixels
uniform float uDpr;     // device pixels per CSS pixel
uniform float uUnit;    // CSS pixels per field unit
uniform float uTime;
uniform float uGain;    // overall light, 1 the default
uniform vec3 uBg;
uniform vec3 uDeep;   // the blue of a band's thin edge
uniform vec3 uMid;    // the blue of its full body
uniform vec3 uCore;

out vec4 outColor;

// The 8 by 8 Bayer matrix as k / 64, built from the 2 by 2 one three times.
float bayer2(vec2 a) {
  a = floor(a);
  return fract(dot(a, vec2(0.5, a.y * 0.75)));
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

// The bent plane's band coordinate: one whole step from each band to the next.
float phaseAt(vec2 p, float t) {
  // The bands lean a little, and the lean swings slowly over time.
  float a = 0.18 + 0.16 * sin(t * 0.043 + 0.8);
  vec2 q = mat2(cos(a), sin(a), -sin(a), cos(a)) * p;
  q.x += 0.42 * sin(q.y * 1.60 + t * 0.53);
  q.y += 0.34 * sin(q.x * 1.30 - t * 0.41 + 1.7);
  q.x += 0.21 * sin(q.y * 2.70 - t * 0.71 + q.x * 0.7 + 4.1);
  q.y += 0.15 * sin(q.x * 3.60 + t * 0.62 + 2.3);
  q.x += 0.09 * sin(q.y * 6.10 + t * 0.97 + 0.9);
  return q.x * 1.6 + 0.4 * sin(q.y * 0.8 + t * 0.29);
}

// A soft bump of half width w, never thinner than about one dither pixel (g).
float bump(float x, float w, float g) {
  // Only up to a point: where the field folds hard the phase races, and a band there stays thin.
  float k = max(w, min(0.9 * g, 0.08));
  return exp(-(x * x) / (k * k));
}

// The field's light at p, 0 to 1. cellStep is one dither pixel in field units.
float field(vec2 p, float t, float cellStep) {
  float phase = phaseAt(p, t);
  // How far the phase moves across one dither pixel, so thin lines never break into dashes.
  float g = length(vec2(phaseAt(p + vec2(cellStep, 0.0), t), phaseAt(p + vec2(0.0, cellStep), t)) - phase);
  float s = fract(phase) - 0.5;
  float id = floor(phase);
  // Each band: a wide blue body with a short fall on one side and a long one on the other.
  // Bands differ in width, from slim to broad, and breathe slowly.
  float wide = 0.7 + 0.65 * (0.5 + 0.5 * sin(id * 1.9 + 0.4 + t * 0.11));
  float body = bump(s, (s < 0.0 ? 0.075 : 0.2) * wide, g);
  // Its core, white only close to the center line.
  float core = bump(s, (s < 0.0 ? 0.025 : 0.06) * wide, g);
  // About half the bands carry a thin line just off their sharp side.
  float line = bump(s + 0.24, 0.012, g) * step(0.1, sin(id * 4.1 + 0.7));

  // Each band has its own strength, and a slow envelope fades whole stretches to black.
  float own = 0.6 + 0.4 * sin(id * 2.7 + 1.3 + t * 0.13);
  float env = 0.5 + 0.5 * sin(p.x * 0.9 + p.y * 0.75 + t * 0.23 + id * 0.6) * cos(p.y * 0.8 - p.x * 0.35 - t * 0.19 + 1.3);
  float k = own * smoothstep(0.12, 0.62, env);
  // The body fills to solid blue well before its edge; the core then lifts it to white.
  float blue = clamp((body * k * 1.8 - 0.16) / 0.84, 0.0, 1.0);
  float white = clamp(core * k * 1.15, 0.0, 1.0);
  return max(0.5 * blue + 0.5 * white * blue, clamp(1.25 * line * k - 0.1, 0.0, 1.0));
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy / uCell);
  vec2 css = (cell + 0.5) * uCell / uDpr;
  vec2 size = uRes / uDpr;
  // Flip y so the field reads top down like the page, centered.
  vec2 p = vec2(css.x - 0.5 * size.x, 0.5 * size.y - css.y) / uUnit;

  // The field runs a little under scene time, so the bands drift rather than rush.
  float v = clamp(field(p, uTime * 0.7, uCell / uDpr / uUnit) * uGain, 0.0, 1.0);

  // Three tones, two steps: background to blue, blue to white.
  float level = v * 2.0;
  float base = floor(level);
  float th = bayer8(cell) + 0.5 / 64.0;
  float idx = base + step(th, fract(level));
  // The blue runs from deep at a band's thin edge to bright in its body; each cell stays one flat color.
  vec3 blue = mix(uDeep, uMid, smoothstep(0.15, 0.6, v));
  vec3 color = idx < 0.5 ? uBg : (idx < 1.5 ? blue : uCore);
  outColor = vec4(color, 1.0);
}`;
