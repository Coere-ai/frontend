import { link } from "./gl";
import type { Frame } from "./renderer";
import { MAX_SPOTS, WALL_CELLS_FRAG, WALL_SHOW_FRAG, WALL_VERT } from "./shaders";

/**
 * The dim LED wall behind the logos, in two steps: its light into a texture
 * one texel a cell, then that texture drawn as squares with gaps. Shares
 * the caller's full screen triangle.
 */
export function createWall(gl: WebGL2RenderingContext, triangle: WebGLVertexArrayObject) {
  const cells = link(gl, WALL_VERT, WALL_CELLS_FRAG);
  const show = link(gl, WALL_VERT, WALL_SHOW_FRAG);
  const texture = gl.createTexture();
  const target = gl.createFramebuffer();
  let cols = 0;
  let rows = 0;
  const spots = new Float32Array(MAX_SPOTS * 4);
  const tints = new Float32Array(MAX_SPOTS * 3);

  /** Grows or shrinks the cell texture to cover the wall. */
  function fit(c: number, r: number) {
    if (c === cols && r === rows) return;
    cols = c;
    rows = r;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, c, r, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  }

  function draw(f: Frame, width: number, height: number) {
    fit(Math.ceil(f.width / f.wallCell) + 1, Math.ceil(f.height / f.wallCell) + 1);
    gl.bindVertexArray(triangle);
    gl.disable(gl.BLEND);

    gl.bindFramebuffer(gl.FRAMEBUFFER, target);
    gl.viewport(0, 0, cols, rows);
    gl.useProgram(cells.program);
    gl.uniform2f(cells.at("uView"), f.width, f.height);
    gl.uniform1f(cells.at("uCell"), f.wallCell);
    gl.uniform1f(cells.at("uTime"), f.time);
    gl.uniform1f(cells.at("uMotion"), f.motion);
    const count = Math.min(f.logos.length, MAX_SPOTS);
    for (let i = 0; i < count; i++) {
      spots.set(f.logos[i].spot, i * 4);
      tints.set(f.logos[i].tint, i * 3);
    }
    gl.uniform1i(cells.at("uCount"), count);
    gl.uniform4fv(cells.at("uSpot"), spots);
    gl.uniform3fv(cells.at("uTint"), tints);
    gl.uniform2f(cells.at("uShadow"), f.shadow[0], f.shadow[1]);
    gl.uniform3f(cells.at("uPointer"), ...f.pointer);
    gl.uniform3f(cells.at("uHaze"), ...f.haze);
    gl.uniform3f(cells.at("uSpark"), ...f.spark);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height);
    gl.useProgram(show.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(show.at("uCells"), 0);
    gl.uniform2f(show.at("uView"), f.width, f.height);
    gl.uniform1f(show.at("uDpr"), f.dpr);
    gl.uniform1f(show.at("uCell"), f.wallCell);
    gl.uniform1f(show.at("uGap"), f.gap);
    gl.uniform3f(show.at("uHaze"), ...f.haze);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function dispose() {
    gl.deleteFramebuffer(target);
    gl.deleteTexture(texture);
    gl.deleteProgram(cells.program);
    gl.deleteProgram(show.program);
  }

  return { draw, dispose };
}
