/**
 * ASCII Tiles in two passes over one scene: a floor of square glass tiles
 * with beveled edges, seen from above at a slant. The first pass lights
 * each character cell from four samples and keeps only how much ink its
 * glyph needs, in a texture one texel a cell. The second covers the
 * screen: each pixel lights the scene once for its own color, so light
 * pools have soft edges and the bevels' film keeps its fine bands, then
 * shows it through the glyph its cell picked. Choosing the glyph once a
 * cell is what keeps the field steady and the cost near one scene sample
 * a pixel.
 */

/** Most colors an iridescent ramp may hold. */
export const MAX_IRIDESCENT = 8;

/** The uniforms and scene both passes share. */
const SCENE = `#version 300 es
precision highp float;

uniform vec2 uRes;
uniform float uCell;
uniform float uTime;
uniform float uTile;
uniform float uPitch;
uniform float uRot;
uniform vec3 uShade;
uniform vec3 uLit;
uniform vec3 uIri[${MAX_IRIDESCENT}];
uniform int uIriCount;

const float FOCAL = 1.55;
const float GROOVE = 0.045;
const float BEVEL = 0.135;
const float TOP = 0.085;

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.55;
  for (int i = 0; i < 3; i++) {
    s += a * noise(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p + 7.3;
    a *= 0.5;
  }
  return s;
}

// The iridescent ramp, read round and round so any number lands on a color.
vec3 iridescent(float h) {
  float n = float(uIriCount);
  float x = fract(h) * n;
  int i = int(floor(x));
  int j = i + 1 >= uIriCount ? 0 : i + 1;
  float f = smoothstep(0.0, 1.0, fract(x));
  return mix(uIri[i], uIri[j], f);
}

mat2 turn(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, s, -s, c);
}

// Distance in from the nearest tile edge, 0 at the edge and 0.5 at the center.
float edgeIn(vec2 q, out vec2 local) {
  local = fract(q) - 0.5;
  vec2 a = abs(local);
  return 0.5 - max(a.x, a.y);
}

// Height of the floor at tile coordinates q, in tile widths.
float heightAt(vec2 q) {
  vec2 l;
  float e = edgeIn(q, l);
  float x = clamp((e - GROOVE) / BEVEL, 0.0, 1.0);
  return e < GROOVE ? 0.0 : TOP * (1.0 - pow(1.0 - x, 1.15));
}

vec4 shade(vec2 frag) {
  vec2 p = (frag - 0.5 * uRes) / uRes.y;
  float ca = cos(uPitch), sa = sin(uPitch);
  vec3 ray = normalize(vec3(p.x, p.y * ca + FOCAL * sa, p.y * sa - FOCAL * ca));
  // The camera drifts slowly over the floor and turns a touch, so the tiles glide.
  float t = uTime;
  vec2 cam = vec2(t * 0.021, t * 0.009) * uTile + vec2(sin(t * 0.05), cos(t * 0.04)) * 0.25 * uTile;
  mat2 rot = turn(uRot + 0.03 * sin(t * 0.045));
  vec3 rq = vec3(rot * ray.xy, ray.z);

  // Meet the tile tops, then settle twice onto the bevel's own height.
  float h = TOP;
  vec2 q;
  for (int i = 0; i < 3; i++) {
    float hit = (1.0 - h * uTile) / -ray.z;
    q = rot * (cam + ray.xy * hit) / uTile;
    h = heightAt(q);
  }

  vec2 l;
  float e = edgeIn(q, l);
  vec2 a = abs(l);
  bool alongX = a.x > a.y;
  vec2 out2 = alongX ? vec2(sign(l.x), 0.0) : vec2(0.0, sign(l.y));
  float x = clamp((e - GROOVE) / BEVEL, 0.0, 1.0);
  float slope = e < GROOVE || x >= 1.0 ? 0.0 : TOP * 1.15 * pow(1.0 - x, 0.15) / BEVEL;
  vec3 n = normalize(vec3(out2 * slope, 1.0));
  vec3 v = -rq;

  float az = t * 0.11 + 0.8;
  vec3 light = normalize(vec3(cos(az), sin(az), 0.85));
  float facing = max(dot(n, light), 0.0);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  // A wide sheen that sweeps across the floor now and then.
  float sweep = pow(0.5 + 0.5 * sin(dot(q, vec2(0.42, 0.27)) - t * 0.32), 10.0);
  vec2 cellId = floor(q);
  float tileTone = hash(cellId + 3.1);

  // Tile tops: dark glass with drifting pools of light.
  float pools = smoothstep(0.32, 0.9, fbm(q * 0.45 + vec2(t * 0.035, -t * 0.022))) * (0.55 + 0.45 * noise(q * 1.3 - t * 0.05));
  float inner = smoothstep(BEVEL + GROOVE, BEVEL + GROOVE + 0.12, e);
  // Light falls across each tile from the side facing it, so every top has its own soft gradient.
  float across = 0.5 + 0.5 * dot(l * 2.0, normalize(light.xy));
  float topLight = 0.14 + 0.08 * tileTone + 0.1 * across + pools * (0.62 + 0.25 * tileTone) * mix(0.6, 1.0, inner) + 0.15 * pow(max(dot(reflect(-v, n), light), 0.0), 6.0) + 0.4 * sweep;
  vec3 top = mix(uShade, uLit, clamp(topLight, 0.0, 1.0)) * (0.3 + 0.75 * topLight);

  // Bevels: an iridescent film.
  float along = (alongX ? l.y * sign(l.x) : -l.x * sign(l.y));
  float hue = 1.6 * dot(n, v) + 1.1 * along + 0.55 * fbm(q * 1.7 + t * 0.05) + 0.22 * sin(along * 70.0 + x * 31.0 - t * 0.6) + 0.12 * hash(frag) + t * 0.035 + tileTone * 0.3;
  float glow = 0.32 + 1.1 * pow(facing, 2.0) + 0.35 * fres + 0.5 * sweep + 0.2 * pools;
  vec3 film = iridescent(hue) * glow * 0.8;
  // The rim where bevel meets top catches a thin white line.
  float rim = exp(-pow((x - 1.0) * 9.0, 2.0)) * 0.35 * (0.4 + facing);

  bool onBevel = e >= GROOVE && x < 1.0;
  vec3 col = onBevel ? film + rim : top;
  // The grooves are deep and dark, and the bevel darkens toward them.
  float groove = smoothstep(GROOVE * 0.6, GROOVE + 0.03, e);
  col *= mix(0.03, 1.0, groove);
  // Distance haze: far tiles fade a little into the background.
  col *= mix(1.0, 0.55, smoothstep(0.1, 0.55, p.y));
  return vec4(col, onBevel ? 1.0 : 0.0);
}

// The soft curve that keeps bright light from clipping.
vec3 toneOf(vec3 c) {
  return 1.0 - exp(-c * 1.4);
}
`;

/**
 * Pass one: the scene is lit at four points in each character cell and
 * the average kept as the ink its glyph should have. The camera hangs over
 * the floor and leans forward, so far tiles are smaller. A ray from it
 * meets the tile tops first, then is moved twice to the height the bevel
 * has there, which shifts the slopes by their depth. A bevel's normal
 * leans out along the axis of the nearest edge, and the facets meet on
 * the diagonals as on a cut glass tile.
 */
export const INK_FRAG = `${SCENE}
out vec4 outColor;

void main() {
  vec2 base = floor(gl_FragCoord.xy) * uCell;
  vec4 c = shade(base + uCell * vec2(0.3, 0.3)) + shade(base + uCell * vec2(0.7, 0.3)) + shade(base + uCell * vec2(0.3, 0.7)) + shade(base + uCell * vec2(0.7, 0.7));
  c *= 0.25;
  float ink = dot(toneOf(c.rgb), vec3(0.2126, 0.7152, 0.0722));
  // A bevel always shows a glyph of some weight, so every edge of every tile reads.
  ink = mix(ink, clamp(ink * 1.35, 0.3, 0.9), c.a);
  outColor = vec4(ink, c.a, 0.0, 1.0);
}`;

/**
 * Pass two. Each pixel lights the scene for its own color, finds its cell
 * and that cell's ink, and picks the glyph with that much ink from the
 * atlas (sorted from empty to dense). The bright half of the range turns
 * the cell over: a lit square with a dark glyph cut out of it, so light
 * pools read as nearly solid while the field stays made of characters.
 * The atlas is read with a fixed gradient, one cell to one glyph, so its
 * mip level holds steady across a cell's edge.
 */
export const GLYPH_FRAG = `${SCENE}
uniform sampler2D uInk;
uniform sampler2D uGlyphs;
uniform float uCount;
uniform vec3 uBg;
uniform float uGain;

out vec4 outColor;

void main() {
  vec2 f = gl_FragCoord.xy / uCell;
  vec4 cellInk = texelFetch(uInk, ivec2(floor(f)), 0);
  float ink = pow(clamp(cellInk.r * uGain, 0.0, 1.0), 0.85);
  bool over = ink > 0.5;
  float level = over ? (1.0 - ink) * 2.0 : ink * 2.0;
  float g = min(floor(level * uCount), uCount - 1.0);
  vec2 local = fract(f);
  vec2 uv = vec2((g + local.x) / uCount, 1.0 - local.y);
  // A slightly sharper mip than the cell asks for, then a lift, so a glyph stays bold at seven pixels.
  float mask = textureGrad(uGlyphs, uv, vec2(0.7 / (uCell * uCount), 0.0), vec2(0.0, 0.7 / uCell)).r;
  mask = smoothstep(0.02, 0.5, mask);
  if (over) mask = 1.0 - mask;
  vec3 c = toneOf(shade(gl_FragCoord.xy).rgb);
  // Glyphs carry the pixel's hue at full strength and a lift in light, since their ink is sparse.
  float peak = max(max(c.r, c.g), c.b);
  vec3 glyph = c / max(peak, 1e-4) * mix(0.18, 1.05, peak);
  vec3 col = uBg + c * 0.05 + glyph * mask;
  outColor = vec4(min(col, 1.0), 1.0);
}`;
