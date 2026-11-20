import { link } from "../pixel-matrix/gl";
import type { Rgb } from "../pixel-matrix/palette";
import type { CellPicture } from "./cells";

/** The gap between cells and an unlit cell, a touch apart so the grid shows even where the picture is black. */
export const GAP_RGB: Rgb = [7 / 255, 6 / 255, 12 / 255];
export const UNLIT_RGB: Rgb = [17 / 255, 16 / 255, 30 / 255];

/** The intro, in seconds: the front crosses the picture, each cell flashes as it passes and settles. */
export const INTRO = { sweep: 1.05, jitter: 0.22, settle: 0.5 };
/** When the last cell has settled. */
export const INTRO_END = INTRO.sweep + INTRO.jitter + INTRO.settle;

const VERT = `#version 300 es
in vec2 aCorner;
void main() { gl_Position = vec4(aCorner, 0.0, 1.0); }
`;

/**
 * Every screen pixel finds its cell by whole device pixels, so each cell is
 * one solid square and every gap is the same width. A gap pixel takes a
 * little light from the cells on either side: the glow round a bright cell.
 * During the intro a cell is unlit until the front reaches it, then flashes
 * in its own hue and settles to its color.
 */
const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uCells;
uniform ivec2 uGrid;
uniform float uCell;
uniform float uGap;
uniform float uHeight;
uniform float uTime;
uniform vec3 uStops[4];
uniform vec3 uGapColor;
uniform vec3 uUnlit;
out vec4 frag;

// A sine free hash, so the jitter has no diagonal rows.
float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

vec3 ramp(float t) {
  float x = clamp(t, 0.0, 1.0) * 3.0;
  int i = min(int(x), 2);
  return mix(uStops[i], uStops[i + 1], x - float(i));
}

vec3 cell(ivec2 id) {
  ivec2 at = clamp(id, ivec2(0), uGrid - 1);
  vec4 c = texelFetch(uCells, at, 0);
  vec3 settled = max(c.rgb, uUnlit);
  vec2 g = vec2(at) / vec2(uGrid);
  float start = (g.x * 0.62 + g.y * 0.38) * ${INTRO.sweep.toFixed(3)} + hash(vec2(at)) * ${INTRO.jitter.toFixed(3)};
  float k = (uTime - start) / ${INTRO.settle.toFixed(3)};
  if (k >= 1.0) return settled;
  // A faint warm up just ahead of the front, then the flash, then the settle.
  if (k < 0.0) return uUnlit + ramp(c.a) * 0.08 * smoothstep(-0.5, 0.0, k);
  vec3 peak = settled * 1.5 + ramp(c.a) * 0.55 + 0.1;
  float on = smoothstep(0.0, 0.06, k);
  float fade = (1.0 - k) * (1.0 - k);
  return mix(uUnlit, mix(settled, peak, fade), on);
}

void main() {
  vec2 px = floor(vec2(gl_FragCoord.x, uHeight - gl_FragCoord.y));
  ivec2 id = ivec2(floor(px / uCell));
  vec2 local = px - vec2(id) * uCell;
  float core = uCell - uGap;
  if (local.x < core && local.y < core) {
    frag = vec4(cell(id), 1.0);
    return;
  }
  ivec2 ox = ivec2(local.x >= core ? 1 : 0, 0);
  ivec2 oy = ivec2(0, local.y >= core ? 1 : 0);
  vec3 near = (cell(id) + cell(id + ox) + cell(id + oy) + cell(id + ox + oy)) * 0.25;
  float bright = max(max(near.r, near.g), near.b);
  frag = vec4(uGapColor + near * 0.32 * smoothstep(0.3, 0.9, bright), 1.0);
}
`;

export type PictureRenderer = {
  /** Uploads a new picture. */
  setPicture: (picture: CellPicture) => void;
  /** Draws the picture `time` seconds into the intro, with cells `cell` device pixels apart and gaps of `gap`. */
  draw: (time: number, cell: number, gap: number) => void;
  dispose: () => void;
};

/**
 * Draws a cell picture with one full screen pass: the cells live in a
 * texture one texel a cell, so a frame costs the same whatever the grid.
 * Returns null where WebGL2 is missing.
 */
export function createPictureRenderer(canvas: HTMLCanvasElement, stops: readonly Rgb[]): PictureRenderer | null {
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
  if (!gl) return null;
  const prog = link(gl, VERT, FRAG);
  const tri = gl.createBuffer();
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, tri);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  for (const p of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, p, gl.NEAREST);
  for (const p of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE);
  gl.useProgram(prog.program);
  gl.uniform3fv(prog.at("uStops"), new Float32Array(stops.flat()));
  gl.uniform3fv(prog.at("uGapColor"), new Float32Array(GAP_RGB));
  gl.uniform3fv(prog.at("uUnlit"), new Float32Array(UNLIT_RGB));
  gl.uniform1i(prog.at("uCells"), 0);
  let grid: [number, number] = [1, 1];

  function setPicture(picture: CellPicture) {
    gl!.bindTexture(gl!.TEXTURE_2D, texture);
    gl!.pixelStorei(gl!.UNPACK_ALIGNMENT, 1);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA8, picture.cols, picture.rows, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, picture.data);
    grid = [picture.cols, picture.rows];
  }

  function draw(time: number, cell: number, gap: number) {
    const g = gl!;
    g.viewport(0, 0, canvas.width, canvas.height);
    g.useProgram(prog.program);
    g.bindVertexArray(vao);
    g.activeTexture(g.TEXTURE0);
    g.bindTexture(g.TEXTURE_2D, texture);
    g.uniform2i(prog.at("uGrid"), grid[0], grid[1]);
    g.uniform1f(prog.at("uCell"), cell);
    g.uniform1f(prog.at("uGap"), gap);
    g.uniform1f(prog.at("uHeight"), canvas.height);
    g.uniform1f(prog.at("uTime"), time);
    g.drawArrays(g.TRIANGLES, 0, 3);
  }

  function dispose() {
    gl!.deleteTexture(texture);
    gl!.deleteBuffer(tri);
    gl!.deleteVertexArray(vao);
    gl!.deleteProgram(prog.program);
    gl!.getExtension("WEBGL_lose_context")?.loseContext();
  }

  return { setPicture, draw, dispose };
}
