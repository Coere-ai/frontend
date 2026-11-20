import { link } from "./gl";
import { CELL_FLOATS, type CellSet } from "./sample";
import { CELL_FRAG, CELL_VERT } from "./shaders";
import { createWall } from "./wall";

type Vec3 = readonly [number, number, number];

/** One logo as a frame draws it: where it is, how it is turned, and how it lights the wall. */
export type LogoFrame = {
  slot: number;
  center: Vec3;
  rot: Float32Array;
  size: number;
  grid: number;
  dim: number;
  blur: number;
  delay: number;
  /** Screen x and y, radius and strength of the light it throws on the wall. */
  spot: readonly [number, number, number, number];
  tint: Vec3;
};

/** Everything one frame needs. Logos come sorted far to near, since each square covers what is behind it. */
export type Frame = {
  width: number;
  height: number;
  dpr: number;
  time: number;
  intro: number;
  motion: number;
  tilt: readonly [number, number];
  pointer: Vec3;
  focal: number;
  wallCell: number;
  gap: number;
  glow: number;
  light: Vec3;
  shadow: readonly [number, number];
  haze: Vec3;
  spark: Vec3;
  logos: LogoFrame[];
};

/** The four corners of a cell's square, in the order the index list joins them. */
const CORNERS = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
] as const;

export type Renderer = { setLogos: (sets: CellSet[]) => void; draw: (f: Frame) => void; dispose: () => void };

/**
 * The WebGL side of the wall: the dim cells first (see wall.ts), then one
 * draw per logo. Returns null where WebGL2 is missing, and
 * the page keeps its still dark background.
 */
export function createRenderer(canvas: HTMLCanvasElement): Renderer | null {
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "high-performance", preserveDrawingBuffer: false });
  if (!gl) return null;
  const cell = link(gl, CELL_VERT, CELL_FRAG);

  const tri = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tri);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const wallVao = gl.createVertexArray();
  gl.bindVertexArray(wallVao);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const wall = createWall(gl, wallVao!);

  let logos: { vao: WebGLVertexArrayObject; buffers: WebGLBuffer[]; count: number }[] = [];

  function freeLogos() {
    for (const l of logos) {
      gl!.deleteVertexArray(l.vao);
      for (const b of l.buffers) gl!.deleteBuffer(b);
    }
    logos = [];
  }

  /**
   * Uploads each logo as plain quads, four corners a cell sharing one index
   * list, rather than as instances. Software GL (and some phone drivers)
   * runs instanced draws one instance at a time, which made the same
   * picture ten times slower there; a GPU draws either way just as fast.
   */
  function setLogos(sets: CellSet[]) {
    freeLogos();
    const floats = CELL_FLOATS + 2;
    logos = sets.map((set) => {
      const verts = new Float32Array(set.count * 4 * floats);
      const index = new Uint32Array(set.count * 6);
      for (let c = 0; c < set.count; c++) {
        const cell = set.data.subarray(c * CELL_FLOATS, (c + 1) * CELL_FLOATS);
        CORNERS.forEach(([x, y], k) => {
          const at = (c * 4 + k) * floats;
          verts[at] = x;
          verts[at + 1] = y;
          verts.set(cell, at + 2);
        });
        index.set([0, 1, 2, 2, 1, 3].map((i) => c * 4 + i), c * 6);
      }
      const vao = gl!.createVertexArray()!;
      const vbo = gl!.createBuffer()!;
      const ibo = gl!.createBuffer()!;
      gl!.bindVertexArray(vao);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, vbo);
      gl!.bufferData(gl!.ARRAY_BUFFER, verts, gl!.STATIC_DRAW);
      gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER, ibo);
      gl!.bufferData(gl!.ELEMENT_ARRAY_BUFFER, index, gl!.STATIC_DRAW);
      // corner 2, then the cell as sample.ts writes it: offset 2, color 3, bevel 3, seed 1.
      [2, 2, 3, 3, 1].reduce((offset, size, i) => {
        gl!.enableVertexAttribArray(i);
        gl!.vertexAttribPointer(i, size, gl!.FLOAT, false, floats * 4, offset * 4);
        return offset + size;
      }, 0);
      return { vao, buffers: [vbo, ibo], count: set.count };
    });
    gl!.bindVertexArray(null);
  }

  function draw(f: Frame) {
    const g = gl!;
    wall.draw(f, canvas.width, canvas.height);
    g.enable(g.BLEND);
    g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);
    g.useProgram(cell.program);
    g.uniform2f(cell.at("uView"), f.width, f.height);
    g.uniform1f(cell.at("uDpr"), f.dpr);
    g.uniform1f(cell.at("uFocal"), f.focal);
    g.uniform2f(cell.at("uTilt"), f.tilt[0], f.tilt[1]);
    g.uniform1f(cell.at("uIntro"), f.intro);
    g.uniform1f(cell.at("uTime"), f.time);
    g.uniform1f(cell.at("uMotion"), f.motion);
    g.uniform3f(cell.at("uPointer"), ...f.pointer);
    g.uniform3f(cell.at("uLight"), ...f.light);
    g.uniform1f(cell.at("uGlow"), f.glow);
    g.uniform1f(cell.at("uGap"), f.gap);
    for (const l of f.logos) {
      const set = logos[l.slot];
      if (!set) continue;
      g.uniform3f(cell.at("uCenter"), ...l.center);
      g.uniformMatrix3fv(cell.at("uRot"), false, l.rot);
      g.uniform1f(cell.at("uSize"), l.size);
      g.uniform1f(cell.at("uGrid"), l.grid);
      g.uniform1f(cell.at("uDim"), l.dim);
      g.uniform1f(cell.at("uBlur"), l.blur);
      g.uniform1f(cell.at("uDelay"), l.delay);
      g.bindVertexArray(set.vao);
      g.drawElements(g.TRIANGLES, set.count * 6, g.UNSIGNED_INT, 0);
    }
    g.bindVertexArray(null);
  }

  function dispose() {
    freeLogos();
    gl!.deleteBuffer(tri);
    gl!.deleteVertexArray(wallVao);
    wall.dispose();
    gl!.deleteProgram(cell.program);
    gl!.getExtension("WEBGL_lose_context")?.loseContext();
  }

  return { setLogos, draw, dispose };
}
